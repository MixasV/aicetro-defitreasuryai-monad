// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@account-abstraction/contracts/core/BasePaymaster.sol";

/**
 * Simple Paymaster for AIcetro - Minimal Implementation
 * 
 * Платит за все UserOperations без проверок.
 * Пополняется через deposit(), выводится через withdrawTo() (уже есть в BasePaymaster).
 */
contract SimplePaymaster is BasePaymaster {
    
    event UserOperationSponsored(address indexed sender, uint256 actualGasCost);
    
    constructor(IEntryPoint _entryPoint) BasePaymaster(_entryPoint) {}
    
    /**
     * Validate: всегда разрешаем (платим за всех)
     */
    function _validatePaymasterUserOp(
        PackedUserOperation calldata,
        bytes32,
        uint256 maxCost
    ) internal view override returns (bytes memory context, uint256 validationData) {
        // Проверяем баланс
        require(getDeposit() >= maxCost, "Insufficient balance");
        
        // Всегда разрешаем
        return ("", 0);
    }
    
    /**
     * Post-op: логируем
     */
    function _postOp(
        PostOpMode,
        bytes calldata,
        uint256 actualGasCost,
        uint256
    ) internal override {
        emit UserOperationSponsored(tx.origin, actualGasCost);
    }
    
    /**
     * deposit() и getDeposit() уже есть в BasePaymaster
     * withdrawTo() тоже есть (только owner)
     */
}
