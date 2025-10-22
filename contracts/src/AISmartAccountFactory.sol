// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AITreasurySmartAccount.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@openzeppelin/contracts/utils/Create2.sol";

/**
 * @title AISmartAccountFactory
 * @notice Factory for deploying AI Treasury Smart Accounts
 */
contract AISmartAccountFactory {
    IEntryPoint public immutable entryPoint;

    event AccountCreated(
        address indexed account,
        address indexed owner,
        uint256 salt
    );

    constructor(IEntryPoint _entryPoint) {
        entryPoint = _entryPoint;
    }

    /**
     * @notice Create a new Smart Account
     * @param owner Owner of the account
     * @param salt Salt for CREATE2
     * @return account Address of created account
     */
    function createAccount(
        address owner,
        uint256 salt
    ) external returns (address account) {
        bytes memory bytecode = abi.encodePacked(
            type(AITreasurySmartAccount).creationCode,
            abi.encode(entryPoint, owner)
        );
        
        bytes32 salt32 = bytes32(salt);
        account = Create2.computeAddress(salt32, keccak256(bytecode));
        
        // Check if already deployed
        uint256 codeSize = account.code.length;
        if (codeSize > 0) {
            return account;
        }
        
        // Deploy
        account = Create2.deploy(0, salt32, bytecode);
        
        emit AccountCreated(account, owner, salt);
    }

    /**
     * @notice Get address of account that would be created
     * @param owner Owner address
     * @param salt Salt for CREATE2
     * @return account Predicted address
     */
    function getAddress(
        address owner,
        uint256 salt
    ) external view returns (address account) {
        bytes memory bytecode = abi.encodePacked(
            type(AITreasurySmartAccount).creationCode,
            abi.encode(entryPoint, owner)
        );
        
        return Create2.computeAddress(bytes32(salt), keccak256(bytecode));
    }
}
