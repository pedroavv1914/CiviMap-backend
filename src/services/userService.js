import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/userRepository.js";
async function createUser({ name, email, password, role }) {
  const exists = await userRepository.findByEmail(email);
  if (exists) throw new Error("exists");
  const hash = await bcrypt.hash(password, 10);
  const user = await userRepository.create({ name, email, password_hash: hash, role });
  return user;
}
async function authenticate(email, password) {
  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error("not_found");
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error("bad_password");
  return user;
}
async function findById(id) {
  return userRepository.findById(id);
}
async function ensureAdminFromEnv(config) {
  if (!config.adminEmail || !config.adminPassword) return;
  const exists = await userRepository.findByEmail(config.adminEmail);
  if (exists) return;
  await createUser({ name: config.adminName || "Admin", email: config.adminEmail, password: config.adminPassword, role: "admin" });
}
export const userService = { createUser, authenticate, findById, ensureAdminFromEnv };
