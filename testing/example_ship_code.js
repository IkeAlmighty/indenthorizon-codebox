once(async () => {
  console("logged in!"); // console sends a console message the client
});

loop(async () => {
  console("looking for materials...");
  broadcast("trade available: 300iron");
  const data = await scan();
  if (data.IRON) {
    await move(data.IRON.location);
    await mine(data.IRON.location);
  }
});

onBroadcastRecieved((broadcast) => {});
onMessageRecieved((message) => {});
