import fs from "node:fs";
import path from "node:path";
import {
  ageRangeSchema,
  replyTypeSchema,
  riskLevelSchema,
  letterStatusSchema,
  replyStatusSchema
} from "@/lib/validators";

export interface ContractVerificationResult {
  ok: boolean;
  schemaVersion: string;
  profileHash: string;
  models: string[];
  enums: Record<string, string[]>;
  errors: string[];
}

export function verifyDataContract(): ContractVerificationResult {
  const root = process.cwd();
  const contractJsonPath = path.join(root, "prisma", "contract.json");
  const contractDtsPath = path.join(root, "prisma", "contract.d.ts");
  const schemaPrismaPath = path.join(root, "prisma", "schema.prisma");

  const errors: string[] = [];

  if (!fs.existsSync(contractJsonPath)) {
    errors.push("Missing prisma/contract.json. Run 'npm run prisma:emit' to generate.");
  }

  if (!fs.existsSync(contractDtsPath)) {
    errors.push("Missing prisma/contract.d.ts. Run 'npm run prisma:emit' to generate.");
  }

  if (!fs.existsSync(schemaPrismaPath)) {
    errors.push("Missing prisma/schema.prisma.");
  }

  if (errors.length > 0) {
    return {
      ok: false,
      schemaVersion: "unknown",
      profileHash: "unknown",
      models: [],
      enums: {},
      errors
    };
  }

  const contractRaw = fs.readFileSync(contractJsonPath, "utf-8");
  const contract = JSON.parse(contractRaw);

  const schemaRaw = fs.readFileSync(schemaPrismaPath, "utf-8");

  // Expected Root Models
  const expectedModels = [
    "User",
    "Letter",
    "Reply",
    "Match",
    "Feedback",
    "ModerationEvent",
    "SupportResource",
    "LetterComment"
  ];

  const contractRoots = Object.keys(contract.roots || {});
  for (const model of expectedModels) {
    if (!contractRoots.includes(model)) {
      errors.push(`Model '${model}' defined in domain is missing from contract roots.`);
    }
    if (!schemaRaw.includes(`model ${model} {`)) {
      errors.push(`Model '${model}' is missing from schema.prisma.`);
    }
  }

  // Validate Enums Parity across Prisma Contract and Zod Validators
  const enumChecks: Array<{ name: string; zodValues: string[] }> = [
    { name: "AgeRange", zodValues: ageRangeSchema.options },
    { name: "ReplyType", zodValues: replyTypeSchema.options },
    { name: "RiskLevel", zodValues: riskLevelSchema.options },
    { name: "LetterStatus", zodValues: letterStatusSchema.options },
    { name: "ReplyStatus", zodValues: replyStatusSchema.options }
  ];

  const enumsSummary: Record<string, string[]> = {};

  for (const check of enumChecks) {
    enumsSummary[check.name] = check.zodValues;
    const nativeEnum = contract.storage?.namespaces?.public?.entries?.native_enum?.[check.name];
    const valueSet = contract.storage?.namespaces?.public?.entries?.valueSet?.[check.name];
    const contractEnum = contract.domain?.types?.[check.name];

    const contractValues: string[] | undefined = Array.isArray(nativeEnum?.members)
      ? nativeEnum.members
      : Array.isArray(valueSet?.values)
        ? valueSet.values
        : contractEnum && contractEnum.kind === "enum"
          ? Object.keys(contractEnum.values || {})
          : undefined;

    if (contractValues) {
      for (const val of check.zodValues) {
        if (!contractValues.includes(val)) {
          errors.push(
            `Enum '${check.name}' value '${val}' in Zod validators is missing from Prisma 8 contract.`
          );
        }
      }
    } else {
      errors.push(`Enum '${check.name}' is missing from Prisma 8 contract.`);
    }
  }

  return {
    ok: errors.length === 0,
    schemaVersion: String(contract.schemaVersion || "1"),
    profileHash: String(contract.profileHash || ""),
    models: contractRoots,
    enums: enumsSummary,
    errors
  };
}
