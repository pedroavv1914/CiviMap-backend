import { db } from "../db.js";
import crypto from "crypto";
const memory = { users: [] };
async function findByEmail(email) {
  if (db.available) {
    const r = await db.pool.query("select id, name, email, password_hash, role from users where email=$1", [email]);
    return r.rows[0] || null;
  }
  return memory.users.find(u => u.email === email) || null;
}
async function findById(id) {
  if (db.available) {
    const r = await db.pool.query("select id, name, email, password_hash, role from users where id=$1", [id]);
    return r.rows[0] || null;
  }
  return memory.users.find(u => u.id === id) || null;
}
async function create({ name, email, password_hash, role }) {
  if (db.available) {
    const id = crypto.randomUUID();
    const r = await db.pool.query("insert into users(id,name,email,password_hash,role,created_at,updated_at) values($1,$2,$3,$4,$5,now(),now()) returning id,name,email,role", [id, name, email, password_hash, role]);
    return r.rows[0];
  }
  const u = { id: crypto.randomUUID(), name, email, password_hash, role };
  memory.users.push(u);
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}
export const userRepository = { findByEmail, findById, create };
