import { drizzle } from "drizzle-orm/libsql";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL,
  },
});
