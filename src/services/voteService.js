import { voteRepository } from "../repositories/voteRepository.js";
async function toggle(issueId, userId) {
  const r = await voteRepository.toggle(issueId, userId);
  const c = await voteRepository.count(issueId);
  return { voted: r.voted, votes: c };
}
export const voteService = { toggle };
