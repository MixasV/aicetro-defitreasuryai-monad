// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DeFiTreasuryVault
 * @notice Vault contract for holding user deposits and enabling AI-powered portfolio management
 * @dev Users deposit tokens into vault, AI agent manages portfolio via delegation
 */
contract DeFiTreasuryVault is Ownable, ReentrancyGuard {
    // State variables
    IERC20 public immutable asset; // The token this vault accepts (e.g., WMON, USDC)
    address public agentExecutor; // AI agent contract that can execute trades

    // User deposits mapping
    mapping(address => uint256) public userBalances;
    mapping(address => uint256) public shares;

    // Total supply tracking
    uint256 public totalSupply;
    uint256 public totalAssets;

    // Events
    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 amount);
    event Rebalanced(
        address indexed user,
        address indexed fromProtocol,
        address indexed toProtocol,
        uint256 amount
    );
    event AgentExecutorSet(address indexed agentExecutor);

    constructor(address _asset) Ownable(msg.sender) {
        // Allow zero address for native token (MON) support
        asset = IERC20(_asset);
    }

    /**
     * @notice Set the agent executor address (only owner)
     * @param _agentExecutor Address of the AI agent contract
     */
    function setAgentExecutor(address _agentExecutor) external onlyOwner {
        require(_agentExecutor != address(0), "Invalid executor address");
        agentExecutor = _agentExecutor;
        emit AgentExecutorSet(_agentExecutor);
    }

    /**
     * @notice User deposits assets into vault
     * @dev Matches FiYield interface: deposit(assets, receiver)
     * @param assets Amount of tokens to deposit
     * @param receiver Address that will own the deposited assets
     * @return shares Amount of shares minted
     */
    function deposit(
        uint256 assets,
        address receiver
    ) external nonReentrant returns (uint256) {
        require(assets > 0, "Amount must be > 0");
        require(receiver != address(0), "Invalid receiver");
        
        // Transfer tokens from user to vault
        require(
            asset.transferFrom(msg.sender, address(this), assets),
            "Transfer failed"
        );

        // Calculate shares (1:1 for simplicity in MVP)
        uint256 sharesToMint = assets;

        // Update balances
        userBalances[receiver] += assets;
        shares[receiver] += sharesToMint;
        totalSupply += sharesToMint;
        totalAssets += assets;

        emit Deposit(receiver, assets, sharesToMint);
        return sharesToMint;
    }

    /**
     * @notice User withdraws assets from vault
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(userBalances[msg.sender] >= amount, "Insufficient balance");

        userBalances[msg.sender] -= amount;
        shares[msg.sender] -= amount;
        totalSupply -= amount;
        totalAssets -= amount;

        require(asset.transfer(msg.sender, amount), "Transfer failed");

        emit Withdraw(msg.sender, amount);
    }

    /**
     * @notice AI agent rebalances user's portfolio
     * @dev Only callable by agentExecutor through delegation
     * @param user User whose portfolio to rebalance
     * @param fromProtocol Source protocol address
     * @param toProtocol Destination protocol address
     * @param amount Amount to rebalance
     */
    function rebalance(
        address user,
        address fromProtocol,
        address toProtocol,
        uint256 amount
    ) external {
        require(msg.sender == agentExecutor, "Only agent can rebalance");
        require(userBalances[user] >= amount, "Insufficient user balance");

        // Rebalancing logic here (withdraw from one protocol, deposit to another)
        // For MVP, just emit event to track AI operations
        // Full implementation would interact with DeFi protocols (Uniswap, Aave, etc.)

        emit Rebalanced(user, fromProtocol, toProtocol, amount);
    }

    /**
     * @notice Get user's balance in vault
     * @param user User address
     * @return User's token balance
     */
    function getBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }

    /**
     * @notice Get user's shares
     * @param user User address
     * @return User's share balance
     */
    function getShares(address user) external view returns (uint256) {
        return shares[user];
    }

    /**
     * @notice Convert assets to shares (1:1 for MVP)
     * @param assets Amount of assets
     * @return shares Equivalent shares
     */
    function convertToShares(uint256 assets) external pure returns (uint256) {
        return assets;
    }

    /**
     * @notice Convert shares to assets (1:1 for MVP)
     * @param sharesAmount Amount of shares
     * @return assets Equivalent assets
     */
    function convertToAssets(uint256 sharesAmount) external pure returns (uint256) {
        return sharesAmount;
    }

    /**
     * @notice Max deposit amount (unlimited)
     */
    function maxDeposit(address) external pure returns (uint256) {
        return type(uint256).max;
    }

    /**
     * @notice Max withdraw amount for user
     */
    function maxWithdraw(address owner) external view returns (uint256) {
        return userBalances[owner];
    }

    /**
     * @notice Preview deposit (1:1 ratio)
     */
    function previewDeposit(uint256 assets) external pure returns (uint256) {
        return assets;
    }

    /**
     * @notice Preview withdraw (1:1 ratio)
     */
    function previewWithdraw(uint256 assets) external pure returns (uint256) {
        return assets;
    }
}
