// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/core/BaseAccount.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title AITreasurySmartAccount
 * @notice ERC-4337 Smart Account with AI delegation and monitoring features
 * @dev Hybrid approach: critical events on-chain, analytics off-chain
 */
contract AITreasurySmartAccount is BaseAccount {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ============ CONSTANTS ============
    
    uint256 internal constant SIG_VALIDATION_FAILED = 1;

    // ============ STATE VARIABLES ============

    IEntryPoint private immutable _entryPoint;
    address public owner;
    
    // Daily limit tracking
    uint256 public dailyLimitUsd;
    uint256 public spentTodayUsd;
    uint256 public lastResetTime;
    
    // Delegation
    address public aiAgent;
    bool public delegationActive;
    uint256 public delegationValidUntil;

    // ============ EVENTS (Hybrid Approach) ============
    
    /**
     * @notice Critical: Daily limit tracking (ON-CHAIN)
     * @dev Envio indexes this for real-time monitoring
     */
    event DailyLimitUpdated(
        uint256 spentToday,
        uint256 remainingLimit,
        uint256 resetTime
    );
    
    /**
     * @notice Critical: Emergency revoke (ON-CHAIN)
     * @dev Tracks who revoked and why for audit trail
     */
    event EmergencyRevoke(
        address indexed revokedBy,
        string reason,
        uint256 timestamp
    );
    
    /**
     * @notice Critical: High risk alert (ON-CHAIN)
     * @dev Warns about potentially dangerous operations
     */
    event HighRiskAlert(
        address indexed protocol,
        uint256 estimatedLossUsd,
        string alertType,
        uint256 timestamp
    );

    /**
     * @notice Owner changed
     */
    event OwnerChanged(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @notice Delegation configured
     */
    event DelegationConfigured(
        address indexed aiAgent,
        uint256 dailyLimitUsd,
        uint256 validUntil
    );

    // ============ ERRORS ============
    
    error NotOwner();
    error NotOwnerOrEntryPoint();
    error DelegationExpired();
    error DailyLimitExceeded(uint256 attempted, uint256 remaining);
    error InvalidAgent();
    error InvalidLimit();

    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(IEntryPoint anEntryPoint, address initialOwner) {
        _entryPoint = anEntryPoint;
        owner = initialOwner;
        lastResetTime = block.timestamp;
    }

    // ============ ERC-4337 REQUIRED FUNCTIONS ============
    
    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }

    /**
     * @notice Validate signature for UserOperation
     * @dev Checks if signed by owner or delegated AI agent
     */
    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual override returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        address signer = hash.recover(userOp.signature);
        
        // Check if signed by owner
        if (signer == owner) {
            return 0; // Valid
        }
        
        // Check if signed by AI agent with active delegation
        if (signer == aiAgent && delegationActive && block.timestamp <= delegationValidUntil) {
            return 0; // Valid
        }
        
        return SIG_VALIDATION_FAILED;
    }

    // ============ EXECUTION ============
    
    /**
     * @notice Execute a transaction
     * @dev Called by EntryPoint, tracks daily limits
     */
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external {
        _requireFromEntryPointOrOwner();
        _call(dest, value, func);
    }

    /**
     * @notice Execute a batch of transactions
     */
    function executeBatch(
        address[] calldata dest,
        uint256[] calldata value,
        bytes[] calldata func
    ) external {
        _requireFromEntryPointOrOwner();
        require(dest.length == func.length && dest.length == value.length, "Length mismatch");
        
        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], value[i], func[i]);
        }
    }

    /**
     * @notice Internal call function
     */
    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    // ============ DELEGATION MANAGEMENT ============
    
    /**
     * @notice Configure delegation for AI agent
     * @param _aiAgent Address of AI agent
     * @param _dailyLimitUsd Daily spending limit in USD (with 6 decimals)
     * @param _validDays Number of days delegation is valid
     */
    function configureDelegation(
        address _aiAgent,
        uint256 _dailyLimitUsd,
        uint256 _validDays
    ) external onlyOwner {
        if (_aiAgent == address(0)) revert InvalidAgent();
        if (_dailyLimitUsd == 0) revert InvalidLimit();
        
        aiAgent = _aiAgent;
        dailyLimitUsd = _dailyLimitUsd;
        delegationActive = true;
        delegationValidUntil = block.timestamp + (_validDays * 1 days);
        
        // Reset daily spending
        spentTodayUsd = 0;
        lastResetTime = block.timestamp;
        
        emit DelegationConfigured(_aiAgent, _dailyLimitUsd, delegationValidUntil);
        emit DailyLimitUpdated(0, _dailyLimitUsd, lastResetTime + 1 days);
    }

    /**
     * @notice Revoke delegation (normal)
     */
    function revokeDelegation() external onlyOwner {
        delegationActive = false;
        emit EmergencyRevoke(msg.sender, "user_initiated", block.timestamp);
    }

    /**
     * @notice Emergency revoke with reason
     * @dev Can be called by owner or EntryPoint (for automated checks)
     */
    function emergencyRevoke(string calldata reason) external {
        _requireFromEntryPointOrOwner();
        delegationActive = false;
        emit EmergencyRevoke(msg.sender, reason, block.timestamp);
    }

    // ============ DAILY LIMIT TRACKING ============
    
    /**
     * @notice Update daily spending (called by off-chain enrichment)
     * @param amountUsd Amount spent in USD (with 6 decimals)
     */
    function recordSpending(uint256 amountUsd) external {
        _requireFromEntryPointOrOwner();
        
        // Reset if new day
        if (block.timestamp >= lastResetTime + 1 days) {
            spentTodayUsd = 0;
            lastResetTime = block.timestamp;
        }
        
        // Check limit
        uint256 newSpent = spentTodayUsd + amountUsd;
        if (newSpent > dailyLimitUsd) {
            revert DailyLimitExceeded(newSpent, dailyLimitUsd - spentTodayUsd);
        }
        
        spentTodayUsd = newSpent;
        
        // Emit event for Envio
        emit DailyLimitUpdated(
            spentTodayUsd,
            dailyLimitUsd - spentTodayUsd,
            lastResetTime + 1 days
        );
        
        // Auto-revoke if limit exceeded
        if (spentTodayUsd >= dailyLimitUsd) {
            delegationActive = false;
            emit EmergencyRevoke(address(this), "daily_limit_exceeded", block.timestamp);
        }
    }

    /**
     * @notice Emit risk alert (called by off-chain risk checker)
     * @param protocol Protocol address
     * @param estimatedLossUsd Estimated loss in USD
     * @param alertType Type of alert (e.g., "high_slippage", "low_liquidity")
     */
    function emitRiskAlert(
        address protocol,
        uint256 estimatedLossUsd,
        string calldata alertType
    ) external {
        _requireFromEntryPointOrOwner();
        emit HighRiskAlert(protocol, estimatedLossUsd, alertType, block.timestamp);
    }

    // ============ OWNER MANAGEMENT ============
    
    /**
     * @notice Change owner
     */
    function changeOwner(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAgent();
        address oldOwner = owner;
        owner = newOwner;
        emit OwnerChanged(oldOwner, newOwner);
    }

    // ============ HELPERS ============
    
    function _requireFromEntryPointOrOwner() internal view {
        if (msg.sender != address(entryPoint()) && msg.sender != owner) {
            revert NotOwnerOrEntryPoint();
        }
    }

    /**
     * @notice Get current daily limit status
     */
    function getDailyLimitStatus() external view returns (
        uint256 limit,
        uint256 spent,
        uint256 remaining,
        uint256 resetTime
    ) {
        // Check if should reset
        if (block.timestamp >= lastResetTime + 1 days) {
            return (dailyLimitUsd, 0, dailyLimitUsd, block.timestamp + 1 days);
        }
        
        return (
            dailyLimitUsd,
            spentTodayUsd,
            dailyLimitUsd > spentTodayUsd ? dailyLimitUsd - spentTodayUsd : 0,
            lastResetTime + 1 days
        );
    }

    /**
     * @notice Check if delegation is currently active
     */
    function isDelegationActive() external view returns (bool) {
        return delegationActive && block.timestamp <= delegationValidUntil;
    }

    // ============ RECEIVE ETH ============
    
    receive() external payable {}
}
