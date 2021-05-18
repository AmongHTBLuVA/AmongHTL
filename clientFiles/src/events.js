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

socket.on("drawBorders", (Borders, pos) => {
  let b0;
  Borders.forEach((b) => {
    if (b0) {
      drawBorders(
        translatePlayerPosistion(b0, pos),
        translatePlayerPosistion(b, pos)
      );
    }
    b0 = b;
  });
});

socket.on("RequestMapBorders", () => {
  canvas.width = background.width;
  canvas.height = background.height;
  ctx.drawImage(background, 0, 0, background.width, background.height);
  console.log("MapBorders Requested");
  readingBorders = true;
  let startPoint = {
    x: 10,
    y: 10,
  };
  setTimeout(() => {
    getMapStartPoint(copy(startPoint));
    readingBorders = false;
  }, 1);
});

socket.on("playerMovement", (pos) => {
  console.log("movement");
  if (readingBorders) {
    console.log("no movement");
    return;
  }
  setPlayerPositions(pos);
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

socket.on("requestWallCollision", (pos) => {
  let collObj = getWallCollisions(pos);
  socket.emit("CollisionReply", collObj);
});

socket.on("translateBorders", (Borders) => {
    let tmp = [];
    console.log("translate");
    Borders.forEach(b => {
        tmp.push(translateBorderPos(copy(b)));
    });
    socket.emit("replyTranslatedBorders", tmp);
})
