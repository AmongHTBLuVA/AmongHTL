const {
  playerPos,
  killedPlayers,
  openLobbies,
  activeGames,
  roomGameLoops,
  connectedUsers,
} = require("../dataStructures.js");
const { getStartPoint } = require("../evaluationFunctions.js");
const { tick } = require("../tickFunction.js");

function getImposter(playerCount) {
  let rand = Math.random();
  return Math.floor(playerCount * rand);
}

module.exports = {
  assignRole: function assignRole(absClientId, id, clientRoomKey) {
    if (connectedUsers[absClientId].role) {
      console.log("Existing Role: " + connectedUsers[absClientId].role);
      activeGames[clientRoomKey].players[id].role =
        connectedUsers[absClientId].role;
    } else {
      activeGames[clientRoomKey].players[id].role =
        activeGames[clientRoomKey].imposterIndex + 1 ==
        Object.keys(activeGames[clientRoomKey].players).length
          ? "imposter"
          : "crewmate";
    }
  },
  setGame: function setGame(clientRoomKey, revealTime) {
    activeGames[clientRoomKey] = {};
    activeGames[clientRoomKey].players = {};
    activeGames[clientRoomKey].playerCount = openLobbies[clientRoomKey].length;
    activeGames[clientRoomKey].imposterIndex = getImposter(
      activeGames[clientRoomKey].playerCount
    );
    let time = new Date();
    time.setSeconds(time.getSeconds() + revealTime);
    activeGames[clientRoomKey].startTime = time;
    playerPos[clientRoomKey] = {};
  },
  setStartingPosition: function setStartingPosition(
    clientRoomKey,
    absClientId,
    id
  ) {
    if (
      killedPlayers[clientRoomKey] &&
      killedPlayers[clientRoomKey][absClientId]
    ) {
      playerPos[clientRoomKey][id] = killedPlayers[clientRoomKey][absClientId];
    } else {
      playerPos[clientRoomKey][id] = getStartPoint(playerPos[clientRoomKey]);
    }
  },
  gameFull: function gameFull(clientRoomKey, id, speed, tickSpeed) {
    let imposter = false;
    Object.keys(activeGames[clientRoomKey].players).forEach((playerId) => {
      if (activeGames[clientRoomKey].players[playerId].role == "imposter") {
        imposter = true;
      }
    });
    if (!imposter) {
      activeGames[clientRoomKey].players[id].role = "imposter";
    }
    roomGameLoops[clientRoomKey] = setInterval(() => {
      tick(clientRoomKey, speed);
    }, tickSpeed);
  },
};
