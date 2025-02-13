// @ts-check
import chokidar from "chokidar";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 8080,
});

chokidar
  .watch("next.js/docs", {
    awaitWriteFinish: true,
    ignoreInitial: true,
  })
  .on("all", (event, path) => {
    console.log("update triggered", event, path);
    const data = JSON.stringify({
      path,
      event,
    });

    for (const client of wss.clients) {
      client.send(data);
    }
  });

wss.on("listening", () => {
  console.log("Watcher started");
});
wss.on("connection", (ws) => {
  ws.on("error", console.error);
});
