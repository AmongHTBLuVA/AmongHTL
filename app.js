const {
  authenticate,
  cleanUp,
  getAbsoluteID,
} = require("./serverFiles/authentication/authenticationFunctions.js");
const {
  deltaPositions,
  deadPositions,
  movesTillCheck,
  readingBorders,
  BordersAbsolute,
  playerPos,
  openLobbies,
  activeGames,
  connectedUsers,
  app,
  io,
  server,
  InteractableLocation,
  OpenTasks,
  socketToSessionID,
  killedPlayers,
} = require("./serverFiles/dataStructures.js");
const fs = require("fs");
const {
  setMeeting,
  voteImposter,
  votingTimeUp,
} = require("./serverFiles/meetingFunctions.js");
const { addKilledPlayer } = require("./serverFiles/evaluationFunctions.js");

require("./router")(app);

const reconnectionTime = 60000;
const baseCooldown = 200000; //killcooldown = basecooldown / playerCount
const emergencyCooldown = 65000;

//-----------------utility functions------------------------

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

function calcDist(playerA, playerB) {
  let a = playerA.x - playerB.x;
  let b = playerA.y - playerB.y;

  return Math.sqrt(a * a + b * b);
}

function checkInteraction(pos, roomKey, id) {
  var hitbox = 80;
  let type = false;

  if (pos.dead) {
    pos = deadPositions[roomKey][id];
  }
  Object.keys(playerPos[roomKey]).forEach((playerID) => {
    if (playerPos[roomKey][playerID].dead && id != playerID) {
      let element = playerPos[roomKey][playerID];
      let right = Math.floor(element.x - (pos.x - hitbox));
      let left = Math.floor(element.x - hitbox - pos.x);
      let bottom = Math.floor(element.y + hitbox - pos.y);
      let top = Math.floor(element.y - (pos.y + hitbox));
      let inside =
        ((right >= 0 && right <= hitbox) || (left <= 0 && left >= -hitbox)) &&
        ((bottom >= 0 && bottom <= hitbox) || (top <= 0 && top >= -hitbox));
      if (inside) {
        playerPos[roomKey][playerID] = { x: 0, y: 0 };
        killedPlayers[roomKey][socketToSessionID[playerID]] = { x: 0, y: 0 };
        type = -2;
      }
    }
  });
  if (!type) {
    InteractableLocation[roomKey].forEach((element) => {
      if (element.id == -1) {
        hitbox = 90;
      }
      let right = Math.floor(element.x - (pos.x - hitbox));
      let left = Math.floor(element.x - hitbox - pos.x);
      let bottom = Math.floor(element.y + hitbox - pos.y);
      let top = Math.floor(element.y - (pos.y + hitbox));
      let inside =
        ((right >= 0 && right <= hitbox) || (left <= 0 && left >= -hitbox)) &&
        ((bottom >= 0 && bottom <= hitbox) || (top <= 0 && top >= -hitbox));
      if (inside) {
        type = element.id;
      }
      hitbox = 60;
    });
  }

  return type;
}

//-----------------socket stuff------------------------------

io.on("connection", (socket) => {
  console.log("[" + socket.id + "] connected on");
  var nextKillTime = undefined;
  var killCooldown = undefined;

  var clientRoomKey = undefined;
  var clientName = undefined;
  var role = undefined;
  var ping = undefined;

  let absClientId = getAbsoluteID();

  socket.emit("sendClientId", socket.id, absClientId);

  socket.emit("pingRequest", new Date(), ping);

  socket.on("pingResponse", (time) => {
    time = new Date(time);
    let currentTime = new Date();
    ping =
      currentTime.getMilliseconds() +
      currentTime.getSeconds() * 1000 -
      (time.getMilliseconds() + time.getSeconds() * 1000);
    setTimeout(() => {
      socket.emit("pingRequest", new Date(), ping);
    }, 600);
  });

  socket.on("checkPreviousLogOn", (prevAbsId, bcheck) => {
    if (prevAbsId && connectedUsers[prevAbsId]) {
      if (
        Date.now() - connectedUsers[prevAbsId].dctime < reconnectionTime &&
        connectedUsers[prevAbsId].absUserId == prevAbsId
      ) {
        absClientId = prevAbsId;
        clientName = connectedUsers[prevAbsId].name;
        role = connectedUsers[prevAbsId].role;
        connectedUsers[prevAbsId].dctime = undefined;
        connectedUsers[prevAbsId].b = bcheck;
        socket.emit("checkLogOn", clientName, absClientId);
        return;
      }
    }
    socket.emit("checkLogOn", clientName, absClientId);
  });

  socket.on("authenticated", (username, currentRoom, mapName) => {
    if (!ping) {
      ping = 300;
    }
    let authentiaction = authenticate(
      socket,
      username,
      currentRoom,
      absClientId,
      clientRoomKey,
      clientName,
      mapName,
      role,
      ping
    );
    clientName = authentiaction.clientName;
    clientRoomKey = authentiaction.clientRoomKey;
    console.log("roomkey: " + clientRoomKey);
    movesTillCheck[clientRoomKey] = {};
    movesTillCheck[clientRoomKey][socket.id] = 0;
    deltaPositions[clientRoomKey] = {};
    deadPositions[clientRoomKey] = {};

    console.log(socket.id + " authenticated : " + clientName);
    socket.join(clientRoomKey);
    socket.emit("assignRoomKey", clientRoomKey);
    io.to(clientRoomKey).emit("lobbyMembers", openLobbies[clientRoomKey]);
    io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
    io.to(clientRoomKey).emit(
      "sendTaskLocations",
      InteractableLocation[clientRoomKey]
    );
    io.to(clientRoomKey).emit("openTasks", OpenTasks[clientRoomKey]);
  });

  socket.on("lobbyStartRequest", (roomKey) => {
    console.log("starting lobby: " + roomKey);
    activeGames[clientRoomKey] = {};
    if (openLobbies[clientRoomKey]) {
      activeGames[clientRoomKey].playerCount =
        openLobbies[clientRoomKey].length;
      io.to(roomKey).emit("startLobby");
    }
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
    cleanUp(socket, absClientId, clientRoomKey, clientName);
    io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
  });

  //----------Action Request Events-----------------------------------------

  socket.on("actionRequest", () => {
    let interaction = checkInteraction(
      copy(playerPos[clientRoomKey][socket.id]),
      clientRoomKey,
      socket.id
    );
    let role = connectedUsers[absClientId].role;
    let now = new Date();
    //!!!!!!!!!!!!!!!!!!!!!
        socket.emit("task", 1);
        return;
    //!!!!!!!!!!!!!!!!!!!!!
    if (interaction != undefined) {
      if (
        interaction == -2 ||
        (interaction == -1 &&
          (!activeGames[clientRoomKey].meetingCooldown ||
            activeGames[clientRoomKey].meetingCooldown - now.getTime()<= 0))
      ) {
        setMeeting(clientRoomKey, socket.id);
      } else if (interaction == -1) {
        playerPos[clientRoomKey][socket.id].dead = "none";
        socket.emit(
          "meetingCooldown",
          Math.floor((activeGames[clientRoomKey].meetingCooldown - now.getTime()) / 1000)
        );
      } else if (role == "crewmate") {
        socket.emit("task", interaction);
        activeGames[clientRoomKey].players[socket.id].using = true;
      }
    }
  });

  socket.on("taskFinished", (taskId) => {
    if(OpenTasks[clientRoomKey].length == 1){
      io.to(clientRoomKey).emit("gameEnd", "c", activeGames[clientRoomKey].players);
      activeGames[clientRoomKey].state = "over";
    }
    OpenTasks[clientRoomKey].forEach((e, i) => {
      if(e == taskId){
        OpenTasks[clientRoomKey].splice(i, 1);
      }
    })
    io.to(clientRoomKey).emit("openTasks", OpenTasks[clientRoomKey]);
    activeGames[clientRoomKey].players[socket.id].using = false;
  });

  //----------Emergency Meeting Events--------------------------------------

  socket.on("voteForImposter", (votedPlayer) => {
    voteImposter(votedPlayer, clientRoomKey, socket.id);
    now = new Date();
    activeGames[clientRoomKey].meetingCooldown = now.setTime(
      now.getTime() + emergencyCooldown
    );
  });

  socket.on("votingTimeUp", () => {
    votingTimeUp(clientRoomKey);
    now = new Date();
    activeGames[clientRoomKey].meetingCooldown = now.setTime(
      now.getTime() + emergencyCooldown
    );
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
    if (deltaPositions[clientRoomKey]) {
      deltaPositions[clientRoomKey][socket.id] = delta;
    }
  });

  socket.on("continueGame", () => {
    activeGames[clientRoomKey].state = "alive";
  });

  //----------Client Action Events-------------------------------------------

  socket.on("killRequest", (id) => {
    let role = connectedUsers[absClientId].role;
    let now = new Date();
    let timeTillkill = undefined;
    if (nextKillTime) {
      let nextKill = new Date(nextKillTime);
      timeTillkill = nextKill.getTime() - now.getTime();
    }

    if (!timeTillkill || timeTillkill <= 0) {
      if (activeGames[clientRoomKey].state == "alive" && role == "imposter") {
        let allPlayerPos = playerPos[clientRoomKey];
        let currPos = allPlayerPos[id];
        for (const playerId in allPlayerPos) {
          if (playerId != id) {
            let playerPos = allPlayerPos[playerId];
            let dist = calcDist(currPos, playerPos);

            if (dist <= 100) {
              addKilledPlayer(clientRoomKey, playerId);
              if (!killCooldown) {
                killCooldown =
                  baseCooldown / activeGames[clientRoomKey].playerCount;
              }
              now = new Date();
              nextKillTime = now.setTime(now.getTime() + killCooldown);
              return;
            }
          }
        }
      }
    } else {
      socket.emit("killCooldown", Math.floor(timeTillkill / 1000));
    }
  });
});

server.listen(8080, function () {
  console.log("Server running at http://localhost:8080");
});
