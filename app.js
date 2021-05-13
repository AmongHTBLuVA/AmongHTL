var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

var playerPos = {};

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

var needBorders = true;
var Borders = [];

const {
  getPlayerCollObj,
  mergePos,
  movePlayer,
  validCollision,
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

function playerCollision(collObjs, id, pos, playerPos) {
  if (collObjs.length == 0) {
    playerPos[id] = mergedPos;
    return false;
  } else {
    collObjs.forEach((collObj) => {
      if (collObj.inside && !collObj.collision) {
        playerPos[id] = pos;
        return;
      }
      let victimColl = getPlayerCollObj(
        playerPos[collObj.victimId],
        { x: 0, y: 0 },
        collObj.victimId,
        playerPos
      );
      let moveObj = movePlayer(pos, collObj, victimColl, playerPos);
      playerPos[id] = moveObj.initiator;
      playerPos[collObj.victimId] = moveObj.victim;
      return true;
    });
  }
}

io.on("connection", (socket) => {
  console.log("a user connected");
  var readingBorders = false;

  socket.on("requestID", () => {
    console.log("SocketID: " + socket.id);
    playerPos[socket.id] = getStartPoint(playerPos);
    socket.emit("idReply", socket.id);
    console.log(needBorders);
    if (needBorders) {
      console.log("REquesting");
      needBorders = false;
      readingBorders = true;
      socket.emit("RequestMapBorders", playerPos[socket.id]);
    } else {
      socket.emit("playerMovement", playerPos);
      socket.broadcast.emit("playerMovement", playerPos);
    }
  });

  socket.on("ReplyMapBorders", (mapBorders) => {
    Borders = copy(mapBorders);
    readingBorders = false;
    socket.emit("playerMovement", playerPos);
    socket.broadcast.emit("playerMovement", playerPos);
  });

  socket.on("movementRequest", (deltapos, wallCollisionObj, id) => {
    if (readingBorders) {
      return;
    }
    id = socket.id;
    let pos = playerPos[id];
    mergedPos = mergePos(deltapos, copy(pos));
    playerPos[id] = mergedPos;
    let collObjs = getPlayerCollObj(mergedPos, deltapos, id, playerPos);
    if (!playerCollision(collObjs, id, pos, playerPos)) {
      if (!validCollision(wallCollisionObj, deltapos)) {
        playerPos[id] = pos;
      }
    }
    socket.broadcast.emit("playerMovement", playerPos);
    socket.emit("playerMovement", playerPos);
  });

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
