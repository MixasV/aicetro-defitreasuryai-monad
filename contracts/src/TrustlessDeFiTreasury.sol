// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title TrustlessDeFiTreasury
 * @notice Trustless delegation manager that allows corporate smart accounts to
 *         grant limited permissions to AI agents without introducing admin
 *         backdoors. All state changes are initiated by the user smart account
 *         itself and can be revoked instantly.
 */
contract TrustlessDeFiTreasury {
    using Address for address;

    struct DelegationConfig {
        address aiAgent;
        uint256 dailyLimitUSD;
        uint256 spentToday;
        uint256 lastResetTime;
        uint256 validUntil;
        bool isActive;
        address[] allowedProtocols;
    }

    struct DelegationView {
        address aiAgent;
        uint256 dailyLimitUSD;
        uint256 spentToday;
        uint256 lastResetTime;
        uint256 validUntil;
        bool isActive;
        address[] allowedProtocols;
    }

    error NoDelegationConfigured(address user);
    error DelegationInactive(address user);
    error DelegationExpired(uint256 validUntil);
    error DailyLimitExceeded(uint256 attempted, uint256 available);
    error ProtocolNotAllowed(address protocol);
    error InvalidAgent(address agent);
    error InvalidProtocol(address protocol);
    error ExecutionFailed(address protocol, bytes errorData);

    mapping(address => DelegationConfig) private _delegations;
    mapping(address => mapping(address => bool)) private _allowedProtocols;

    event DelegationGranted(
        address indexed user,
        address indexed aiAgent,
        uint256 dailyLimitUSD,
        uint256 validUntil,
        address[] protocolWhitelist
    );

    event DelegationUpdated(
        address indexed user,
        address indexed aiAgent,
        uint256 dailyLimitUSD,
        uint256 validUntil,
        address[] protocolWhitelist
    );

    event DelegationRevoked(address indexed user, address indexed aiAgent);
    event DelegationPaused(address indexed user);
    event DelegationResumed(address indexed user, uint256 validUntil);
    event SpendRecorded(address indexed user, address indexed protocol, uint256 valueUsd, uint256 spentToday);

    modifier onlyUser(address user) {
        require(msg.sender == user, "Only user smart account");
        _;
    }

    modifier onlyAuthorizedAgent(address user) {
        DelegationConfig storage config = _delegations[user];
        if (config.aiAgent == address(0)) {
            revert NoDelegationConfigured(user);
        }
        if (!config.isActive) {
            revert DelegationInactive(user);
        }
        if (config.aiAgent != msg.sender) {
            revert InvalidAgent(msg.sender);
        }
        if (block.timestamp > config.validUntil) {
            revert DelegationExpired(config.validUntil);
        }
        _;
    }

    function grantDelegation(
        address aiAgent,
        uint256 dailyLimitUSD,
        address[] calldata protocolWhitelist,
        uint256 validUntil
    ) external {
        if (aiAgent == address(0)) {
            revert InvalidAgent(aiAgent);
        }
        require(dailyLimitUSD > 0, "Invalid daily limit");
        require(validUntil > block.timestamp, "Invalid validity");
        require(protocolWhitelist.length > 0, "Protocols required");

        DelegationConfig storage config = _delegations[msg.sender];
        bool wasConfigured = config.aiAgent != address(0);
        _clearAllowedProtocols(msg.sender, config.allowedProtocols);

        config.aiAgent = aiAgent;
        config.dailyLimitUSD = dailyLimitUSD;
        config.spentToday = 0;
        config.lastResetTime = block.timestamp;
        config.validUntil = validUntil;
        config.isActive = true;

        _setAllowedProtocols(msg.sender, protocolWhitelist, config);

        if (wasConfigured) {
            emit DelegationUpdated(msg.sender, aiAgent, dailyLimitUSD, validUntil, config.allowedProtocols);
        } else {
            emit DelegationGranted(msg.sender, aiAgent, dailyLimitUSD, validUntil, config.allowedProtocols);
        }
    }

    function updateDelegation(
        uint256 dailyLimitUSD,
        address[] calldata protocolWhitelist,
        uint256 validUntil
    ) external {
        DelegationConfig storage config = _delegations[msg.sender];
        if (config.aiAgent == address(0)) {
            revert NoDelegationConfigured(msg.sender);
        }

        require(dailyLimitUSD > 0, "Invalid daily limit");
        require(validUntil > block.timestamp, "Invalid validity");
        require(protocolWhitelist.length > 0, "Protocols required");

        _clearAllowedProtocols(msg.sender, config.allowedProtocols);

        config.dailyLimitUSD = dailyLimitUSD;
        config.validUntil = validUntil;
        config.spentToday = 0;
        config.lastResetTime = block.timestamp;
        config.isActive = true;

        _setAllowedProtocols(msg.sender, protocolWhitelist, config);

        emit DelegationUpdated(msg.sender, config.aiAgent, dailyLimitUSD, validUntil, config.allowedProtocols);
    }

    function resumeDelegation(uint256 validUntil) external {
        DelegationConfig storage config = _delegations[msg.sender];
        if (config.aiAgent == address(0)) {
            revert NoDelegationConfigured(msg.sender);
        }

        require(validUntil > block.timestamp, "Invalid validity");

        config.validUntil = validUntil;
        config.isActive = true;
        emit DelegationResumed(msg.sender, validUntil);
    }

    function revokeDelegation() external {
        DelegationConfig storage config = _delegations[msg.sender];
        if (config.aiAgent == address(0)) {
            revert NoDelegationConfigured(msg.sender);
        }

        address agent = config.aiAgent;
        _clearAllowedProtocols(msg.sender, config.allowedProtocols);
        delete _delegations[msg.sender];
        emit DelegationRevoked(msg.sender, agent);
    }

    function emergencyStop() external {
        DelegationConfig storage config = _delegations[msg.sender];
        if (config.aiAgent == address(0)) {
            revert NoDelegationConfigured(msg.sender);
        }
        config.isActive = false;
        emit DelegationPaused(msg.sender);
    }

    function executeForUser(
        address user,
        address protocol,
        bytes calldata data,
        uint256 valueUsd
    ) external payable onlyAuthorizedAgent(user) returns (bytes memory result) {
        if (protocol == address(0)) {
            revert InvalidProtocol(protocol);
        }
        if (!_allowedProtocols[user][protocol]) {
            revert ProtocolNotAllowed(protocol);
        }

        DelegationConfig storage config = _delegations[user];
        _resetDailySpend(config);

        if (config.spentToday + valueUsd > config.dailyLimitUSD) {
            revert DailyLimitExceeded(valueUsd, config.dailyLimitUSD - config.spentToday);
        }

        config.spentToday += valueUsd;

        bool success;
        (success, result) = protocol.call{value: msg.value}(data);

        if (!success) {
            revert ExecutionFailed(protocol, result);
        }

        emit SpendRecorded(user, protocol, valueUsd, config.spentToday);
        return result;
    }

    function getDelegation(address user) external view returns (DelegationView memory) {
        DelegationConfig storage config = _delegations[user];
        if (config.aiAgent == address(0)) {
            revert NoDelegationConfigured(user);
        }

        return DelegationView({
            aiAgent: config.aiAgent,
            dailyLimitUSD: config.dailyLimitUSD,
            spentToday: config.spentToday,
            lastResetTime: config.lastResetTime,
            validUntil: config.validUntil,
            isActive: config.isActive && block.timestamp <= config.validUntil,
            allowedProtocols: config.allowedProtocols
        });
    }

    function isDelegationActive(address user) external view returns (bool) {
        DelegationConfig storage config = _delegations[user];
        return config.aiAgent != address(0) && config.isActive && block.timestamp <= config.validUntil;
    }

    function isProtocolAllowed(address user, address protocol) external view returns (bool) {
        return _allowedProtocols[user][protocol];
    }

    function remainingAllowance(address user) external view returns (uint256) {
        DelegationConfig storage config = _delegations[user];
        if (config.aiAgent == address(0)) return 0;

        if (block.timestamp > config.lastResetTime + 1 days) {
            return config.dailyLimitUSD;
        }

        if (config.spentToday >= config.dailyLimitUSD) {
            return 0;
        }

        return config.dailyLimitUSD - config.spentToday;
    }

    function allowedProtocols(address user) external view returns (address[] memory) {
        DelegationConfig storage config = _delegations[user];
        return config.allowedProtocols;
    }

    function _resetDailySpend(DelegationConfig storage config) private {
        if (block.timestamp > config.lastResetTime + 1 days) {
            config.spentToday = 0;
            config.lastResetTime = block.timestamp;
        }
    }

    function _clearAllowedProtocols(address user, address[] storage protocols) private {
        uint256 length = protocols.length;
        for (uint256 i = 0; i < length; i++) {
            address protocol = protocols[i];
            if (protocol != address(0)) {
                _allowedProtocols[user][protocol] = false;
            }
        }
        delete _delegations[user].allowedProtocols;
    }

    function _setAllowedProtocols(
        address user,
        address[] calldata protocols,
        DelegationConfig storage config
    ) private {
        address[] storage storageList = config.allowedProtocols;
        uint256 length = protocols.length;

        for (uint256 i = 0; i < length; i++) {
            address protocol = protocols[i];
            if (protocol == address(0)) {
                revert InvalidProtocol(protocol);
            }
            if (!_allowedProtocols[user][protocol]) {
                _allowedProtocols[user][protocol] = true;
                storageList.push(protocol);
            }
        }
    }

    receive() external payable {}
}
