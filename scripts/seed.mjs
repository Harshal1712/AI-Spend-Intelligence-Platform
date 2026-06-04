import { runSqlFile } from "./db-runner.mjs";

await runSqlFile("db/seed.sql");
