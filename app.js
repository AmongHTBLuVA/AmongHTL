var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
require("./router")(app);

const {
  getPlayerCollObj,
  mergePos,
} = require("./serverFiles/Movement_Collision/playerMovCollFunctions.js");
const { wallCollision } = require("./serverFiles/Movement_Collision/wallCollisionFunctions");
const { getStartPoint, playerCollision } = require("./serverFiles/evaluationFuctions.js");

var playerPos = {};
var needBorders = true;
var readingBorders = false;
var BordersAbsolute = [];

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

io.on("connection", (socket) => {
  console.log("["+ socket.id +"] connected");
  var clientBorders = [];
  var movesTillCheck = 0;

  socket.on("requestID", () => {
    playerPos[socket.id] = getStartPoint(playerPos);
    socket.emit("idReply", socket.id);
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

  socket.on("connect_timeout", () => {
    console.log("["+ socket.id +"] connection timeout");
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

//Movement Collision Events

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

  socket.on("movementRequest", (deltapos, id) => {
    if (readingBorders) {
      return;
    }
    id = socket.id;
    let pos = playerPos[id];
    mergedPos = mergePos(deltapos, copy(pos));
    playerPos[id] = mergedPos;
    let collObjs = getPlayerCollObj(mergedPos, deltapos, id, playerPos);
    playerCollision(collObjs, id, pos, copy(clientBorders), playerPos);
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
    //socket.emit("drawBorders", copy(clientBorders), copy(mergedPos)); //DEBUG
  });

  socket.on("replyTranslatedBorders", (borders) => {
    clientBorders = copy(borders);
    socket.emit("playerMovement", playerPos);
    socket.broadcast.emit("playerMovement", playerPos);
  })

});

server.listen(8080, function () {
  console.log("Server running at http://localhost:8080");
});
