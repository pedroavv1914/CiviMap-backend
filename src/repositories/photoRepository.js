import { db } from "../db.js";
import crypto from "crypto";
const memory = { photos: [] };
async function listByIssue(issueId) {
  if (db.available) {
    const r = await db.pool.query("select id, issue_id, url, created_at from issue_photos where issue_id=$1 order by created_at desc", [issueId]);
    return r.rows;
  }
  return memory.photos.filter(p => p.issue_id === issueId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
}
async function add(issueId, url) {
  if (db.available) {
    const id = crypto.randomUUID();
    const r = await db.pool.query("insert into issue_photos(id,issue_id,url,created_at) values($1,$2,$3,now()) returning id, issue_id, url, created_at", [id, issueId, url]);
    return r.rows[0];
  }
  const item = { id: crypto.randomUUID(), issue_id: issueId, url, created_at: new Date().toISOString() };
  memory.photos.push(item);
  return item;
}
export const photoRepository = { listByIssue, add };
