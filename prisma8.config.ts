import { definePrismaConfig } from "@prisma/cli-engine";
import { defineConfig, prisma7Schema } from "@prisma/orm-postgres/config";

export default definePrismaConfig({
  orm: defineConfig({
    contract: prisma7Schema("prisma/schema.prisma")
  })
});
