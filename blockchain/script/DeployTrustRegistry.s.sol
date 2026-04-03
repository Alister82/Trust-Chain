// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TrustRegistry.sol";

contract DeployTrustRegistry is Script {
    function run() external {
        // 1. Retrieve the private key from your environment or terminal
        // For local dev, we can hardcode the first Anvil key (NOT FOR PRODUCTION)
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

        // 2. Start recording the "Broadcast" (The actual transaction)
        vm.startBroadcast(deployerPrivateKey);

        // 3. Initialize the contract
        TrustRegistry registry = new TrustRegistry();

        // 4. Stop recording
        vm.stopBroadcast();
        
        // Log the address so we can copy it to our Frontend!
        console.log("TrustRegistry deployed at:", address(registry));
    }
}
