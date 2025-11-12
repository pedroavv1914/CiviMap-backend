import { issueRepository } from "../repositories/issueRepository.js";
async function list(issueId) {
  return issueRepository.statusHistory(issueId);
}
export const statusService = { list };
