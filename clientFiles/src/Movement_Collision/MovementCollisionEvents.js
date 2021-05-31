import { socket } from "/script/socket.js";
import {
  background,
  ctx,
  canvas,
  setReadingBorders,
  getReadingBorders,
  copy
} from "/script/main.js";
import { getMapStartPoint, readMapBorders } from "/script/borderFunctions.js";
import { setPlayerPositions } from "/script/movement.js";

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
  setReadingBorders(true);
  let startPoint = {
    x: 10,
    y: 10,
  };
  setTimeout(() => {
    getMapStartPoint(copy(startPoint));
    setReadingBorders(false);
  }, 1);
});

socket.on("playerMovement", (playerPositions) => {
  console.log("MOVE");
  if (getReadingBorders()) {
    console.log("no movement");
    return;
  }
  setPlayerPositions(playerPositions);
});

socket.on("requestWallCollision", (pos) => {
  let collObj = getWallCollisions(pos);
  socket.emit("CollisionReply", collObj);
});

socket.on("continueReading", (Borders, searchDirection, cpPos) => {
  console.log("conitnue: " + cpPos);
  readMapBorders(Borders, searchDirection, cpPos);
});

socket.on("deadPlayerMove", (pos, playerPositions) => {
  setPlayerPositions(playerPositions, pos);
});
