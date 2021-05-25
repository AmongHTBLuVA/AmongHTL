import {socket, getId} from "/script/socket.js"
import {
  background,
  ctx,
  canvas,
  copy,
  setWidth,
  getWidth,
  getHeight,
  setHeight,
} from "/script/main.js";

function drawBorders(pos0, pos1) {
  ctx.strokeStyle = "#FF0000";
  ctx.beginPath();
  ctx.moveTo(pos0.x, pos0.y);
  ctx.lineTo(pos1.x, pos1.y);
  ctx.stroke();
}

function getMapStartPoint(pos) {
  let cpPos = copy(pos);
  let Borders = [];

  ctx.strokeStyle = "#FF0000";
  console.log("ReadMap");
  console.log("Client ID: " + getId());
  let multiplyer = 1;
  while (!isWall(cpPos.x - 1, cpPos.y)) {
    cpPos.x -= 1 * multiplyer;
  }
  while (!isWall(cpPos.x, cpPos.y + 1) && isWall(cpPos.x - 1, cpPos.y - 1)) {
    cpPos.y += 1 * multiplyer;
    multiplyer = Math.min(1, multiplyer++);
  }
  console.log("Wall Found");
  Borders.push(copy(cpPos));
  let searchDirection = getSearchDirection(cpPos);
  socket.emit(
    "stillReading",
    copy(Borders),
    copy(searchDirection),
    copy(cpPos)
  );
}

function readMapBorders(Borders, searchDirection, cpPos) {
  while (
    !isWall(
      cpPos.x + searchDirection.deltaX,
      cpPos.y + searchDirection.deltaY
    ) &&
    isWall(
      cpPos.x + searchDirection.checkDeltaX,
      cpPos.y + searchDirection.checkDeltaY
    )
  ) {
    cpPos.x += searchDirection.deltaX;
    cpPos.y += searchDirection.deltaY;
  }
  Borders.push(copy(cpPos));
  if (
    Borders.length != 1 &&
    Borders[0].x == cpPos.x &&
    Borders[0].y == cpPos.y
  ) {
    console.log("break!;");
    setHeight(window.innerHeight);
    setWidth(window.innerWidth);
    canvas.width = getWidth();
    canvas.height = getHeight();
    socket.emit("ReplyMapBorders", Borders);
    return;
  }
  console.log("still reading");
  drawBorders(Borders[Borders.length - 2], Borders[Borders.length - 1]);
  console.log("-");
  console.log(
    "EOL Check: " +
      Borders[0].x +
      " | " +
      Borders[0].y +
      " => " +
      (Borders[0].x != cpPos.x || Borders[0].y != cpPos.y)
  );
  console.log("CpPOS WallTrack: " + cpPos.x + " | " + cpPos.y);
  console.log("CpPOS ABS WallTrack: " + cpPos.x + " | " + cpPos.y);
  searchDirection = getSearchDirection(cpPos);
  console.log("CpPOS2 WallTrack: " + cpPos.x + " | " + cpPos.y);
  socket.emit(
    "stillReading",
    copy(Borders),
    copy(searchDirection),
    copy(cpPos)
  );
}

function getSearchDirection(pos) {
  let searchDirection = {
    deltaX: 0,
    deltaY: 0,
    checkDeltaX: 0,
    checkDeltaY: 0,
  };
  if (!isWall(pos.x + 1, pos.y - 1) && isWall(pos.x, pos.y - 1)) {
    pos.y += -1;
    pos.x += 1;
    searchDirection.deltaX = 0;
    searchDirection.deltaY = -1;
    searchDirection.checkDeltaX = -1;
    searchDirection.checkDeltaY = -1;
  } else if (!isWall(pos.x + 1, pos.y + 1) && isWall(pos.x + 1, pos.y)) {
    pos.y += 1;
    pos.x += 1;
    searchDirection.deltaX = 1;
    searchDirection.deltaY = 0;
    searchDirection.checkDeltaX = 1;
    searchDirection.checkDeltaY = -1;
  } else if (!isWall(pos.x - 1, pos.y + 1) && isWall(pos.x, pos.y + 1)) {
    pos.y += 1;
    pos.x += -1;
    searchDirection.deltaX = 0;
    searchDirection.deltaY = 1;
    searchDirection.checkDeltaX = 1;
    searchDirection.checkDeltaY = 1;
  } else if (!isWall(pos.x - 1, pos.y - 1) && isWall(pos.x - 1, pos.y)) {
    pos.y += -1;
    pos.x += -1;
    searchDirection.deltaX = -1;
    searchDirection.deltaY = 0;
    searchDirection.checkDeltaX = -1;
    searchDirection.checkDeltaY = 1;
  } else if (!isWall(pos.x + 1, pos.y) && isWall(pos.x, pos.y - 1)) {
    searchDirection.deltaX = 1;
    searchDirection.deltaY = 0;
    searchDirection.checkDeltaX = 1;
    searchDirection.checkDeltaY = -1;
  } else if (!isWall(pos.x, pos.y + 1) && isWall(pos.x + 1, pos.y)) {
    searchDirection.deltaX = 0;
    searchDirection.deltaY = 1;
    searchDirection.checkDeltaX = 1;
    searchDirection.checkDeltaY = 1;
  } else if (!isWall(pos.x - 1, pos.y) && isWall(pos.x, pos.y + 1)) {
    searchDirection.deltaX = -1;
    searchDirection.deltaY = 0;
    searchDirection.checkDeltaX = -1;
    searchDirection.checkDeltaY = 1;
  } else if (!isWall(pos.x, pos.y - 1) && isWall(pos.x - 1, pos.y)) {
    searchDirection.deltaX = 0;
    searchDirection.deltaY = -1;
    searchDirection.checkDeltaX = -1;
    searchDirection.checkDeltaY = -1;
  }
  return searchDirection;
}

function round(x) {
  const parsed = parseInt(x, 10);
  if (isNaN(parsed)) {
    return 0;
  }
  return parsed;
}

function isWall(x, y) {
  let pix = getPixel(x, y);
  //console.log("PIX: " + pix[0] + " | " + pix[1] + " | " + pix[2]);
  return pix[0] > 0 && pix[1] > 0 && pix[2] > 0;
}

function getPixel(x, y) {
  setHeight(window.innerHeight);
  setWidth(window.innerWidth);
  var imgd = ctx.getImageData(x, y, getWidth(), getHeight());
  var pix = imgd.data;

  // Loop over each pixel and invert the color.
  for (var i = 0, n = pix.length; i < n; i += 4) {
    pix[i] = 255 - pix[i]; // red
    pix[i + 1] = 255 - pix[i + 1]; // green
    pix[i + 2] = 255 - pix[i + 2]; // blue
    // i+3 is alpha (the fourth element)
  }
  return pix;
}

export {getMapStartPoint, readMapBorders}