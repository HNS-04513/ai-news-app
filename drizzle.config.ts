import { defineConfig } from "drizzle-kit";

// drizzle-kit은 Next.js 밖에서 실행되므로 .env.local을 직접 읽는다.
process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
