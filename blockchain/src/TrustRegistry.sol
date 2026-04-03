// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustRegistry {
    address public governmentOfficial; // The only account allowed to "seal" docs

    mapping(string => bytes32) public verifiedDocuments;
    event DocumentAnchored(string indexed did, bytes32 documentHash);

    // This runs once when the contract is deployed
    constructor() {
        governmentOfficial = msg.sender; 
    }

    // A "Modifier" is a guard that checks a condition before running a function
    modifier onlyGovernment() {
        require(msg.sender == governmentOfficial, "Not authorized: Only Govt can anchor.");
        _;
    }

    function anchorDocument(string memory _did, bytes32 _docHash) public onlyGovernment {
        verifiedDocuments[_did] = _docHash;
        emit DocumentAnchored(_did, _docHash);
    }

    function getDocumentHash(string memory _did) public view returns (bytes32) {
        return verifiedDocuments[_did];
    }
}
