const {
  deadPositions,
  movesTillCheck,
  readingBorders,
  BordersAbsolute,
  playerPos,
  killedPlayers,
  io,
} = require("../dataStructures.js");
const { getPlayerCollObj, mergePos } = require("./playerMovCollFunctions.js");
const { wallCollision } = require("./wallCollisionFunctions");
const { playerCollision } = require("../evaluationFunctions.js");

function copy(o) {
  return JSON.parse(JSON.stringify(o));
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

module.exports = {
  movePlayer: function movePlayer(
    deltapos,
    absClientId,
    id,
    clientRoomKey,
    speed
  ) {
    if (deltapos) {
      if (readingBorders[clientRoomKey]) {
        return;
      }
      if (
        killedPlayers[clientRoomKey] &&
        killedPlayers[clientRoomKey][absClientId] != undefined
      ) {
        let deadPos = deadPositions[clientRoomKey][id];
        if (!deadPos) {
          deadPos = getOwnPosition(id, playerPos[clientRoomKey]);
        }
        for (let i = 0; i < speed; i++) {
          let mergedDeadPos = mergePos(deltapos, copy(deadPos));
          deadPos = mergedDeadPos;
        }
        deadPositions[clientRoomKey][id] = deadPos;
        io.to(id).emit("deadPlayerPos", deadPos);
        return;
      }

      for (let i = 0; i < speed; i++) {
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
        if (true) { //Change when better performance is needed movesTillCheck[clientRoomKey][id]
          let wallColltest = wallCollision(
            copy(mergedPos),
            copy(BordersAbsolute[clientRoomKey])
          );
          if (wallColltest.collision) {
            playerPos[clientRoomKey][id] = copy(pos);
          } else {
            movesTillCheck[clientRoomKey][id] = wallColltest.minDistance;
          }
        }
        movesTillCheck[clientRoomKey][id]--;
      }
    }
  },
};
