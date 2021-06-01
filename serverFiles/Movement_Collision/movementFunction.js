const { 
    deadPositions,
    movesTillCheck,
    readingBorders,
    BordersAbsolute,
    playerPos,
    killedPlayers,
    io
  } = require("../dataStructures.js");
  const {
    getPlayerCollObj,
    mergePos,
  } = require("./playerMovCollFunctions.js");
  const {
    wallCollision,
  } = require("./wallCollisionFunctions");
  const { playerCollision } = require("../evaluationFunctions.js");

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
        let deadPos = deadPositions[clientRoomKey][socket.id];
        if (!deadPos) {
          deadPos = getOwnPosition(socket.id, playerPos[clientRoomKey]);
        }
        for (let i = 0; i < speed; i++) {
          let mergedDeadPos = mergePos(deltapos, copy(deadPos));
          deadPos = mergedDeadPos;
        }
        deadPositions[clientRoomKey][socket.id] = deadPos;
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
        if (movesTillCheck[clientRoomKey][socket.id] - 70 <= 0) {
          let wallColltest = wallCollision(
            copy(mergedPos),
            copy(BordersAbsolute[clientRoomKey])
          );
          if (wallColltest.collision) {
            playerPos[clientRoomKey][id] = copy(pos);
          } else {
            movesTillCheck[clientRoomKey][socket.id] = wallColltest.minDistance;
          }
        }
        movesTillCheck[clientRoomKey][socket.id]--;
      }
    }
  },
};
