import { db } from "../db.js";
import crypto from "crypto";
const memory = { comments: [] };
async function listByIssue(issueId) {
  if (db.available) {
    const r = await db.pool.query("select id, issue_id, user_id, content, created_at from issue_comments where issue_id=$1 order by created_at desc", [issueId]);
    return r.rows;
  }
  return memory.comments.filter(c => c.issue_id === issueId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
}
async function create(issueId, userId, content) {
  if (db.available) {
    const id = crypto.randomUUID();
    const r = await db.pool.query("insert into issue_comments(id,issue_id,user_id,content,created_at) values($1,$2,$3,$4,now()) returning id, issue_id, user_id, content, created_at", [id, issueId, userId, content]);
    return r.rows[0];
  }
  const item = { id: crypto.randomUUID(), issue_id: issueId, user_id: userId, content, created_at: new Date().toISOString() };
  memory.comments.push(item);
  return item;
}
async function getById(id) {
  if (db.available) {
    const r = await db.pool.query("select id, issue_id, user_id, content, created_at from issue_comments where id=$1", [id]);
    return r.rows[0] || null;
  }
  return memory.comments.find(c => c.id === id) || null;
}
async function remove(id) {
  if (db.available) {
    await db.pool.query("delete from issue_comments where id=$1", [id]);
    return true;
  }
  const i = memory.comments.findIndex(c => c.id === id);
  if (i !== -1) memory.comments.splice(i,1);
  return i !== -1;
}
export const commentRepository = { listByIssue, create, getById, remove };
