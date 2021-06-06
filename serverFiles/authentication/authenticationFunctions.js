const fs = require("fs");
const {
  assignRole,
  setGame,
  setStartingPosition,
  gameFull,
} = require("./authenticationHelperFunctions.js");

const revealTime = 6;
const tickSpeed = 45;
const speed = 8;

const {
  readingBorders,
  BordersAbsolute,
  movesTillCheck,
  playerPos,
  killedPlayers,
  openLobbies,
  activeGames,
  roomGameLoops,
  connectedUsers,
  socketToSessionID,
  deadPositions,
  deltaPositions,
  EntityBorders
} = require("../dataStructures.js");

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
        setGame(clientRoomKey, revealTime);
      } else if (BordersAbsolute[clientRoomKey]) {
        socket.emit("translateBorders", copy(BordersAbsolute[clientRoomKey]));
      }
      activeGames[clientRoomKey].players[socket.id] = {
        id: socket.id,
        name: username,
        role: undefined,
      };
      assignRole(absClientId, socket.id, clientRoomKey);
      setStartingPosition(clientRoomKey, absClientId, socket.id);
      if (!BordersAbsolute[clientRoomKey] && !readingBorders[clientRoomKey]) {
        let path = "./serverFiles/borders/" + mapName + ".json";
        if (fs.existsSync(path)) {
          let borders = require("../borders/" +
            mapName +
            ".json");
          BordersAbsolute[clientRoomKey] = borders.walls;
          EntityBorders[clientRoomKey] = borders.entities;
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
        if (!readingBorders[clientRoomKey]) {
          gameFull(clientRoomKey, socket.id, speed, tickSpeed);
        }
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
  cleanUp: function cleanUp(socket, absClientId, clientRoomKey, clientName) {
    if (connectedUsers[absClientId]) {
      connectedUsers[absClientId].dctime = Date.now();
    }
    console.log(
      "[" + socket.id + "] disconnected " + absClientId + " | " + clientName
    );
    if (activeGames[clientRoomKey]) {
      delete activeGames[clientRoomKey].players[socket.id];
      connectedUsers[absClientId].role = undefined;
      if (Object.keys(activeGames[clientRoomKey].players).length == 0) {
        setTimeout(() => {
          if (Object.keys(activeGames[clientRoomKey].players).length == 0) {
            delete activeGames[clientRoomKey];
            clearInterval(roomGameLoops[clientRoomKey]);
            delete roomGameLoops[clientRoomKey];
          }
        }, 5000);
      }
    }
    if (socketToSessionID[socket.id]) {
      delete socketToSessionID[socket.id];
    }
    if (openLobbies[clientRoomKey]) {
      setTimeout(() => {
        for (var i = 0; i < openLobbies[clientRoomKey].length; i++) {
          if (openLobbies[clientRoomKey][i].id === socket.id) {
            openLobbies[clientRoomKey].splice(i, 1);
            i--;
          }
        }
      }, 5000);
      setTimeout(() => {
        if (openLobbies[clientRoomKey]) {
          if (openLobbies[clientRoomKey].length == 1) {
            delete openLobbies[clientRoomKey];
            delete killedPlayers[clientRoomKey];
          }
        }
      }, 6000);
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
