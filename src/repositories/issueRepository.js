import { db } from "../db.js";
import crypto from "crypto";
const memory = { issues: [] };
async function list(filters) {
  if (db.available) {
    const parts = ["select id,title,description,status,category_id,created_by,address,neighborhood,city,priority_score,created_at,updated_at, ST_Y(location) as lat, ST_X(location) as lng from issues"];
    const where = [];
    const values = [];
    let i = 1;
    if (filters.status) { where.push(`status=$${i++}`); values.push(filters.status); }
    if (filters.category) { where.push(`category_id=$${i++}`); values.push(filters.category); }
    if (filters.neighborhood) { where.push(`neighborhood=$${i++}`); values.push(filters.neighborhood); }
    if (filters.radius && filters.lat && filters.lng) {
      where.push(`ST_DWithin(location, ST_SetSRID(ST_MakePoint($${i++}, $${i++}), 4326)::geography, $${i++})`);
      values.push(Number(filters.lng), Number(filters.lat), Number(filters.radius));
    }
    if (where.length) parts.push(" where " + where.join(" and "));
    if (filters.sort === "priority") parts.push(" order by priority_score desc nulls last");
    const q = parts.join("");
    const r = await db.pool.query(q, values);
    return r.rows;
  }
  let arr = memory.issues.slice();
  if (filters.status) arr = arr.filter(i => i.status === filters.status);
  if (filters.category) arr = arr.filter(i => String(i.category_id) === String(filters.category));
  if (filters.neighborhood) arr = arr.filter(i => i.neighborhood === filters.neighborhood);
  if (filters.sort === "priority") arr.sort((a,b) => (b.priority_score||0) - (a.priority_score||0));
  return arr;
}
async function getById(id) {
  if (db.available) {
    const r = await db.pool.query("select id,title,description,status,category_id,created_by,address,neighborhood,city,priority_score,created_at,updated_at, ST_Y(location) as lat, ST_X(location) as lng from issues where id=$1", [id]);
    return r.rows[0] || null;
  }
  return memory.issues.find(i => i.id === id) || null;
}
async function create({ title, description, category_id, lat, lng, address, neighborhood, created_by }) {
  const status = "open";
  if (db.available) {
    const id = crypto.randomUUID();
    const r = await db.pool.query(
      "insert into issues(id,title,description,status,category_id,created_by,location,address,neighborhood,priority_score,created_at,updated_at) values($1,$2,$3,$4,$5,$6,ST_SetSRID(ST_MakePoint($7,$8),4326),$9,$10,0,now(),now()) returning id,title,description,status,category_id,created_by,address,neighborhood,priority_score,created_at,updated_at",
      [id, title, description || "", status, category_id, created_by, lng, lat, address || "", neighborhood || ""]
    );
    const item = r.rows[0];
    return { ...item, lat, lng };
  }
  const item = { id: crypto.randomUUID(), title, description: description || "", status, category_id, created_by, lat, lng, address: address || "", neighborhood: neighborhood || "", priority_score: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  memory.issues.push(item);
  return item;
}
async function updateStatus(id, status, userId) {
  if (db.available) {
    const prev = await db.pool.query("select status from issues where id=$1", [id]);
    const oldStatus = prev.rows[0]?.status || null;
    if (!oldStatus) return null;
    const r = await db.pool.query("update issues set status=$1, updated_at=now() where id=$2 returning id,title,description,status,category_id,created_by,address,neighborhood,priority_score,created_at,updated_at, ST_Y(location) as lat, ST_X(location) as lng", [status, id]);
    const item = r.rows[0] || null;
    if (!item) return null;
    await db.pool.query("insert into issue_status_history(id,issue_id,old_status,new_status,changed_by,created_at) values($1,$2,$3,$4,$5,now())", [crypto.randomUUID(), id, oldStatus, status, userId]);
    return item;
  }
  const idx = memory.issues.findIndex(i => i.id === id);
  if (idx === -1) return null;
  const cur = memory.issues[idx];
  memory.issues[idx] = { ...cur, status, updated_at: new Date().toISOString() };
  return memory.issues[idx];
}
export const issueRepository = { list, getById, create, updateStatus };
