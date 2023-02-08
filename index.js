const { NodeVM } = require("vm2");
const WebSocket = require("ws");

const express = require("express");
const app = express();
app.use(express.json());

const shardResponsePackages = {};

// create the Websocket Server to recieve subscriptions, run request, and specify client disconnection procedures:

const clientWSServer = new WebSocket.WebSocketServer({ port: 4001 });

clientWSServer.on("connection", (client) => {
  client.on("message", async (data) => {
    const json = JSON.parse(data);
    if (json.action === "run") {
      // create a ws connection with the shard:
      const shardData = await fetch(
        "https://indenthorizon.com/entities/get-shard"
      );
      const shardDataJSON = await shardData.json();
      const shardWebSocket = new WebSocket.WebSocket(shardDataJSON.url);

      const vm = new NodeVM({
        sandbox: { shardWebSocket, shardResponsePackages },
      });

      vm.run(json.code);
    } else if (json.action === "subscribe") {
      const responsePackage = shardResponsePackages[json.shipKey];
      if (!responsePackage.client) responsePackage.client = client;
      else
        client.send(
          JSON.stringify({
            error:
              "There is already a client subscribed the specified ship key",
          })
        );
    } else {
      client.send(
        JSON.stringify({
          error: `codebox only accepts "run" actions and "subscribe" actions, not ${data.action}`,
        })
      );
    }
  });
  client.on("close", () => {});
});

// setInterval to send pop all shardResponsePackages that have subscribed clients:
setInterval(() => {
  shardResponsePackages.forEach((responsePackage) => {
    // send the full list of of responses if there is an active client listening:
    if (shardResponsePackage.client) {
      shardResponsePackages.client.send(
        JSON.stringify({ responses: shardResponsePackages.responses }) // this is a list lol js has no typing
      );
    }
  });
}, 1000 / 60);

app.get("/", function (req, res) {
  res.redirect("https://github.com/ikealmighty/indenthorizon-codebox");
});

app.listen(4000, () => console.log("listening on http://localhost:4000"));
