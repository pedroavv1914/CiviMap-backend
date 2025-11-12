import { Pool } from "pg";
import { config } from "./config.js";
let pool = null;
let available = false;
if (config.databaseUrl) {
  try {
    pool = new Pool({ connectionString: config.databaseUrl });
    available = true;
  } catch {
    pool = null;
    available = false;
  }
}
export const db = { pool, available };
