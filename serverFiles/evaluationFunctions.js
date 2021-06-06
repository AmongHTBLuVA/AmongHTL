/*This file contains Functions that directly influence Player behaivor
For Example the player Collision function directly alters the player position*/


//Requiers
const { wallCollision } = require("./Movement_Collision/wallCollisionFunctions.js");
const {
  getPlayerCollObj,
  movePlayer,
} = require("./Movement_Collision/playerMovCollFunctions.js");

function copy(o) {
    return JSON.parse(JSON.stringify(o));
}

//Functions
module.exports = {
  //Movement Collision Functions
  playerCollision: function playerCollision(collObjs, id, pos, clientBorder, playerPos, entityBorder) {
    if (collObjs.length == 0) {
      playerPos[id] = mergedPos;
      return false;
    } else {
      collObjs.forEach((collObj) => {
        if (collObj.inside && !collObj.collision) {
          playerPos[id] = pos;
          return false;
        }
        let wallCollObj = wallCollision(
          playerPos[collObj.victimId],
          clientBorder,
          entityBorder,
          -2
        );
        let victimColl = getPlayerCollObj(
          playerPos[collObj.victimId],
          { x: 0, y: 0 },
          collObj.victimId,
          playerPos
        );
        if (wallCollObj.collision) {
          if (
            (wallCollObj.collision.x && !collObj.top && !collObj.bottom) ||
            (wallCollObj.collision.y && !collObj.right && !collObj.left)
          ) {
            return true;
          }
        }
        let moveObj = movePlayer(pos, collObj, victimColl, playerPos);
        playerPos[id] = moveObj.initiator;
        playerPos[collObj.victimId] = moveObj.victim;
        return true;
      });
    }
  },
  getStartPoint : function getStartPoint(playerPos) {
    let pos0 = { x: 920, y: 100 };
    if (Object.keys(playerPos).length == 0) {
      return pos0;
    }
    while (getPlayerCollObj(pos0, { x: 0, y: 0 }, "", playerPos).length != 0) {
      pos0.y = pos0.y + 15;
    }
    return pos0;
  },
  //
};
