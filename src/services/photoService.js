import { photoRepository } from "../repositories/photoRepository.js";
async function list(issueId) {
  return photoRepository.listByIssue(issueId);
}
async function add(issueId, url) {
  return photoRepository.add(issueId, url);
}
export const photoService = { list, add };
