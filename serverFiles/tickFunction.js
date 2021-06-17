const { movePlayer } = require("./Movement_Collision/movementFunction.js");
const {
  deltaPositions,
  playerPos,
  io,
  socketToSessionID,
  activeGames,
  OpenTasks,
} = require("./dataStructures.js");

module.exports = {
  tick: function tick(clientRoomKey, speed) {
    if (activeGames[clientRoomKey].state == "alive") {
      Object.keys(playerPos[clientRoomKey]).forEach((id) => {
        if (!activeGames[clientRoomKey].players[id].using) {
          movePlayer(
            deltaPositions[clientRoomKey][id],
            socketToSessionID[id],
            id,
            clientRoomKey,
            speed
          );
        }
      });
      io.to(clientRoomKey).emit(
        "playerMovement",
        JSON.parse(JSON.stringify(playerPos[clientRoomKey]))
      );
      //socket.emit("drawBorders", copy(clientBorders), copy(mergedPos)); //DEBUG
    }
  },
};
