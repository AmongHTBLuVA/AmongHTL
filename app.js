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
var readingBorders = {};
var BordersAbsolute = {};

var openLobbies = {};
var activeGames = {};

var connectedUsers = {};

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

function getRoomKey(openLobbies) {
  let first = (Object.keys(openLobbies).length + 10).toString(16);
  let second = new Date().getMilliseconds().toString(16);
  let thrid = (
    new Date().getSeconds() *
    (new Date().getMinutes() + 1)
  ).toString(16);
  return first.toUpperCase() + second.toUpperCase() + thrid.toUpperCase();
}

io.on("connection", (socket) => {
  console.log("[" + socket.id + "] connected on");
  var clientBorders = [];
  var clientRoomKey = undefined;
  var clientName = undefined;
  var movesTillCheck = 0;

  let timeNow = new Date();
  let absClientId =
    timeNow.getMinutes().toString(16) +
    timeNow.getFullYear().toString(16) +
    timeNow.getDay().toString(16) +
    timeNow.getSeconds().toString(16) +
    timeNow.getMilliseconds().toString(16) +
    timeNow.getMonth().toString(16);

  socket.emit("sendClientId", socket.id, absClientId);

  socket.on("checkPreviousLogOn", (prevAbsId) => {
    if (prevAbsId && connectedUsers[prevAbsId]) {
      if (
        Date.now() - connectedUsers[prevAbsId].dctime < 800 &&
        connectedUsers[prevAbsId].absUserId == prevAbsId
      ) {
        absClientId = prevAbsId;
        clientName = connectedUsers[prevAbsId].name;
        connectedUsers[prevAbsId].dctime = undefined;
        socket.emit("checkLogOn", clientName, absClientId);
        return;
      }
    }
    socket.emit("checkLogOn", clientName, absClientId);
  });

  socket.on("authenticated", (username, currentRoom) => {
    console.log("key: " + currentRoom);
    let parts = currentRoom.split("/");
    if(!connectedUsers[absClientId]){
      connectedUsers[absClientId] = {name: username, absUserId: absClientId, dctime: undefined};
    }
    if (parts.length != 1 && parts[0] == "game") {
      clientRoomKey = parts[1];
      if (!activeGames[clientRoomKey]) {
        activeGames[clientRoomKey] = [];
        playerPos[clientRoomKey] = {};
      }else if(BordersAbsolute[clientRoomKey]){
        socket.emit("translateBorders", copy(BordersAbsolute[clientRoomKey]));
      }
      activeGames[clientRoomKey].push({
        id: socket.id,
        name: username,
        role: undefined,
      });
      playerPos[clientRoomKey][socket.id] = getStartPoint(playerPos[clientRoomKey]);
      if (!BordersAbsolute[clientRoomKey] && !readingBorders[clientRoomKey]) {
        console.log("Requesting");
        readingBorders[clientRoomKey] = true;
        setTimeout(() => {
          socket.emit("RequestMapBorders");
        }, 1000);
      }
    } else {
      if (!clientName) {
        clientName = username;
      }
      if (currentRoom != "") {
        clientRoomKey = currentRoom;
        openLobbies[currentRoom].push({ id: socket.id, name: username });
      } else {
        let roomKey = getRoomKey(openLobbies);
        openLobbies[roomKey] = [];
        openLobbies[roomKey].push({ id: socket.id, name: username });
        clientRoomKey = roomKey;
      }
    }
    socket.join(clientRoomKey);
    socket.emit("assignRoomKey", clientRoomKey);
    io.to(clientRoomKey).emit("lobbyMembers", openLobbies[clientRoomKey]);
  });

  socket.on("lobbyStartRequest", (roomKey) => {
    io.to(roomKey).emit("startLobby");
  });

  app.get("/:roomKey", function (req, res) {
    let newRoomKey = req.params.roomKey;
    if (newRoomKey != "game") {
      if (openLobbies[newRoomKey] != undefined) {
        res.sendFile("/public/index.html", { root: "clientFiles" });
      } else {
        res.redirect("/");
      }
    }
  });

  socket.on("connect_timeout", () => {
    console.log("[" + socket.id + "] connection timeout");
  });

  socket.on("debug", (msg) => {
    console.log(msg);
  });

  socket.on("disconnect", () => {
    connectedUsers[absClientId].dctime = Date.now();
    console.log(
      "[" + socket.id + "] disconnected " + absClientId + " | " + clientName
    );
    if(activeGames[clientRoomKey]){
      if(activeGames[clientRoomKey].length == 1 && false){//!!!!CHANGE!!!!!
        delete activeGames[clientRoomKey];
      }else{
        let tmp = []
        activeGames[clientRoomKey].forEach(element => {
          if(element.id != socket.id){
            tmp.push(element);
          }else{
            tmp.push({id: element.id, name: element.name, role: 'dead'});
          }
        });
        activeGames[clientRoomKey] = tmp;
      }
    }
    if (openLobbies[clientRoomKey]) {
      delete openLobbies[clientRoomKey];
    }
    if (playerPos[clientRoomKey]) {
      delete playerPos[clientRoomKey][socket.id];
    }
    io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
  });

  //Movement Collision Events

  socket.on("ReplyMapBorders", (mapBorders) => {
    console.log("reply");
    BordersAbsolute[clientRoomKey] = copy(mapBorders);
    io.to(clientRoomKey).emit("translateBorders", copy(BordersAbsolute[clientRoomKey]));
    io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
    readingBorders[clientRoomKey] = false;
  });

  socket.on("stillReading", (borderTmp, searchDirection, cpPos) => {
    socket.emit("continueReading", borderTmp, searchDirection, cpPos);
  });

  socket.on("movementRequest", (deltapos, id) => {
    if (readingBorders[clientRoomKey]) {
      return;
    }
    id = socket.id;
    let pos = playerPos[clientRoomKey][id];
    mergedPos = mergePos(deltapos, copy(pos));
    playerPos[clientRoomKey][id] = mergedPos;
    let collObjs = getPlayerCollObj(
      mergedPos,
      deltapos,
      id,
      playerPos[clientRoomKey]
    );
    playerCollision(
      collObjs,
      id,
      pos,
      copy(clientBorders),
      playerPos[clientRoomKey]
    );
    if (movesTillCheck - 70 <= 0) {
      let wallColltest = wallCollision(copy(mergedPos), copy(clientBorders));
      if (wallColltest.collision) {
        playerPos[clientRoomKey][id] = copy(pos);
      } else {
        movesTillCheck = wallColltest.minDistance;
      }
    }
    movesTillCheck--;
    io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
    //socket.emit("drawBorders", copy(clientBorders), copy(mergedPos)); //DEBUG
  });

  socket.on("replyTranslatedBorders", (borders) => {
    clientBorders = copy(borders);
    io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
  });
});

server.listen(8080, function () {
  console.log("Server running at http://localhost:8080");
});
