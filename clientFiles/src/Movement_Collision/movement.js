import {socket, getId} from "/script/socket.js"
import {
  player,
  background,
  ctx,
  canvas,
  getWidth,
  getHeight,
} from "/script/main.js";

var keyPressed = { w: false, s: false, d: false, a: false };

function round(x) {
  const parsed = parseInt(x, 10);
  if (isNaN(parsed)) {
    return 0;
  }
  return parsed;
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
  
  function requestMovement(deltaPos, speed) {
    socket.emit("movementRequest", deltaPos, getId(), speed);
  }
  
  function setPlayerPositions(playerPos) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let pos = playerPos[getId()];
    let backgroundPos = translateMapPosistion(playerPos[getId()]);
    ctx.drawImage(background, backgroundPos.x, backgroundPos.y, background.width, background.height);
    ctx.drawImage(player, round(getWidth() / 2) - 30, round(getHeight() / 2) - 30, 70, 70);
    Object.keys(playerPos).forEach((id) => {
      if (id != getId()) {
        let relativPos = translatePlayerPosistion(playerPos[id], pos);
        ctx.drawImage(player, relativPos.x, relativPos.y, 70, 70);
      }
    });
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

export {getDeltaPos, requestMovement, setPlayerPositions}