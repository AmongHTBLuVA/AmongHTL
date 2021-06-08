const fs = require("fs");
const {
  assignRole,
  setGame,
  setStartingPosition,
  gameFull,
} = require("./authenticationHelperFunctions.js");

const revealTime = 6;
const SpeedPro100ms = 20;
var speed = 6;

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
  EntityBorders,
} = require("../dataStructures.js");

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

function getTickSpeed(ping) {
  let tmp = Math.floor(ping / 10);
  tmp /= 6;
  let tickSpeed = Math.max(30, Math.min(80, Math.floor(tmp * 10)));
  speed = tickSpeed / (100 / SpeedPro100ms);
  return tickSpeed;
}

function getHighestPing(roomKey) {
  let max = 0;
  Object.keys(activeGames[roomKey].players).forEach(id => {
    let ping = connectedUsers[socketToSessionID[id]].ping;
    if(ping > max){
      max = ping;
    }
  });
  return max;
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
    role,
    ping
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
    connectedUsers[absClientId].ping = ping;
    socketToSessionID[socket.id] = absClientId;
    if (parts.length != 1 && parts[0] == "game") {
      clientRoomKey = parts[1];
      if (activeGames[clientRoomKey] && !activeGames[clientRoomKey].players) {
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
          let borders = require("../borders/" + mapName + ".json");
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
          let tickSpeed = getTickSpeed(getHighestPing(clientRoomKey));
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
      if(connectedUsers[absClientId]){
        connectedUsers[absClientId].role = undefined;
      }
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
      if (activeGames[clientRoomKey].players) {
        delete activeGames[clientRoomKey].players[socket.id];
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
    }
    if (socketToSessionID[socket.id]) {
      delete socketToSessionID[socket.id];
    }
    if (openLobbies[clientRoomKey]) {
      for (var i = 0; i < openLobbies[clientRoomKey].length; i++) {
        if (openLobbies[clientRoomKey][i].id === socket.id) {
          openLobbies[clientRoomKey].splice(i, 1);
          i--;
        }
      }
      setTimeout(() => {
        if (openLobbies[clientRoomKey]) {
          if (openLobbies[clientRoomKey].length == 0) {
            delete openLobbies[clientRoomKey];
            delete killedPlayers[clientRoomKey];
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
