import { db } from "../db.js";
import crypto from "crypto";
const memory = { votes: [] };
async function toggle(issueId, userId) {
  if (db.available) {
    const r = await db.pool.query("select id from issue_votes where issue_id=$1 and user_id=$2", [issueId, userId]);
    if (r.rows[0]) {
      await db.pool.query("delete from issue_votes where id=$1", [r.rows[0].id]);
      await recalcPriority(issueId);
      return { voted: false };
    }
    const id = crypto.randomUUID();
    await db.pool.query("insert into issue_votes(id,issue_id,user_id,created_at) values($1,$2,$3,now())", [id, issueId, userId]);
    await recalcPriority(issueId);
    return { voted: true };
  }
  const idx = memory.votes.findIndex(v => v.issue_id === issueId && v.user_id === userId);
  if (idx !== -1) {
    memory.votes.splice(idx, 1);
    return { voted: false };
  }
  memory.votes.push({ id: crypto.randomUUID(), issue_id: issueId, user_id: userId, created_at: new Date().toISOString() });
  return { voted: true };
}
async function count(issueId) {
  if (db.available) {
    const r = await db.pool.query("select count(*)::int as c from issue_votes where issue_id=$1", [issueId]);
    return r.rows[0]?.c || 0;
  }
  return memory.votes.filter(v => v.issue_id === issueId).length;
}
async function has(issueId, userId) {
  if (db.available) {
    const r = await db.pool.query("select 1 from issue_votes where issue_id=$1 and user_id=$2 limit 1", [issueId, userId]);
    return !!r.rows[0];
  }
  return memory.votes.some(v => v.issue_id === issueId && v.user_id === userId);
}
async function recalcPriority(issueId) {
  if (db.available) {
    const c = await count(issueId);
    await db.pool.query("update issues set priority_score=$1 where id=$2", [c, issueId]);
    return c;
  }
  return count(issueId);
}
export const voteRepository = { toggle, count, has, recalcPriority };
