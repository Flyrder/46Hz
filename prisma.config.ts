import "dotenv/config";
import { defineConfig } from "@prisma/prisma7/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL
  }
});
