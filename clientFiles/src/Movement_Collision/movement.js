import { socket, getId, getLocations, getOpenTasks } from "/script/socket.js";
import {
  background,
  killedOverlay,
  ctx,
  canvas,
  getWidth,
  getHeight,
  backgroundTopLayer,
} from "/script/main.js";
import { idToSkin } from "/script/skinManagement.js";

var keyPressed = { w: false, s: false, d: false, a: false };
var deadPlayerPos = undefined;
var previousDelta = { x: -2, y: -2 };

function setDeadPos(pos) {
  deadPlayerPos = pos;
}

function round(x) {
  const parsed = parseInt(x, 10);
  if (isNaN(parsed)) {
    return 0;
  }
  return parsed;
}

function deltaChange(currDelta) {
  if (previousDelta.x == currDelta.x && previousDelta.y == currDelta.y) {
    previousDelta = currDelta;
    return false;
  }
  previousDelta = currDelta;
  return true;
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
  if (
    event.keyCode == 87 ||
    event.keyCode == 65 ||
    event.keyCode == 68 ||
    event.keyCode == 83
  ) {
    let delta = getDeltaPos();
    if (deltaChange(delta)) {
      socket.emit("setMoveDirection", delta);
    }
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
  if (
    event.keyCode == 87 ||
    event.keyCode == 65 ||
    event.keyCode == 68 ||
    event.keyCode == 83
  ) {
    let delta = getDeltaPos();
    if (deltaChange(delta)) {
      socket.emit("setMoveDirection", delta);
    }
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

function setPlayerPositions(playerPos) {
  if (idToSkin) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let pos = deadPlayerPos ? deadPlayerPos : playerPos[getId()];
    let backgroundPos = translateMapPosistion(pos);
    ctx.drawImage(
      background,
      backgroundPos.x,
      backgroundPos.y,
      background.width,
      background.height
    );
    if (!deadPlayerPos) {
      ctx.drawImage(
        idToSkin[getId()],
        round(getWidth() / 2) - 30,
        round(getHeight() / 2) - 30,
        70,
        70
      );
    }
    Object.keys(playerPos).forEach((id) => {
      if (
        (id != getId() || deadPlayerPos) &&
        pos &&
        playerPos[id] &&
        (playerPos[id].x != 0 || playerPos[id].y != 0)
      ) {
        let relativPos = translatePlayerPosistion(playerPos[id], pos);
        ctx.drawImage(idToSkin[id], relativPos.x, relativPos.y, 70, 70);
        if (playerPos[id].dead) {
          ctx.drawImage(killedOverlay, relativPos.x, relativPos.y, 70, 70);
        }
      }
    });
    if (deadPlayerPos) {
      ctx.globalAlpha = 0.7;
      ctx.drawImage(
        idToSkin[getId()],
        round(getWidth() / 2) - 30,
        round(getHeight() / 2) - 30,
        70,
        70
      );
      ctx.globalAlpha = 1.0;
    } else {
      ctx.drawImage(
        backgroundTopLayer,
        backgroundPos.x,
        backgroundPos.y,
        background.width,
        background.height
      );
    }
  }
}

function translateMapPosistion(bpos) {
  if (bpos == undefined) {
    return false;
  }
  return {
    x: -bpos.x + (round(getWidth() / 2) - 30),
    y: -bpos.y + (round(getHeight() / 2) - 30),
  };
}

function translatePlayerPosistion(ppos, cpos) {
  let xdiff = ppos.x - cpos.x;
  let ydiff = ppos.y - cpos.y;
  return { x: getWidth() / 2 - 30 + xdiff, y: getHeight() / 2 - 30 + ydiff };
}


// task compass functions - update at every tick

function getAngle(cx, cy, ex, ey) {
  let dy = ey - cy;
  let dx = ex - cx;
  let theta = Math.atan2(dy, dx);
  theta *= 180 / Math.PI; 
  return theta;
}

function updateCompass(playerPos) {
  let taskIdx = 0;
  let openTasks = getOpenTasks();
  let locations = getLocations();

  if (deadPlayerPos) 
    playerPos = deadPlayerPos;
  
  if (openTasks) {
    $("[id*=triangleContainer]").each(function () { 
      if (openTasks.includes(taskIdx)) {
          let location = locations[taskIdx + 1];
          let angle = getAngle(location.x, location.y, playerPos.x, playerPos.y);
          $("#triangleContainer" + taskIdx).css("transform", `rotate(${angle}deg)`);
      } else {
        $("#triangleContainer" + taskIdx).hide();
      }
      taskIdx++;
    });
  }
}

export { getDeltaPos, setPlayerPositions, setDeadPos, updateCompass };
