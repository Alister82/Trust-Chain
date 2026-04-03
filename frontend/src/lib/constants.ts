// frontend/src/lib/constants.ts

// 1. Paste the address you got from your 'forge script' terminal here
export const TRUST_REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

// 2. This is the "Identity" of the Government Official (Account 0 in Anvil)
export const GOVT_OFFICIAL_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as const;

// 3. The ABI (Copy this from blockchain/out/TrustRegistry.sol/TrustRegistry.json)
export const TRUST_REGISTRY_ABI = [
  "function anchorDocument(string memory _did, bytes32 _docHash) public",
  "function getDocumentHash(string memory _did) public view returns (bytes32)",
  "function governmentOfficial() public view returns (address)"
] as const;
