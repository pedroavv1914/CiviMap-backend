import { db } from "../db.js";
import crypto from "crypto";
const memory = { issues: [] };
async function list(filters) {
  if (db.available) {
    const parts = ["select id,title,description,status,category_id,created_by,address,neighborhood,city,priority_score,created_at,updated_at, ST_Y(location) as lat, ST_X(location) as lng from issues"];
    const where = [];
    const values = [];
    let i = 1;
    const lat = filters.lat !== undefined ? Number(filters.lat) : undefined;
    const lng = filters.lng !== undefined ? Number(filters.lng) : undefined;
    const radius = filters.radius !== undefined ? Number(filters.radius) : undefined;
    const limit = filters.limit !== undefined ? Math.min(100, Math.max(1, Number(filters.limit))) : 50;
    const offset = filters.offset !== undefined ? Math.max(0, Number(filters.offset)) : 0;
    if (filters.status) { where.push(`status=$${i++}`); values.push(filters.status); }
    if (filters.category) { where.push(`category_id=$${i++}`); values.push(filters.category); }
    if (filters.neighborhood) { where.push(`neighborhood=$${i++}`); values.push(filters.neighborhood); }
    if (filters.city) { where.push(`city=$${i++}`); values.push(filters.city); }
    if (filters.from) { where.push(`created_at >= $${i++}`); values.push(new Date(filters.from)); }
    if (filters.to) { where.push(`created_at <= $${i++}`); values.push(new Date(filters.to)); }
    if (radius && lat !== undefined && lng !== undefined) {
      where.push(`ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($${i++}, $${i++}), 4326)::geography, $${i++})`);
      values.push(lng, lat, radius);
    }
    if (where.length) parts.push(" where " + where.join(" and "));
    if (filters.sort === "priority") parts.push(" order by priority_score desc nulls last");
    else if (filters.sort === "date") parts.push(" order by created_at desc");
    else if (filters.sort === "distance" && lat !== undefined && lng !== undefined) {
      parts.push(` order by ST_Distance(location::geography, ST_SetSRID(ST_MakePoint($${i++}, $${i++}), 4326)::geography) asc`);
      values.push(lng, lat);
    }
    parts.push(` limit $${i++} offset $${i++}`);
    values.push(limit, offset);
    const q = parts.join("");
    const r = await db.pool.query(q, values);
    return r.rows;
  }
  let arr = memory.issues.slice();
  const lat = filters.lat !== undefined ? Number(filters.lat) : undefined;
  const lng = filters.lng !== undefined ? Number(filters.lng) : undefined;
  const radius = filters.radius !== undefined ? Number(filters.radius) : undefined;
  const limit = filters.limit !== undefined ? Math.min(100, Math.max(1, Number(filters.limit))) : 50;
  const offset = filters.offset !== undefined ? Math.max(0, Number(filters.offset)) : 0;
  if (filters.status) arr = arr.filter(i => i.status === filters.status);
  if (filters.category) arr = arr.filter(i => String(i.category_id) === String(filters.category));
  if (filters.neighborhood) arr = arr.filter(i => i.neighborhood === filters.neighborhood);
  if (filters.city) arr = arr.filter(i => i.city === filters.city);
  if (filters.from) arr = arr.filter(i => new Date(i.created_at) >= new Date(filters.from));
  if (filters.to) arr = arr.filter(i => new Date(i.created_at) <= new Date(filters.to));
  function dist(aLat, aLng, bLat, bLng) {
    const R = 6371000;
    const toRad = v => v * Math.PI / 180;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const s1 = Math.sin(dLat/2);
    const s2 = Math.sin(dLng/2);
    const aa = s1*s1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * s2*s2;
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
    return R * c;
  }
  if (radius && lat !== undefined && lng !== undefined) arr = arr.filter(i => dist(lat, lng, i.lat, i.lng) <= radius);
  if (filters.sort === "priority") arr.sort((a,b) => (b.priority_score||0) - (a.priority_score||0));
  else if (filters.sort === "date") arr.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  else if (filters.sort === "distance" && lat !== undefined && lng !== undefined) arr.sort((a,b) => dist(lat,lng,a.lat,a.lng) - dist(lat,lng,b.lat,b.lng));
  return arr.slice(offset, offset + limit);
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
