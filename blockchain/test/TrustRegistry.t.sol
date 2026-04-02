
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "src/TrustRegistry.sol";

contract TrustRegistryTest is Test {
    TrustRegistry public registry;

    function setUp() public {
        registry = new TrustRegistry();
    }

    function testAnchorAndRetrieve() public {
        string memory myDID = "did:ethr:0x123";
        bytes32 mockHash = keccak256(abi.encodePacked("My Secret Document"));

        // Act
        registry.anchorDocument(myDID, mockHash);

        // Assert
        bytes32 storedHash = registry.getDocumentHash(myDID);
        assertEq(storedHash, mockHash);
    }
}
