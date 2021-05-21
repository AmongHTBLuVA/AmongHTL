import {socket} from "/script/socket.js"

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