const {
  deadPositions,
  movesTillCheck,
  readingBorders,
  BordersAbsolute,
  playerPos,
  killedPlayers,
  io,
  EntityBorders,
  activeGames,
} = require("../dataStructures.js");
const { getPlayerCollObj, mergePos } = require("./playerMovCollFunctions.js");
const { wallCollision } = require("./wallCollisionFunctions");
const { playerCollision } = require("../evaluationFunctions.js");

function copy(o) {
  return JSON.parse(JSON.stringify(o));
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
      if (killedPlayers[clientRoomKey]) {
        killedPlayers[clientRoomKey][absClientId];
      }
      if (
        killedPlayers[clientRoomKey] &&
        killedPlayers[clientRoomKey][absClientId] != undefined
      ) {
        let deadPos = deadPositions[clientRoomKey][id];
        if (!deadPos) {
          if (JSON.stringify(playerPos[clientRoomKey][id]) == JSON.stringify({x:0, y:0})) {
            deadPos = { x: 920, y: 100 };
          } else {
            deadPos = playerPos[clientRoomKey][id];
          }
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
        if(activeGames[clientRoomKey].playerCollisionEnabled){
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
            playerPos[clientRoomKey],
            copy(EntityBorders[clientRoomKey])
          );
        }
        if (true) {
          //Change when better performance is needed movesTillCheck[clientRoomKey][id]
          let wallColltest = wallCollision(
            copy(mergedPos),
            copy(BordersAbsolute[clientRoomKey]),
            copy(EntityBorders[clientRoomKey])
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
