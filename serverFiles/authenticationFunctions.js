const { getStartPoint } = require("./evaluationFunctions.js");
const fs = require("fs");
const { tick } = require("./tickFunction.js");

const revealTime = 6;
const tickSpeed = 60;
const speed = 5;

const {
  readingBorders,
  BordersAbsolute,
  playerPos,
  killedPlayers,
  openLobbies,
  activeGames,
  roomGameLoops,
  connectedUsers,
  socketToSessionID,
} = require("./dataStructures.js");

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

function getRoomKey(openLobbies) {
  let first = (Object.keys(openLobbies).length + 10).toString(16);
  let second = (
    new Date().getMilliseconds() +
    new Date().getSeconds() * 1000 +
    new Date().getMinutes() * 6000
  ).toString(16);
  return first.toUpperCase() + second.toUpperCase();
}

function getImposter(playerCount) {
  let rand = Math.random();
  return Math.floor(playerCount * rand);
}

module.exports = {
  getAbsoluteID: function getAbsoluteID() {
    let timeNow = new Date();
    return (
      timeNow.getMinutes().toString(16) +
      timeNow.getFullYear().toString(16) +
      timeNow.getHours().toString(16) +
      timeNow.getDay().toString(16) +
      timeNow.getSeconds().toString(16) +
      timeNow.getMilliseconds().toString(16) +
      timeNow.getMonth().toString(16)
    );
  },
  authenticate: function authenticate(
    socket,
    username,
    currentRoom,
    absClientId,
    clientRoomKey,
    clientName,
    mapName,
    role
  ) {
    let parts = currentRoom.split("/");
    if (!connectedUsers[absClientId]) {
      connectedUsers[absClientId] = {
        name: username,
        absUserId: absClientId,
        role: role,
        dctime: undefined,
      };
    }
    socketToSessionID[socket.id] = absClientId;
    if (parts.length != 1 && parts[0] == "game") {
      clientRoomKey = parts[1];
      if (!activeGames[clientRoomKey]) {
        console.log(
          "lobby: " + openLobbies[clientRoomKey] + " | " + clientRoomKey
        );
        activeGames[clientRoomKey] = {};
        activeGames[clientRoomKey].players = {};
        activeGames[clientRoomKey].playerCount =
          openLobbies[clientRoomKey].length;
        activeGames[clientRoomKey].imposterIndex = getImposter(
          activeGames[clientRoomKey].playerCount
        );
        console.log(
          "Imposter Index: " + activeGames[clientRoomKey].imposterIndex
        );
        let time = new Date();
        time.setSeconds(time.getSeconds() + revealTime);
        activeGames[clientRoomKey].startTime = time;
        playerPos[clientRoomKey] = {};
      } else if (BordersAbsolute[clientRoomKey]) {
        socket.emit("translateBorders", copy(BordersAbsolute[clientRoomKey]));
      }
      activeGames[clientRoomKey].players[socket.id] = {
        id: socket.id,
        name: username,
        role: undefined,
      };
      if (connectedUsers[absClientId].role) {
        activeGames[clientRoomKey].players[socket.id].role =
          connectedUsers[absClientId].role;
      } else {
        console.log(
          "lenght: " + Object.keys(activeGames[clientRoomKey].players).length
        );
        activeGames[clientRoomKey].players[socket.id].role =
          activeGames[clientRoomKey].imposterIndex + 1 ==
          Object.keys(activeGames[clientRoomKey].players).length
            ? "imposter"
            : "crewmate";
      }
      if (
        killedPlayers[clientRoomKey] &&
        killedPlayers[clientRoomKey][absClientId]
      ) {
        playerPos[clientRoomKey][socket.id] =
          killedPlayers[clientRoomKey][absClientId];
      } else {
        playerPos[clientRoomKey][socket.id] = getStartPoint(
          playerPos[clientRoomKey]
        );
      }
      if (!BordersAbsolute[clientRoomKey] && !readingBorders[clientRoomKey]) {
        let path = "./serverFiles/borders/" + mapName + ".json";
        if (fs.existsSync(path)) {
          BordersAbsolute[clientRoomKey] = require("./borders/" +
            mapName +
            ".json");
        } else {
          console.log("Requesting");
          readingBorders[clientRoomKey] = true;
          setTimeout(() => {
            socket.emit("RequestMapBorders");
          }, 1000);
        }
      }
      if (
        Object.keys(activeGames[clientRoomKey].players).length ==
        activeGames[clientRoomKey].playerCount
      ) {
        let imposter = false;
        Object.keys(activeGames[clientRoomKey].players).forEach((playerId) => {
          if (activeGames[clientRoomKey].players[playerId].role == "imposter") {
            imposter = true;
          }
        });
        if (!imposter) {
          activeGames[clientRoomKey].players[socket.id].role = "imposter";
        }
        roomGameLoops[clientRoomKey] = setInterval(() => {
          tick(absClientId, clientRoomKey, speed);
        }, tickSpeed);
      }
      connectedUsers[absClientId].role =
        activeGames[clientRoomKey].players[socket.id].role;
      socket.emit(
        "assignRole",
        activeGames[clientRoomKey].players[socket.id].role,
        activeGames[clientRoomKey].playerCount,
        activeGames[clientRoomKey].startTime
      );
    } else {
      if (!clientName) {
        clientName = username;
      }
      if (currentRoom != "" && openLobbies[currentRoom]) {
        clientRoomKey = currentRoom;
        openLobbies[currentRoom].push({ id: socket.id, name: username });
      } else {
        let roomKey = getRoomKey(openLobbies);
        openLobbies[roomKey] = [];
        openLobbies[roomKey].push({ id: socket.id, name: username });
        clientRoomKey = roomKey;
      }
    }
    return { clientRoomKey: clientRoomKey, clientName: clientName };
  },
  cleanUp: function cleanUp(
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
  ) {
    if (connectedUsers[absClientId]) {
      connectedUsers[absClientId].dctime = Date.now();
    }
    console.log(
      "[" + socket.id + "] disconnected " + absClientId + " | " + clientName
    );
    if (activeGames[clientRoomKey]) {
      if (activeGames[clientRoomKey].length == 1) {
        setTimeout(() => {
          if (activeGames[clientRoomKey].length == 1) {
            delete activeGames[clientRoomKey];
            clearInterval(roomGameLoops[clientRoomKey]);
            delete roomGameLoops[clientRoomKey];
          }
        }, 5000);
      } else {
        delete activeGames[clientRoomKey].players[socket.id];
      }
    }
    if (socketToSessionID[socket.id]) {
      delete socketToSessionID[socket.id];
    }
    if (openLobbies[clientRoomKey]) {
      delete openLobbies[clientRoomKey][socket.id];
      setTimeout(() => {
        if (openLobbies[clientRoomKey]) {
          if (openLobbies[clientRoomKey].length == 1) {
            delete openLobbies[clientRoomKey];
          }
        }
      }, 2000);
    }
    if (playerPos[clientRoomKey]) {
      delete playerPos[clientRoomKey][socket.id];
    }
    if (deadPositions[clientRoomKey]) {
      delete deadPositions[clientRoomKey][socket.id];
    }
    if (deltaPositions[clientRoomKey]) {
      delete deltaPositions[clientRoomKey][socket.id];
    }
    if (movesTillCheck[clientRoomKey]) {
      delete movesTillCheck[clientRoomKey][socket.id];
    }
  },
};
