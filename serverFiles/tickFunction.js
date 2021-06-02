const { movePlayer } = require("./Movement_Collision/movementFunction.js");
const { deltaPositions, playerPos, io } = require("./dataStructures.js");

module.exports = {
  tick: function tick(absClientId, clientRoomKey, speed) {
    Object.keys(playerPos[clientRoomKey]).forEach((id) => {
      movePlayer(
        deltaPositions[clientRoomKey][id],
        absClientId,
        id,
        clientRoomKey,
        speed
      );});
    io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
    //socket.emit("drawBorders", copy(clientBorders), copy(mergedPos)); //DEBUG
  },
};
