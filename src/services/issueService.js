import { issueRepository } from "../repositories/issueRepository.js";
async function list(filters) {
  const items = await issueRepository.list(filters);
  return items;
}
async function getById(id) {
  const item = await issueRepository.getById(id);
  return item;
}
async function create(payload) {
  const item = await issueRepository.create(payload);
  return item;
}
async function updateStatus(id, status, userId) {
  const item = await issueRepository.updateStatus(id, status, userId);
  return item;
}
export const issueService = { list, getById, create, updateStatus };
