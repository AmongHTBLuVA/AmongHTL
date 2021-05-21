var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
require("./router")(app);

const {
  getPlayerCollObj,
  mergePos,
} = require("./serverFiles/Movement_Collision/playerMovCollFunctions.js");
const {
  wallCollision,
} = require("./serverFiles/Movement_Collision/wallCollisionFunctions");
const {
  getStartPoint,
  playerCollision,
} = require("./serverFiles/evaluationFuctions.js");

var playerPos = {};
var needBorders = true;
var readingBorders = false;
var BordersAbsolute = [];

var openLobbies = {};

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

function getRoomKey(openLobbies) {
  let first = (Object.keys(openLobbies).length + 10).toString(16);
  let second = (
    new Date().getMilliseconds() * new Date().getSeconds()
  ).toString(16);
  return first.toUpperCase() + second.toUpperCase();
}

io.on("connection", (socket) => {
  console.log("[" + socket.id + "] connected on");
  var clientBorders = [];
  var clientRoomKey = undefined;
  var movesTillCheck = 0;

  playerPos[socket.id] = getStartPoint(playerPos);
  socket.emit("sendClientId", socket.id);

  socket.on("authenticated", (username, currentRoom) => {
    console.log("key: " + (currentRoom == ""));
    if (currentRoom != "") {
      clientRoomKey = currentRoom;
      openLobbies[currentRoom].push(socket.id);
    } else {
      let roomKey = getRoomKey(openLobbies);
      openLobbies[roomKey] = [];
      openLobbies[roomKey].push(socket.id);
      clientRoomKey = roomKey;
    }
    socket.join(clientRoomKey);
    socket.emit("assignRoomKey", clientRoomKey);
    io.to(clientRoomKey).emit("lobbyMembers", openLobbies[clientRoomKey]);
  });

  /*  socket.on("startGame", () => {
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
  });*/

  app.get("/:roomKey", function (req, res) {
    let newRoomKey = req.params.roomKey;
    if (openLobbies[newRoomKey]) {
      res.sendFile("/public/index.html", { root: "clientFiles" });
    } else {
      res.redirect("/");
    }
  });

  socket.on("connect_timeout", () => {
    console.log("[" + socket.id + "] connection timeout");
  });

  socket.on("disconnect", () => {
    let tmp = {};
    console.log("[" + socket.id + "] disconnected");
    needBorders = readingBorders;
    if (openLobbies[clientRoomKey]) {
      delete openLobbies[clientRoomKey];
    }
    delete playerPos[socket.id];
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
    if (movesTillCheck - 70 <= 0) {
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
  });
});

server.listen(8080, function () {
  console.log("Server running at http://localhost:8080");
});
