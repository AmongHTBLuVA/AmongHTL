const {
  authenticate,
  cleanUp,
  getAbsoluteID,
} = require("./serverFiles/authenticationFunctions.js");
const {
  deltaPositions,
  deadPositions,
  movesTillCheck,
  readingBorders,
  BordersAbsolute,
  playerPos,
  killedPlayers,
  openLobbies,
  activeGames,
  connectedUsers,
  socketToSessionID,
  app,
  io,
  server
} = require("./serverFiles/dataStructures.js");
const fs = require("fs");

require("./router")(app);

const reconnectionTime = 15000;

//-----------------utility functions------------------------

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

function calcDist(playerA, playerB) {
  let a = playerA.x - playerB.x;
  let b = playerA.y - playerB.y;

  return Math.sqrt(a * a + b * b);
}

function addKilledPlayer(roomId, playerId) {
  if (killedPlayers[roomId] == undefined) {
    killedPlayers[roomId] = {};
  }
  console.log("abs: " + socketToSessionID[playerId]);
  let absId = socketToSessionID[playerId];
  killedPlayers[roomId][absId] = playerPos[roomId][playerId];
}

function getOwnPosition(id, players) {
  let pos = undefined;
  Object.keys(players).forEach((pId) => {
    if (pId == id) {
      pos = players[pId];
    }
  });
  return pos;
}

//-----------------socket stuff------------------------------

io.on("connection", (socket) => {
  console.log("[" + socket.id + "] connected on");
  var clientRoomKey = undefined;
  var clientName = undefined;
  var role = undefined;

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
        role = connectedUsers[prevAbsId].role;
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
      absClientId,
      clientRoomKey,
      clientName,
      mapName,
      role
    );
    clientName = authentiaction.clientName;
    clientRoomKey = authentiaction.clientRoomKey;
    movesTillCheck[clientRoomKey] = {};
    movesTillCheck[clientRoomKey][socket.id] = 0;
    deltaPositions[clientRoomKey] = {};
    deadPositions[clientRoomKey] = {};

    console.log(socket.id + " authenticated : " + clientName);
    socket.join(clientRoomKey);
    socket.emit("assignRoomKey", clientRoomKey);
    io.to(clientRoomKey).emit("lobbyMembers", openLobbies[clientRoomKey]);
    io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
  });

  socket.on("lobbyStartRequest", (roomKey) => {
    console.log("starting lobby: " + roomKey);
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
      killedPlayers,
      absClientId,
      activeGames,
      clientRoomKey,
      openLobbies,
      playerPos,
      clientName,
      socketToSessionID,
      deadPositions,
      deltaPositions,
      movesTillCheck
    );
    io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
  });

  //----------Movement Collision Events-------------------------------------

  socket.on("ReplyMapBorders", (mapBorders, mapName) => {
    console.log("reply");
    BordersAbsolute[clientRoomKey] = copy(mapBorders);
    fs.writeFile(
      "./serverFiles/borders/" + mapName + ".json",
      JSON.stringify(BordersAbsolute[clientRoomKey]),
      function (err) {
        if (err) throw err;
        console.log("Saved!");
      }
    );
    io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
    readingBorders[clientRoomKey] = false;
  });

  socket.on("stillReading", (borderTmp, searchDirection, cpPos) => {
    socket.emit("continueReading", borderTmp, searchDirection, cpPos);
  });

  socket.on("setMoveDirection", (delta) => {
    deltaPositions[clientRoomKey][socket.id] = delta;
    console.log("set: " + deltaPositions[clientRoomKey][socket.id]);
  });

  //----------Client Action Events-------------------------------------------

  socket.on("killRequest", (id) => {
    let allPlayerPos = playerPos[clientRoomKey];
    let currPos = allPlayerPos[id];

    for (const playerId in allPlayerPos) {
      if (playerId != id) {
        let playerPos = allPlayerPos[playerId];
        let dist = calcDist(currPos, playerPos);

        if (dist <= 100) {
          console.log(
            `player ${id} killed player ${socketToSessionID[playerId]}`
          );
          addKilledPlayer(clientRoomKey, playerId);
        }
      }
    }
  });
});

server.listen(8080, function () {
  console.log("Server running at http://localhost:8080");
});
