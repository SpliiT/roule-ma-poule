import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Charger .env.local (convention Next.js) puis .env en fallback
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env", override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
