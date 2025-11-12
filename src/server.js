import { app } from "./app.js";
import { config } from "./config.js";
import { userService } from "./services/userService.js";
const server = app.listen(config.port, () => {
  console.log(`API http://localhost:${config.port}/api/v1`);
});
try { userService.ensureAdminFromEnv(config); } catch {}
export default server;
