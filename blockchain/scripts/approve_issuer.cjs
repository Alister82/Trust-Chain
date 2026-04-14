const hre = require("hardhat");

async function main() {
  // Use the verified contract address from the latest deployment
  const TRUST_REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const TARGET_ISSUER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  console.log(`\n[Admin] Attempting to approve Issuer: ${TARGET_ISSUER}...`);
  const [admin] = await hre.ethers.getSigners();
  const TrustRegistry = await hre.ethers.getContractAt("TrustRegistry", TRUST_REGISTRY_ADDRESS);

  // 1. First check the current role
  const roleInfo = await TrustRegistry.users(TARGET_ISSUER);
  console.log(`Current Role: ${roleInfo.role} (Approved: ${roleInfo.isApproved})`);

  // 2. Apply if not already applied (to ensure success)
  // In the real flow, the user does this via UI, but for a one-shot script, we can force it if needed.
  // Actually, the user says they "applied", so we just approve.

  console.log("Sending approval transaction...");
  const tx = await TrustRegistry.connect(admin).approveIssuer(TARGET_ISSUER);
  await tx.wait();

  console.log("\n✅ SUCCESS: Account #1 is now an Authorized Issuer for TrustChain.");
}

main().catch((error) => {
  console.error("❌ FAILED:", error.message);
  process.exit(1);
});
