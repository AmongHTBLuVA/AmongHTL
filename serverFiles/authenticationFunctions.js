const { getStartPoint } = require("./evaluationFunctions.js");
const fs = require("fs");

const revealTime = 7;

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
    connectedUsers,
    openLobbies,
    absClientId,
    clientRoomKey,
    activeGames,
    playerPos,
    BordersAbsolute,
    readingBorders,
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
        console.log("Imposter Index: " + activeGames[clientRoomKey].imposterIndex);
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
        console.log("lenght: " + Object.keys(activeGames[clientRoomKey].players).length);
        activeGames[clientRoomKey].players[socket.id].role =
          activeGames[clientRoomKey].imposterIndex == Object.keys(activeGames[clientRoomKey].players).length ? "imposter" : "crewmate";
      }
      playerPos[clientRoomKey][socket.id] = getStartPoint(
        playerPos[clientRoomKey]
      );
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
        console.log("full");
      }
      console.log("assinging Role");
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
    absClientId,
    activeGames,
    clientRoomKey,
    openLobbies,
    playerPos,
    clientName
  ) {
    if (connectedUsers[absClientId]) {
      connectedUsers[absClientId].dctime = Date.now();
    }
    console.log(
      "[" + socket.id + "] disconnected " + absClientId + " | " + clientName
    );
    if (activeGames[clientRoomKey]) {
      if (activeGames[clientRoomKey].length == 1 && false) {
        //!!!!CHANGE!!!!!
        delete activeGames[clientRoomKey];
      } else {
        delete activeGames[clientRoomKey].players[socket.id];
      }
    }
    if (openLobbies[clientRoomKey]) {
      //delete openLobbies[clientRoomKey];
    }
    if (playerPos[clientRoomKey]) {
      delete playerPos[clientRoomKey][socket.id];
    }
  },
};
