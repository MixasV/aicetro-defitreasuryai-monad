// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract CorporateTreasuryManager {
    using EnumerableSet for EnumerableSet.AddressSet;

    struct CorporateAccount {
        address smartAccount;
        uint256 threshold;
        EnumerableSet.AddressSet owners;
        uint256 createdAt;
    }

    struct DelegationConfig {
        address delegate;
        uint256 dailyLimit;
        uint256 spent24h;
        uint256 windowStart;
        EnumerableSet.AddressSet allowedProtocols;
        bool active;
    }

    mapping(address => CorporateAccount) private accounts;
    mapping(address => DelegationConfig) private delegations;

    event CorporateAccountCreated(address indexed account, address[] owners, uint256 threshold);
    event DelegationUpdated(address indexed account, address delegate, uint256 limit, bool active);
    event DelegationSpending(address indexed account, uint256 amount, uint256 newSpent);

    modifier onlyAccountOwner(address account) {
        require(accounts[account].owners.contains(msg.sender), "Not owner");
        _;
    }

    function createCorporateAccount(address smartAccount, address[] calldata owners, uint256 threshold) external {
        require(owners.length >= threshold, "Invalid threshold");
        CorporateAccount storage acc = accounts[smartAccount];
        require(acc.smartAccount == address(0), "Already exists");

        acc.smartAccount = smartAccount;
        acc.threshold = threshold;
        acc.createdAt = block.timestamp;

        for (uint256 i = 0; i < owners.length; i++) {
            acc.owners.add(owners[i]);
        }

        emit CorporateAccountCreated(smartAccount, owners, threshold);
    }

    function setDelegation(
        address account,
        address delegate,
        uint256 dailyLimit,
        address[] calldata allowedProtocols,
        bool active
    ) external onlyAccountOwner(account) {
        DelegationConfig storage config = delegations[account];
        config.delegate = delegate;
        config.dailyLimit = dailyLimit;
        config.active = active;

        uint256 length = config.allowedProtocols.length();
        for (uint256 i = 0; i < length; i++) {
            address addr = config.allowedProtocols.at(0);
            config.allowedProtocols.remove(addr);
        }

        for (uint256 i = 0; i < allowedProtocols.length; i++) {
            config.allowedProtocols.add(allowedProtocols[i]);
        }

        config.windowStart = block.timestamp;
        config.spent24h = 0;

        emit DelegationUpdated(account, delegate, dailyLimit, active);
    }

    function recordSpending(address account, uint256 amount) external {
        DelegationConfig storage config = delegations[account];
        require(msg.sender == config.delegate, "Only delegate");
        require(config.active, "Delegation not active");

        if (block.timestamp - config.windowStart >= 1 days) {
            config.windowStart = block.timestamp;
            config.spent24h = 0;
        }

        require(config.spent24h + amount <= config.dailyLimit, "Daily limit exceeded");
        config.spent24h += amount;

        emit DelegationSpending(account, amount, config.spent24h);
    }

    function getDelegation(address account)
        external
        view
        returns (address delegate, uint256 dailyLimit, uint256 spent24h, bool active, address[] memory whitelist)
    {
        DelegationConfig storage config = delegations[account];
        whitelist = config.allowedProtocols.values();
        return (config.delegate, config.dailyLimit, config.spent24h, config.active, whitelist);
    }
}
