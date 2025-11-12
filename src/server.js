import { app } from "./app.js";
import { config } from "./config.js";
const server = app.listen(config.port, () => {
  console.log(`API http://localhost:${config.port}/api/v1`);
});
export default server;
