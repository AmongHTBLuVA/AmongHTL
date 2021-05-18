var player = new Image();
const playerImageUrl = "Wieser.png";

var background = new Image();
const backgroundImageUrl = "testmapKlein.png";

var canvas;
var ctx;
var readingBorders = false;
var keyPressed = { w: false, s: false, d: false, a: false };

var Clientid;
const speed = 4;
const tickIntervall = 50;

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

function tick() {
  let delta = getDeltaPos();
  if (delta.x != 0 || delta.y != 0) {
    for (let i = 0; i < speed; i++) {
      requestMovement(delta);
    }
  }
}

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
  socket.emit("movementRequest", deltaPos, Clientid);
}

function setPlayerPositions(playerPos) {
  height = window.innerHeight;
  width = window.innerWidth;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let pos = playerPos[Clientid];
  let backgroundPos = translateMapPosistion(playerPos[Clientid]);
  ctx.drawImage(background, backgroundPos.x, backgroundPos.y, width, height);
  ctx.drawImage(player, round(width / 2) - 30, round(height / 2) - 30, 70, 70);
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
  return {
    x: -bpos.x + (round(width / 2) - 30),
    y: -bpos.y + (round(height / 2) - 30),
  };
}

function translatePlayerPosistion(ppos, cpos) {
  height = window.innerHeight;
  width = window.innerWidth;
  let xdiff = ppos.x - cpos.x;
  let ydiff = ppos.y - cpos.y;
  return { x: width / 2 - 30 + xdiff, y: height / 2 - 30 + ydiff };
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

function round(x) {
  const parsed = parseInt(x, 10);
  if (isNaN(parsed)) {
    return 0;
  }
  return parsed;
}

function drawBorders(pos0, pos1) {
  ctx.strokeStyle = "#FF0000";
  ctx.beginPath();
  ctx.moveTo(pos0.x, pos0.y);
  ctx.lineTo(pos1.x, pos1.y);
  ctx.stroke();
}
