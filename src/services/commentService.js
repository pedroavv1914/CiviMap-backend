import { commentRepository } from "../repositories/commentRepository.js";
async function list(issueId) {
  return commentRepository.listByIssue(issueId);
}
async function create(issueId, userId, content) {
  return commentRepository.create(issueId, userId, content);
}
async function remove(id, requester) {
  const c = await commentRepository.getById(id);
  if (!c) return null;
  if (!(requester.role === "admin" || requester.id === c.user_id)) return false;
  await commentRepository.remove(id);
  return true;
}
export const commentService = { list, create, remove };
