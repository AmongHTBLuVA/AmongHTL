const hitbox = 30;

const playerPushSpeed = 1;

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

module.exports = {
  getPlayerCollObj: function playerCollision(pos, deltaPos, idPos, playerPos) {
    if (
      playerPos == null ||
      playerPos == undefined ||
      pos == null ||
      pos == undefined ||
      Object.keys(playerPos).length == 0
    ) {
      return false;
    }
    let collObjs = [];
    let collision = false;
    Object.keys(playerPos).forEach((id) => {
      if (id != idPos) {
        let element = playerPos[id];
        let right = element.x - (pos.x - hitbox * 2);
        let left = element.x - hitbox * 2 - pos.x;
        let bottom = element.y + hitbox * 2 - pos.y;
        let top = element.y - (pos.y + hitbox * 2);

        let rightCollision = right == 0 && top <= 0 && top >= -hitbox * 4;
        let leftCollision = left == 0 && top <= 0 && top >= -hitbox * 4;
        let topCollision = top == 0 && left <= 0 && left >= -(hitbox * 4);
        let bottomCollision = bottom == 0 && left <= 0 && left >= -hitbox * 4;
        let inside =
          ((right >= 0 && right <= hitbox * 2) ||
            (left <= 0 && left >= -(hitbox * 2))) &&
          ((bottom >= 0 && bottom <= hitbox * 2) ||
            (top <= 0 && top >= -(hitbox * 2)));
        console.log();
        console.log("ID: " + id);
        console.log("right: " + right + " | " + rightCollision);
        console.log("left: " + left + " | " + leftCollision);
        console.log("top: " + top + " | " + topCollision);
        console.log("bottom: " + bottom + " | " + bottomCollision);
        console.log(
          "inside: [right] " +
            (right >= 0 && right <= hitbox * 2) +
            " [left] " +
            (left <= 0 && left >= hitbox * 2) +
            " [bottom] " +
            (bottom >= 0 && bottom <= hitbox * 2) +
            " [top]" +
            inside
        );
        if (deltaPos.x == 0 && deltaPos.y == 0) {
          collision =
            collision ||
            rightCollision ||
            leftCollision ||
            topCollision ||
            bottomCollision;
        } else {
          if (deltaPos.x > 0) {
            collision = collision || leftCollision;
          } else if (deltaPos.x < 0) {
            collision = collision || rightCollision;
          }
          if (deltaPos.y < 0) {
            collision = collision || bottomCollision;
          } else if (deltaPos.y > 0) {
            collision = collision || topCollision;
          }
        }
        console.log("KOLLISIONE: " + collision);
        if (collision || inside) {
          let collObj = {
            id: idPos,
            collision: collision,
            right: rightCollision,
            left: leftCollision,
            top: topCollision,
            bottom: bottomCollision,
            inside: inside,
            victimId: id,
          };
          collObjs.push(collObj);
          collision = false;
        }
      }
    });
    return collObjs;
  },
  movePlayer: function playerCollision(
    pos,
    collObj,
    victimCollObjs,
    playerPos
  ) {
    var vPos = playerPos[collObj.victimId];
    var Backup = { v: copy(vPos), p: copy(pos) };
    console.log();
    console.log("victim: " + collObj.victimId);
    console.log("initiator POS: " + pos.x + "|" + pos.y);
    console.log("victim POS: " + vPos.x + "|" + vPos.y);
    let breakLoop = false;
    victimCollObjs.forEach((victimCollObj) => {
      console.log("VICTIM OBJ: " + victimCollObj);
      if (!breakLoop) {
        if (victimCollObj.victimId == collObj.id) {
          if (collObj.bottom && victimCollObj.top) {
            console.log("bottom");
            pos.y -= playerPushSpeed;
            vPos.y -= playerPushSpeed;
          } else if (collObj.top && victimCollObj.bottom) {
            console.log("top");
            pos.y += playerPushSpeed;
            vPos.y += playerPushSpeed;
          }
          if (collObj.right && victimCollObj.left) {
            console.log("right");
            pos.x -= playerPushSpeed;
            vPos.x -= playerPushSpeed;
          } else if (collObj.left && victimCollObj.right) {
            console.log("left");
            pos.x += playerPushSpeed;
            vPos.x += playerPushSpeed;
          }
        } else {
          console.log(
            "victim coll: [bottom] " +
              victimCollObj.bottom +
              " [top] " +
              victimCollObj.top +
              " [right] " +
              victimCollObj.right +
              " [left] " +
              victimCollObj.left
          );
          console.log("victim coll: [inside] " + victimCollObj.inside);
          if (
            (collObj.bottom && victimCollObj.bottom) ||
            victimCollObj.inside
          ) {
            pos = Backup.p;
            vPos = Backup.v;
            breakLoop = true;
          } else if (collObj.top && victimCollObj.top) {
            pos = Backup.p;
            vPos = Backup.v;
            breakLoop = true;
          }
          if (collObj.right && victimCollObj.right) {
            pos = Backup.p;
            vPos = Backup.v;
            breakLoop = true;
          } else if (collObj.left && victimCollObj.left) {
            pos = Backup.p;
            vPos = Backup.v;
            breakLoop = true;
          }
        }
      }
    });
    console.log("initiatorA POS: " + pos.x + "|" + pos.y);
    console.log("victimA POS: " + vPos.x + "|" + vPos.y);
    let moveObj = { initiator: pos, victim: vPos };
    return moveObj;
  },
  mergePos: function mergePos(deltaPos, pos) {
    if (pos != undefined) {
      let tmp = { x: 0, y: 0 };
      tmp.x = pos.x + deltaPos.x;
      tmp.y = pos.y + deltaPos.y;
      return tmp;
    }
  },
  validCollision: function validCollision(wallCollisionObj, deltaPos) {
    if (
      (wallCollisionObj.topLeft && wallCollisionObj.topRight) &&
      deltaPos.y < 0
    ) {
      return false;
    } else if (
      (wallCollisionObj.bottomLeft && wallCollisionObj.bottomRight) &&
      deltaPos.y > 0
    ) {
      return false;
    }
    if (
      (wallCollisionObj.topLeft && wallCollisionObj.bottomLeft) &&
      deltaPos.x < 0
    ) {
      return false;
    } else if (
      (wallCollisionObj.bottomRight && wallCollisionObj.topRight) &&
      deltaPos.x > 0
    ) {
      return false;
    }
    return true;
  },
};
