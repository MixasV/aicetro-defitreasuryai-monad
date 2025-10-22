// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/metamask-delegation/EIP7702/EIP7702StatelessDeleGator.sol";
import "../src/metamask-delegation/DelegationManager.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

/**
 * Deploy EIP7702StatelessDeleGator Implementation
 * 
 * This contract is deployed ONCE and used by ALL users for EIP-7702 delegation.
 * User EOAs authorize to this contract via tx type 0x04.
 * After authorization: User EOA = User Smart Account (same address!)
 * 
 * Usage:
 *   source .env
 *   forge script script/DeployEIP7702Stateless.s.sol --rpc-url $MONAD_RPC_URL --broadcast --legacy
 */
contract DeployEIP7702Stateless is Script {
    function run() external {
        console.log("Deploying EIP7702StatelessDeleGator on Monad Testnet...");
        console.log("");

        // Get addresses from environment
        address delegationManager = vm.envAddress("METAMASK_DELEGATION_MANAGER");
        address entryPoint = vm.envAddress("METAMASK_ENTRY_POINT");
        
        console.log("Using addresses:");
        console.log("  DelegationManager:", delegationManager);
        console.log("  EntryPoint:", entryPoint);
        console.log("");

        // Get deployer from encrypted key (decrypted externally)
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY_DECRYPTED");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deployer:", deployer);
        uint256 balance = deployer.balance;
        console.log("Balance:", balance / 1e18, "MON");
        console.log("");

        require(balance >= 0.5 ether, "Insufficient balance! Need >= 0.5 MON");

        // Deploy
        vm.startBroadcast(deployerPrivateKey);
        
        EIP7702StatelessDeleGator stateless = new EIP7702StatelessDeleGator(
            IDelegationManager(delegationManager),
            IEntryPoint(entryPoint)
        );
        
        vm.stopBroadcast();

        address statelessAddress = address(stateless);
        console.log("EIP7702StatelessDeleGator deployed at:", statelessAddress);
        console.log("");
        
        // Verify deployment
        string memory name = stateless.NAME();
        string memory version = stateless.VERSION();
        console.log("Contract name:", name);
        console.log("Contract version:", version);
        console.log("");
        
        console.log("Add to .env:");
        console.log("METAMASK_STATELESS_7702=", statelessAddress);
        console.log("NEXT_PUBLIC_METAMASK_STATELESS_7702=", statelessAddress);
        console.log("");
        console.log("Deployment complete!");
    }
}
