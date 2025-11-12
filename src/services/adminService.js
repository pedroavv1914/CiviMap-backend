import { adminRepository } from "../repositories/adminRepository.js";
async function stats() {
  return adminRepository.stats();
}
export const adminService = { stats };
