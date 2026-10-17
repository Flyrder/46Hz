import { verifyDataContract } from "../lib/data-contract";

export { verifyDataContract, type ContractVerificationResult } from "../lib/data-contract";

console.log("=== 46Hz Prisma 8 Data Contract Automated Verification ===");
const res = verifyDataContract();
if (!res.ok) {
  console.error("❌ Data Contract Verification Failed:");
  for (const err of res.errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
} else {
  console.log("✅ Data Contract & Zod Types in 100% Parity:");
  console.log(`  - Schema Version: ${res.schemaVersion}`);
  console.log(`  - Profile Hash:   ${res.profileHash}`);
  console.log(`  - Root Models (${res.models.length}): ${res.models.join(", ")}`);
  console.log(`  - Validated Enums: ${Object.keys(res.enums).join(", ")}`);
}
