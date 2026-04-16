// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustRegistry {
    enum Role {
        NONE,
        CITIZEN,
        ISSUER,
        VERIFIER
    }

    struct UserProfile {
        Role role;
        bool isApproved;
        string departmentName;
    }

    struct Issuer {
        string name;
        bool isApproved;
        bool exists;
        bool isRejected;
    }

    struct Verifier {
        string name;
        bool isApproved;
        bool exists;
        bool isRejected;
    }

    struct VerificationRequest {
        uint256 id;
        address citizen;
        address issuer;
        bytes32 documentHash;
        string ipfsHash;
        string documentType;
        uint256 timestamp;
        bool isAnchored;
        bool isRejected;
    }

    struct AnchoredDocument {
        bytes32 documentHash;
        address issuer;
        bytes signature;
        uint256 anchoredAt;
    }

    address public immutable admin;

    mapping(address => UserProfile) public users;
    mapping(address => Issuer) public issuers;
    mapping(address => Verifier) public verifiers;
    mapping(address => bool) public isAuthorizedIssuer;
    mapping(address => bool) public isAuthorizedVerifier;

    mapping(uint256 => VerificationRequest) public verificationRequests;
    uint256 public nextRequestId;

    mapping(address => AnchoredDocument) public anchoredDocuments;

    address[] private issuerApplications;
    address[] private verifierApplications;
    address[] private approvedIssuers;
    mapping(address => bool) private issuerApplicationTracked;
    mapping(address => bool) private verifierApplicationTracked;

    event CitizenRegistered(address indexed citizen);
    event IssuerApplied(address indexed applicant);
    event VerifierApplied(address indexed applicant);
    event IssuerApproved(address indexed issuer);
    event VerifierApproved(address indexed verifier);
    event IssuerRejected(address indexed applicant);
    event VerifierRejected(address indexed applicant);
    event VerificationRequested(uint256 indexed requestId, address indexed citizen, address indexed issuer, bytes32 documentHash, string ipfsHash, string documentType);
    event RequestRejected(uint256 indexed requestId);
    event DocumentAnchored(address indexed citizenDid, address indexed issuer, bytes32 documentHash, bytes signature);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyApprovedCitizen() {
        UserProfile memory profile = users[msg.sender];
        require(profile.role == Role.CITIZEN && profile.isApproved, "Citizen role required");
        _;
    }

    modifier onlyApprovedIssuer() {
        require(isAuthorizedIssuer[msg.sender], "Approved issuer required");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerCitizen() external {
        require(users[msg.sender].role == Role.NONE, "Already registered");
        users[msg.sender] = UserProfile({role: Role.CITIZEN, isApproved: true, departmentName: ""});
        emit CitizenRegistered(msg.sender);
    }

    function applyIssuer(string calldata _name) external {
        require(bytes(_name).length > 0, "Name required");
        require(users[msg.sender].role == Role.NONE, "Already registered");
        
        // Flat Assignment
        issuers[msg.sender] = Issuer({name: _name, isApproved: false, exists: true, isRejected: false});
        users[msg.sender] = UserProfile({role: Role.ISSUER, isApproved: false, departmentName: _name});
        // Only push once per address to avoid duplicates after reject+re-apply
        if (!issuerApplicationTracked[msg.sender]) {
            issuerApplications.push(msg.sender);
            issuerApplicationTracked[msg.sender] = true;
        }
        
        emit IssuerApplied(msg.sender);
    }

    function applyVerifier(string calldata _name) external {
        require(bytes(_name).length > 0, "Name required");
        require(users[msg.sender].role == Role.NONE, "Already registered");
        
        // Flat Assignment
        verifiers[msg.sender] = Verifier({name: _name, isApproved: false, exists: true, isRejected: false});
        users[msg.sender] = UserProfile({role: Role.VERIFIER, isApproved: false, departmentName: _name});
        // Only push once per address to avoid duplicates after reject+re-apply
        if (!verifierApplicationTracked[msg.sender]) {
            verifierApplications.push(msg.sender);
            verifierApplicationTracked[msg.sender] = true;
        }
        
        emit VerifierApplied(msg.sender);
    }

    function approveIssuer(address applicant) external onlyAdmin {
        UserProfile storage profile = users[applicant];
        require(profile.role == Role.ISSUER, "Not issuer applicant");
        require(!profile.isApproved, "Already approved");
        profile.isApproved = true;
        if (issuers[applicant].exists) {
            issuers[applicant].isApproved = true;
        }
        isAuthorizedIssuer[applicant] = true;
        approvedIssuers.push(applicant);
        emit IssuerApproved(applicant);
    }

    function approveVerifier(address applicant) external onlyAdmin {
        UserProfile storage profile = users[applicant];
        require(profile.role == Role.VERIFIER, "Not verifier applicant");
        require(!profile.isApproved, "Already approved");
        profile.isApproved = true;
        if (verifiers[applicant].exists) {
            verifiers[applicant].isApproved = true;
        }
        isAuthorizedVerifier[applicant] = true;
        emit VerifierApproved(applicant);
    }

    function rejectIssuer(address applicant) external onlyAdmin {
        require(issuers[applicant].exists, "Not issuer applicant");
        require(!issuers[applicant].isApproved, "Already approved");
        require(!issuers[applicant].isRejected, "Already rejected");
        issuers[applicant].isRejected = true;
        users[applicant].role = Role.NONE;
        emit IssuerRejected(applicant);
    }

    function rejectVerifier(address applicant) external onlyAdmin {
        require(verifiers[applicant].exists, "Not verifier applicant");
        require(!verifiers[applicant].isApproved, "Already approved");
        require(!verifiers[applicant].isRejected, "Already rejected");
        verifiers[applicant].isRejected = true;
        users[applicant].role = Role.NONE;
        emit VerifierRejected(applicant);
    }

    function requestVerification(address issuer, bytes32 documentHash, string calldata ipfsHash, string calldata _documentType) external onlyApprovedCitizen returns (uint256 requestId) {
        require(isAuthorizedIssuer[issuer], "Issuer not approved");

        requestId = nextRequestId;
        verificationRequests[requestId] = VerificationRequest({
            id: requestId,
            citizen: msg.sender,
            issuer: issuer,
            documentHash: documentHash,
            ipfsHash: ipfsHash,
            documentType: _documentType,
            timestamp: block.timestamp,
            isAnchored: false,
            isRejected: false
        });
        nextRequestId += 1;

        emit VerificationRequested(requestId, msg.sender, issuer, documentHash, ipfsHash, _documentType);
    }

    function rejectRequest(uint256 requestId) external onlyApprovedIssuer {
        VerificationRequest storage req = verificationRequests[requestId];
        require(req.issuer == msg.sender, "Not assigned issuer");
        require(!req.isAnchored, "Request already processed");
        
        req.isAnchored = true;
        req.isRejected = true;
        
        emit RequestRejected(requestId);
    }

    function anchorDocument(bytes32 documentHash, address citizenDid, string calldata newIPFSCID, bytes calldata signature) external onlyApprovedIssuer {
        require(users[citizenDid].role == Role.CITIZEN, "Citizen not registered");

        bool matchedPendingRequest = false;
        for (uint256 i = 0; i < nextRequestId; i++) {
            VerificationRequest storage req = verificationRequests[i];
            if (!req.isAnchored && req.issuer == msg.sender && req.citizen == citizenDid && req.documentHash == documentHash) {
                req.isAnchored = true;
                req.ipfsHash = newIPFSCID; // Sever Issuer Access instantly by replacing the IPFS link
                matchedPendingRequest = true;
                break;
            }
        }
        require(matchedPendingRequest, "No matching pending request");

        anchoredDocuments[citizenDid] = AnchoredDocument({
            documentHash: documentHash,
            issuer: msg.sender,
            signature: signature,
            anchoredAt: block.timestamp
        });

        emit DocumentAnchored(citizenDid, msg.sender, documentHash, signature);
    }

    function getUserRole(address user) external view returns (Role role, bool isApproved, string memory departmentName) {
        UserProfile memory profile = users[user];
        return (profile.role, profile.isApproved, profile.departmentName);
    }

    function getApprovedIssuers() external view returns (address[] memory) {
        return approvedIssuers;
    }

    struct IssuerInfo {
        address addr;
        string name;
    }

    function getApprovedIssuersDetails() external view returns (IssuerInfo[] memory) {
        IssuerInfo[] memory details = new IssuerInfo[](approvedIssuers.length);
        for (uint256 i = 0; i < approvedIssuers.length; i++) {
            address addr = approvedIssuers[i];
            details[i] = IssuerInfo(addr, users[addr].departmentName);
        }
        return details;
    }

    function getIssuerApplications() external view onlyAdmin returns (address[] memory) {
        return issuerApplications;
    }

    function getIssuerApplicationDetails() external view onlyAdmin returns (IssuerInfo[] memory) {
        uint256 count;
        for (uint256 i = 0; i < issuerApplications.length; i++) {
            address addr = issuerApplications[i];
            if (issuers[addr].exists && !issuers[addr].isApproved && !issuers[addr].isRejected) {
                count++;
            }
        }
        
        IssuerInfo[] memory details = new IssuerInfo[](count);
        uint256 idx;
        for (uint256 i = 0; i < issuerApplications.length; i++) {
            address addr = issuerApplications[i];
            if (issuers[addr].exists && !issuers[addr].isApproved && !issuers[addr].isRejected) {
                details[idx] = IssuerInfo(addr, issuers[addr].name);
                idx++;
            }
        }
        return details;
    }

    function getVerifierApplications() external view onlyAdmin returns (address[] memory) {
        return verifierApplications;
    }

    function getVerifierApplicationDetails() external view onlyAdmin returns (IssuerInfo[] memory) {
        uint256 count;
        for (uint256 i = 0; i < verifierApplications.length; i++) {
            address addr = verifierApplications[i];
            if (verifiers[addr].exists && !verifiers[addr].isApproved && !verifiers[addr].isRejected) {
                count++;
            }
        }
        
        IssuerInfo[] memory details = new IssuerInfo[](count);
        uint256 idx;
        for (uint256 i = 0; i < verifierApplications.length; i++) {
            address addr = verifierApplications[i];
            if (verifiers[addr].exists && !verifiers[addr].isApproved && !verifiers[addr].isRejected) {
                details[idx] = IssuerInfo(addr, verifiers[addr].name);
                idx++;
            }
        }
        return details;
    }

    function getIssuerPendingRequests(address issuer) external view returns (VerificationRequest[] memory) {
        uint256 count;
        for (uint256 i = 0; i < nextRequestId; i++) {
            VerificationRequest storage req = verificationRequests[i];
            if (req.issuer == issuer && !req.isAnchored) {
                count++;
            }
        }

        VerificationRequest[] memory pending = new VerificationRequest[](count);
        uint256 idx;
        for (uint256 i = 0; i < nextRequestId; i++) {
            VerificationRequest storage req = verificationRequests[i];
            if (req.issuer == issuer && !req.isAnchored) {
                pending[idx] = req;
                idx++;
            }
        }
        return pending;
    }

    function getCitizenRequests(address _citizen) external view returns (VerificationRequest[] memory) {
        uint256 count;
        for (uint256 i = 0; i < nextRequestId; i++) {
            if (verificationRequests[i].citizen == _citizen) {
                count++;
            }
        }

        VerificationRequest[] memory citizenRequests = new VerificationRequest[](count);
        uint256 idx;
        for (uint256 i = 0; i < nextRequestId; i++) {
            if (verificationRequests[i].citizen == _citizen) {
                citizenRequests[idx] = verificationRequests[i];
                idx++;
            }
        }
        return citizenRequests;
    }

    function getAnchoredDocument(address citizenDid)
        external
        view
        returns (bytes32 documentHash, address issuer, bytes memory signature, uint256 anchoredAt)
    {
        AnchoredDocument memory doc = anchoredDocuments[citizenDid];
        return (doc.documentHash, doc.issuer, doc.signature, doc.anchoredAt);
    }
}
