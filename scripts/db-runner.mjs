import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

const { Client } = pg;

function getDatabaseUrl() {
  const direct = process.env.DATABASE_URL;
  if (direct) return direct;

  return "postgresql://postgres:postgres@localhost:5432/ai_spend_intelligence";
}

export async function runSqlFile(relativePath) {
  const databaseUrl = getDatabaseUrl();
  const filePath = resolve(process.cwd(), relativePath);
  const sql = await readFile(filePath, "utf8");
  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log(`Applied ${relativePath}`);
  } catch (error) {
    console.error(`Could not apply ${relativePath}`);
    console.error(error.message || error.code || String(error));
    if (error.cause) console.error(error.cause.message || String(error.cause));
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => undefined);
  }
}
