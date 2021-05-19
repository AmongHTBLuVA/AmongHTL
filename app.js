var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

var playerPos = {};

const hitbox = 70;

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

var needBorders = true;
var readingBorders = false;
var BordersAbsolute = [];


const {
  getPlayerCollObj,
  mergePos,
  movePlayer,
} = require("./serverFiles/positionFunctions.js");

require("./router")(app);

function getStartPoint(playerPos) {
  let pos0 = { x: 50, y: 50 };
  if (Object.keys(playerPos).length == 0) {
    return pos0;
  }
  while (getPlayerCollObj(pos0, { x: 0, y: 0 }, "", playerPos).length != 0) {
    pos0.x = pos0.x + 1;
  }
  return pos0;
}

function playerCollision(collObjs, id, pos, clientBorder) {
  if (collObjs.length == 0) {
    playerPos[id] = mergedPos;
    return false;
  } else {
    collObjs.forEach((collObj) => {
      if (collObj.inside && !collObj.collision) {
        playerPos[id] = pos;
        return;
      }
      let wallCollObj = wallCollision(playerPos[collObj.victimId], clientBorder, -2);
      let victimColl = getPlayerCollObj(
        playerPos[collObj.victimId],
        { x: 0, y: 0 },
        collObj.victimId,
        playerPos
      );
      if(wallCollObj.collision){
        if((wallCollObj.collision.x && !collObj.top && !collObj.bottom) || 
        (wallCollObj.collision.y && !collObj.right && !collObj.left)){
          return true;
        }
      }
      let moveObj = movePlayer(pos, collObj, victimColl, playerPos);
      playerPos[id] = moveObj.initiator;
      playerPos[collObj.victimId] = moveObj.victim;
      return true;
    });
  }
}

function wallCollision(pos, clientBorder, wallHitboxTol) {
  if(wallHitboxTol == undefined || wallHitboxTol == null){
    wallHitboxTol = 0;
  }
  let border0 = false;
  let colliding = {x: false, y: false};
  let distances = [];
  copy(clientBorder).forEach((b) => {
    if (border0) {
      let dst = 0;
      if (border0.y - b.y >= -1 && Math.abs(border0.y - b.y) <= 2) {
        //When wall no Clip change -1 / 2
        dst = border0.y - pos.y;
        if (
          border0.y - pos.y >= wallHitboxTol &&
          border0.y - pos.y <= hitbox &&
          ((border0.x - (pos.x + hitbox) <= 0 && b.x - pos.x >= 0) ||
            (border0.x - (pos.x + hitbox) >= 0 && b.x - pos.x <= 0) ||
            (border0.x - pos.x <= 0 && b.x - (pos.x + hitbox) >= 0) ||
            (border0.x - pos.x >= 0 && b.x - (pos.x + hitbox) <= 0))
        ) {
          colliding.y = true;
        }
      } if (border0.x - b.x >= -1 && Math.abs(border0.x - b.x) <= 2) {
        //When wall no Clip change -1 / 2
        dst = border0.x - pos.x;
        if (
          border0.x - pos.x >= wallHitboxTol &&
          border0.x - pos.x <= hitbox &&
          ((border0.y - (pos.y + hitbox) <= 0 && b.y - pos.y >= 0) ||
            (border0.y - (pos.y + hitbox) >= 0 && b.y - pos.y <= 0) ||
            (border0.y - pos.y <= 0 && b.y - (pos.y + hitbox) >= 0) ||
            (border0.y - pos.y >= 0 && b.y - (pos.y + hitbox) <= 0))
        ) {
          colliding.x = true;
        }
      }
      distances.push(copy(dst));
    }
    border0 = b;
  });
  if(distances[0] == undefined || (!colliding.x && !colliding.y)){
    return { collision: false, minDistance: 0};
  }
  let minDist = Math.abs(copy(distances[0]));
  distances.forEach((d) => {
    if (minDist > Math.abs(d)) {
      minDist = Math.abs(copy(d));
    }
  });
  return { collision: colliding, minDistance: minDist};
}

io.on("connection", (socket) => {
  console.log("a user connected");
  var clientBorders = [];
  var movesTillCheck = 0;

  socket.on("requestID", () => {
    console.log("SocketID: " + socket.id);
    playerPos[socket.id] = getStartPoint(playerPos);
    socket.emit("idReply", socket.id);
  });

  socket.on("ReplyMapBorders", (mapBorders) => {
    console.log("reply");
    BordersAbsolute = copy(mapBorders);
    needBorders = false;
    socket.emit("translateBorders", BordersAbsolute);
    socket.emit("playerMovement", playerPos);
    socket.broadcast.emit("playerMovement", playerPos);
    readingBorders = false;
  });

  socket.on("stillReading", (borderTmp, searchDirection, cpPos) => {
    socket.emit("continueReading", borderTmp, searchDirection, cpPos);
  });

  socket.on("connect_timeout", () => {
    console.log("["+ socket.id +"] connection timeout");
  });

  socket.on("movementRequest", (deltapos, id) => {
    if (readingBorders) {
      return;
    }
    id = socket.id;
    let pos = playerPos[id];
    mergedPos = mergePos(deltapos, copy(pos));
    playerPos[id] = mergedPos;
    let collObjs = getPlayerCollObj(mergedPos, deltapos, id, playerPos);
    playerCollision(collObjs, id, pos, copy(clientBorders));
    if (movesTillCheck-70 <= 0) {
      let wallColltest = wallCollision(copy(mergedPos), copy(clientBorders));
      if (wallColltest.collision) {
        playerPos[id] = copy(pos);
      } else {
        movesTillCheck = wallColltest.minDistance;
      }
    }
    movesTillCheck--;
    socket.broadcast.emit("playerMovement", playerPos);
    socket.emit("playerMovement", playerPos);
    socket.emit("drawBorders", copy(clientBorders), copy(mergedPos));
  });

  socket.on("authenticated", () => {
    if (needBorders) {
      console.log("Requesting");
      needBorders = false;
      readingBorders = true;
      setTimeout(() => {
        socket.emit("RequestMapBorders");
      }, 1000);
    } else {
      socket.emit("translateBorders", BordersAbsolute);
    }
  });

  socket.on("replyTranslatedBorders", (borders) => {
    clientBorders = copy(borders);
    socket.emit("playerMovement", playerPos);
    socket.broadcast.emit("playerMovement", playerPos);
  })

  socket.on("disconnect", () => {
    let tmp = {};
    needBorders = readingBorders;
    Object.keys(playerPos).forEach((e) => {
      if (e != socket.id) {
        tmp[e] = playerPos[e];
      }
    });
    playerPos = tmp;
    socket.broadcast.emit("playerMovement", playerPos);
    socket.emit("playerMovement", playerPos);
  });
});

server.listen(8080, function () {
  console.log("Server running at http://localhost:8080");
});
