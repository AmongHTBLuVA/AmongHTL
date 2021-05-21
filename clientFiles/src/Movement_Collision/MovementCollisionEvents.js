import {socket} from "/script/socket.js"

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
  if (readingBorders) {
    console.log("no movement");
    return;
  }
  setPlayerPositions(pos);
});

socket.on("requestWallCollision", (pos) => {
  let collObj = getWallCollisions(pos);
  socket.emit("CollisionReply", collObj);
});

socket.on("translateBorders", (Borders) => {
  let tmp = [];
  console.log("translate");
  Borders.forEach((b) => {
    tmp.push(translateBorderPos(copy(b)));
  });
  socket.emit("replyTranslatedBorders", tmp);
});

socket.on("continueReading", (Borders, searchDirection, cpPos) => {
  console.log("conitnue: " + cpPos);
  readMapBorders(Borders, searchDirection, cpPos);
});