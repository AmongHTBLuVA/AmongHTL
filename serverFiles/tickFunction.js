const { movePlayer } = require("./Movement_Collision/movementFunction.js");
const {
  deltaPositions,
  playerPos,
  io,
  socketToSessionID,
  activeGames,
} = require("./dataStructures.js");

module.exports = {
  tick: function tick(clientRoomKey, speed) {
    if (activeGames[clientRoomKey].state == "alive") {
      Object.keys(playerPos[clientRoomKey]).forEach((id) => {
        movePlayer(
          deltaPositions[clientRoomKey][id],
          socketToSessionID[id],
          id,
          clientRoomKey,
          speed
        );
      });
      io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
      //socket.emit("drawBorders", copy(clientBorders), copy(mergedPos)); //DEBUG
    }
  },
};
