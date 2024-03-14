import cluster from "node:cluster";
import { createServer } from "./server";

if (cluster.isPrimary) {
  console.log("\x1b[38;5;10m", `Primary ${process.pid} is running`);

  cluster.fork();

  cluster.on("exit", (worker, code, signal) => {
    console.log("\x1b[31m", `worker ${worker.process.pid} died`);
    cluster.fork();
  });

  cluster.on("online", (worker) => {
    console.log("\x1b[36m%s\x1b[0m", `worker ${worker.process.pid} is online`);
  });
} else {
  createServer();
  setTimeout(() => process.exit(), 10000);
}
