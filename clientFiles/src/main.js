var socket = io.connect("http://localhost:8080/");

var player = new Image();
const playerImageUrl = "Wieser.png";

var background = new Image();
const backgroundImageUrl = "testmap.png";

var canvas;
var ctx;
var readingBorders = false;
var keyPressed = { w: false, s: false, d: false, a: false };

var Clientid;
const speed = 1;

function connect() {
  socket = io.connect("http://localhost:8080/");
}

function copy(o) {
    return JSON.parse(JSON.stringify(o));
}

socket.on("connect", () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  player.src = playerImageUrl;
  background.src = backgroundImageUrl;
  height = window.innerHeight;
  width = window.innerWidth;
  canvas.width = width;
  canvas.height = height;
  
  ctx.fillStyle = "#FF0000";

  let id = localStorage.getItem("id");
socket.emit("requestID");
  setInterval(tick, 35);
});

function tick() {
  let delta = getDeltaPos();
  if (delta.x != 0 || delta.y != 0) {
    for (let i = 0; i < speed; i++) {
      requestMovement(delta);
    }
  }
}

socket.on("idReply", (id) => {
  Clientid = id;
  localStorage.setItem("id", id);
});

socket.on("requestWallCollision", (pos) => {
  let collObj = getWallCollisions(pos);
  socket.emit("CollisionReply", collObj);
});

document.addEventListener("keydown", function (event) {
  if (event.keyCode == 87) {
    //W
    keyPressed.w = true;
  }
  if (event.keyCode == 65) {
    //A
    keyPressed.a = true;
  }
  if (event.keyCode == 68) {
    //D
    keyPressed.d = true;
  }
  if (event.keyCode == 83) {
    //S
    keyPressed.s = true;
  }
});

document.addEventListener("keyup", function (event) {
  if (event.keyCode == 87) {
    //W
    keyPressed.w = false;
  }
  if (event.keyCode == 65) {
    //A
    keyPressed.a = false;
  }
  if (event.keyCode == 68) {
    //D
    keyPressed.d = false;
  }
  if (event.keyCode == 83) {
    //S
    keyPressed.s = false;
  }
});

socket.on("playerMovement", (pos) => {
    if(readingBorders){
        return;
    }
  setPlayerPositions(pos);
});

function getDeltaPos() {
  let deltaPos = { x: 0, y: 0 };
  let move = 1;
  if (keyPressed.w) {
    //W
    deltaPos.y = -move;
  }
  if (keyPressed.a) {
    //A
    deltaPos.x = -move;
  }
  if (keyPressed.d) {
    //D
    deltaPos.x = move;
  }
  if (keyPressed.s) {
    //S
    deltaPos.y = move;
  }
  return deltaPos;
}

function requestMovement(deltaPos) {
  socket.emit("movementRequest", deltaPos, getWallCollisions(), Clientid);
}

socket.on("disconnect", () => {
  window.clearInterval();
});

function setPlayerPositions(playerPos) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let pos = playerPos[Clientid];
  let backgroundPos = translateMapPosistion(playerPos[Clientid]);
  if (!backgroundPos) {
    socket.disconnect();
    connect();
    return;
  }
  ctx.drawImage(background, backgroundPos.x, backgroundPos.y, width, height);
  ctx.drawImage(player, width / 2 - 30, height / 2 - 30, 70, 70);
  Object.keys(playerPos).forEach((id) => {
    if (id != Clientid) {
      let relativPos = translatePlayerPosistion(playerPos[id], pos);
      ctx.drawImage(player, relativPos.x, relativPos.y, 70, 70);
    }
  });
}

function translateMapPosistion(bpos) {
  if (bpos == undefined) {
    return false;
  }
  height = window.innerHeight;
  width = window.innerWidth;
  return { x: -bpos.x + (width / 2 - 30), y: -bpos.y + (height / 2 - 30) };
}

function translatePlayerPosistion(ppos, cpos) {
  height = window.innerHeight;
  width = window.innerWidth;
  let xdiff = ppos.x - cpos.x;
  let ydiff = ppos.y - cpos.y;
  return { x: width / 2 - 30 + xdiff, y: height / 2 - 30 + ydiff };
}

function getWallCollisions() {
  let topLeft = getPixel(width / 2 - 31, height / 2 - 31);
  let topRight = getPixel(width / 2 + 40, height / 2 - 31);
  let bottomLeft = getPixel(width / 2 - 31, height / 2 + 42);
  let bottomRight = getPixel(width / 2 + 40, height / 2 + 42);
  return (collObj = {
    topLeft: topLeft[0] > 0 && topLeft[1] > 0 && topLeft[2] > 0,
    topRight: topRight[0] > 0 && topRight[1] > 0 && topRight[2] > 0,
    bottomLeft: bottomLeft[0] > 0 && bottomLeft[1] > 0 && bottomLeft[2] > 0,
    bottomRight: bottomRight[0] > 0 && bottomRight[1] > 0 && bottomRight[2] > 0,
  });
}

function isWall(x, y) {
  let pix = getPixel(x, y);
  //console.log("PIX: " + pix[0] + " | " + pix[1] + " | " + pix[2]);
  return pix[0] > 0 && pix[1] > 0 && pix[2] > 0;
}

function getPixel(x, y) {
  height = window.innerHeight;
  width = window.innerWidth;
  var imgd = ctx.getImageData(x, y, width, height);
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

function drawPix(x, y){
    ctx.fillRect( x, y, 10, 10 );
}

function round(x) {
    const parsed = parseInt(x, 10);
    if (isNaN(parsed)) { return 0; }
    return parsed;
}

socket.on("RequestMapBorders", (pos) => {
    let backgroundPos = translateMapPosistion(pos);
    if (!backgroundPos) {
      socket.disconnect();
      connect();
      return;
    }
    ctx.drawImage(background, backgroundPos.x, backgroundPos.y, canvas.width, canvas.height);
    console.log("MapBorders Requested");
    readingBorders = true;
    let playerPos = {x: round(canvas.width/2-30), y: round(canvas.height/2-30)};
    setTimeout(() => {let Borders = readMapBorders(playerPos);
        socket.emit("ReplyMapBorders", Borders);}, 5000);
})

function readMapBorders(pos) {
  let cpPos = copy(pos);
  let Borders = [];
  console.log("ReadMap");
  while (!isWall(cpPos.x - 1, cpPos.y)) {
    cpPos.x -= 1;
    console.log("CpPOS: " + cpPos.x + " | " + cpPos.y);
  }
  while (
    !isWall(cpPos.x - 1, cpPos.y + 1) &&
    isWall(cpPos.x - 1, cpPos.y - 1)
  ) {
    cpPos.y += 1;
    console.log("CpPOS BottomFind: " + cpPos.x + " | " + cpPos.y);
  }
  console.log("Wall Found");
  Borders.push(cpPos);
  let searchDirection = {
    deltaX: 0,
    deltaY: -1,
    checkDeltaX: -1,
    checkDeltaY: -1,
  };
  while (
    Borders.length == 1 ||
    (Borders[0].x == cpPos.x && Borders[0].y == cpPos.y)
  ) {
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
    Borders.push(cpPos);
    console.log("CpPOS WallTrack: " + cpPos.x + " | " + cpPos.y);
    searchDirection = getSearchDirection(cpPos);
    console.log("CpPOS2 WallTrack: " + cpPos.x + " | " + cpPos.y);
  }
}

function getSearchDirection(pos) {
  let searchDirection = {deltaX: 0, deltaY: 0, checkDeltaX: 0, checkDeltaY: 0};
  console.log("get search direction")
  if (!isWall(pos.x + 1, pos.y - 1) && isWall(pos.x, pos.y - 1)) {
    pos.y += -1;
      pos.x += 1; 
      console.log("change -1 1");
    searchDirection.deltaX = 0;
    searchDirection.deltaY = -1;
    searchDirection.checkDeltaX = -1;
    searchDirection.checkDeltaY = -1;
  } else if (!isWall(pos.x + 1, pos.y + 1) && isWall(pos.x + 1, pos.y)) {
      pos.y += 1;
      pos.x += 1;
      console.log("change 1 1");
    searchDirection.deltaX = 1;
    searchDirection.deltaY = 0;
    searchDirection.checkDeltaX = 1;
    searchDirection.checkDeltaY = -1;
  } else if (!isWall(pos.x - 1, pos.y - 1) && isWall(pos.x, pos.y - 1)) {
    pos.y += 1;
      pos.x += -1;
      console.log("change 1 -1");
    searchDirection.deltaX = 0;
    searchDirection.deltaY = 1;
    searchDirection.checkDeltaX = 1;
    searchDirection.checkDeltaY = 1;
  } else if (!isWall(pos.x - 1, pos.y + 1) && isWall(pos.x - 1, pos.y)) {
      pos.y += -1;
      pos.x += -1;
      console.log("change -1 -1");
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
  } else if (!isWall(pos.x - 1, pos.y) && isWall(pos.x, pos.y - 1)) {
    searchDirection.deltaX = -1;
    searchDirection.deltaY = 0;
    searchDirection.checkDeltaX = -1;
    searchDirection.checkDeltaY = -1;
  } else if (!isWall(pos.x, pos.y + 1) && isWall(pos.x - 1, pos.y)) {
    searchDirection.deltaX = 0;
    searchDirection.deltaY = -1;
    searchDirection.checkDeltaX = -1;
    searchDirection.checkDeltaY = -1;
  }
  return searchDirection;
}
