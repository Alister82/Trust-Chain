// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustRegistry {
    mapping(string => bytes32) private documentHashes;

    function anchorDocument(string memory did, bytes32 hash) public {
        documentHashes[did] = hash;
    }

    function getDocumentHash(string memory did) public view returns (bytes32) {
        return documentHashes[did];
    }
}
