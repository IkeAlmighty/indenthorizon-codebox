const { NodeVM } = require("vm2");
const WebSocket = require("ws");

const express = require("express");
const app = express();
app.use(express.json());

app.post("/run", function (req, res) {
  const { code, apikey } = req.body;

  // TODO: check api key

  // Instatiate the VM with access to a websocket:
  const websocket = new WebSocket();
  const vm = new NodeVM({ sandbox: { websocket } }); //TODO check to see if I am understanding the purpose of sandbox correctly

  // start the vm:
  vm.run(code);
});

app.get("/", function (req, res) {
  res.redirect("https://github.com/ikealmighty/indenthorizon-codebox");
});

app.listen(4000, () => console.log("listening on http://localhost:4000"));
