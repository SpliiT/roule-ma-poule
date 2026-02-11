import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env", override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["POSTGRES_URL_NON_POOLING"] || process.env["DATABASE_URL_UNPOOLED"] || process.env["DATABASE_URL"],
  },
});
