import { Pool, type QueryResultRow } from "pg";
import { logger } from "./logger";

const globalDb = globalThis as typeof globalThis & { aiSpendPool?: Pool };

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export const pool =
  globalDb.aiSpendPool ??
  (globalDb.aiSpendPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000
  }));

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  if (!hasDatabase) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const started = Date.now();

  try {
    const result = await pool.query<T>(text, params);
    logger.debug({ durationMs: Date.now() - started, rows: result.rowCount }, "database query completed");
    return result;
  } catch (error) {
    logger.error({ error, text }, "database query failed");
    throw error;
  }
}
