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
const { playerCollision } = require("./serverFiles/evaluationFunctions.js");
const {
  authenticate,
  cleanUp,
  getAbsoluteID,
} = require("./serverFiles/authenticationFunctions.js");
const fs = require("fs");

const reconnectionTime = 15000;

var playerPos = {};
var readingBorders = {};
var BordersAbsolute = {};

var openLobbies = {};
var activeGames = {};

var connectedUsers = {};

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

io.on("connection", (socket) => {
  console.log("[" + socket.id + "] connected on");
  var clientRoomKey = undefined;
  var clientName = undefined;
  var movesTillCheck = 0;

  let absClientId = getAbsoluteID();

  socket.emit("sendClientId", socket.id, absClientId);

  socket.on("checkPreviousLogOn", (prevAbsId) => {
    if (prevAbsId && connectedUsers[prevAbsId]) {
      if (
        Date.now() - connectedUsers[prevAbsId].dctime < reconnectionTime &&
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

  socket.on("authenticated", (username, currentRoom, mapName) => {
    let authentiaction = authenticate(
      socket,
      username,
      currentRoom,
      connectedUsers,
      openLobbies,
      absClientId,
      clientRoomKey,
      activeGames,
      playerPos,
      BordersAbsolute,
      readingBorders,
      clientName,
      mapName
    );
    clientName = authentiaction.clientName;
    clientRoomKey = authentiaction.clientRoomKey;

    socket.join(clientRoomKey);
    socket.emit("assignRoomKey", clientRoomKey);
    io.to(clientRoomKey).emit("lobbyMembers", openLobbies[clientRoomKey]);
    io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
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
    cleanUp(
      socket,
      connectedUsers,
      absClientId,
      activeGames,
      clientRoomKey,
      openLobbies,
      playerPos,
      clientName
    );
    io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
  });

//----------Movement Collision Events-------------------------------------

  socket.on("ReplyMapBorders", (mapBorders, mapName) => {
    console.log("reply");
    BordersAbsolute[clientRoomKey] = copy(mapBorders);
    fs.writeFile("./serverFiles/borders/"+ mapName + ".json", JSON.stringify(BordersAbsolute[clientRoomKey]), function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
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
      copy(BordersAbsolute[clientRoomKey]),
      playerPos[clientRoomKey]
    );
    if (movesTillCheck - 70 <= 0) {
      let wallColltest = wallCollision(copy(mergedPos), copy(BordersAbsolute[clientRoomKey]));
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

//----------Client Action Events-------------------------------------------

  socket.on("killRequest", (id) => {
    let allPlayerPos = playerPos[clientRoomKey];
    let currPos = allPlayerPos[id];

    for (const playerId in allPlayerPos) {
      if (playerId != id) {
        console.log(allPlayerPos[playerId]);

        let playerPos = allPlayerPos[playerId];
        let a = currPos.x - playerPos.x;
        let b = currPos.y - playerPos.y;

        let c = Math.sqrt( a*a + b*b );

        console.log(`distance to player ${playerId}: ${c}`);
      }
    }
  })
});

server.listen(8080, function () {
  console.log("Server running at http://localhost:8080");
});
