import dotenv from "dotenv";
import {defineConfig} from "drizzle-kit";

dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/config/database/drizzle/models",
  out: "./src/config/database/drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
})