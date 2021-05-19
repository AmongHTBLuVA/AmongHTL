socket.on("connect", () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  player.width = 70;
  player.height = 70;
  player.src = playerImageUrl;
  background.src = backgroundImageUrl;

  socket.emit("requestID");
  setInterval(tick, tickIntervall);
});

socket.on("disconnect", () => {
  console.log("Disconnected;");
  window.clearInterval();
});


socket.on("idReply", (id) => {
  Clientid = id;
  localStorage.setItem("id", id);
  height = window.innerHeight;
  width = window.innerWidth;
  canvas.width = width;
  canvas.height = height;
  socket.emit("authenticated");
});

