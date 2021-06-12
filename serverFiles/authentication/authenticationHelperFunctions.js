const {
  playerPos,
  killedPlayers,
  activeGames,
  roomGameLoops,
  connectedUsers,
  deadPositions,
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
      activeGames[clientRoomKey].players[id].role =
        connectedUsers[absClientId].role;
    } else {
      activeGames[clientRoomKey].players[id].role =
        activeGames[clientRoomKey].imposterIndex + 1 ==
        Object.keys(activeGames[clientRoomKey].players).length
          ? "imposter"
          : "crewmate";
      connectedUsers[absClientId].role =
        activeGames[clientRoomKey].players[id].role;
    }
  },
  setGame: function setGame(clientRoomKey, revealTime) {
    //activeGames[clientRoomKey] = {};
    activeGames[clientRoomKey].players = {};
    activeGames[clientRoomKey].state = "alive";
    //activeGames[clientRoomKey].playerCount = openLobbies[clientRoomKey].length;
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
      if(JSON.stringify(playerPos[clientRoomKey][id]) == JSON.stringify({x:0, y:0})){
        deadPositions[clientRoomKey][id] = { x: 920, y: 100 };
      }
    } else {
      playerPos[clientRoomKey][id] = getStartPoint(playerPos[clientRoomKey]);
    }
  },
  gameFull: function gameFull(clientRoomKey, id, speed, tickSpeed) {
    let imposter = false;
    console.log("TickSpeed[" + clientRoomKey + "]: " + tickSpeed);
    Object.keys(activeGames[clientRoomKey].players).forEach((playerId) => {
      if (activeGames[clientRoomKey].players[playerId].role == "imposter") {
        imposter = true;
      }
    });
    if (!imposter) {
      activeGames[clientRoomKey].players[id].role = "imposter";
    }
    if (!roomGameLoops[clientRoomKey]) {
      roomGameLoops[clientRoomKey] = setInterval(() => {
        tick(clientRoomKey, speed);
      }, tickSpeed);
    }
  },
};
