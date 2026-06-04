import { runSqlFile } from "./db-runner.mjs";

await runSqlFile("db/migrations/001_init.sql");
