const { movePlayer } = require("./Movement_Collision/movementFunction.js");
const { deltaPositions, playerPos, io } = require("./dataStructures.js");

module.exports = {
  tick: function tick(absClientId, clientRoomKey, speed) {
      console.log("io: " + io);
    Object.keys(playerPos).forEach((id) => {
      movePlayer(
        deltaPositions[clientRoomKey][id],
        absClientId,
        id,
        clientRoomKey,
        speed
      );
      console.log("deltaPos: " + deltaPositions[clientRoomKey][id]);
      console.log("PlayerPos: " + playerPos[clientRoomKey]);
    });
    io.to(clientRoomKey).emit("playerMovement", playerPos[clientRoomKey]);
    //socket.emit("drawBorders", copy(clientBorders), copy(mergedPos)); //DEBUG
  },
};
