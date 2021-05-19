const hitbox = 70;

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

module.exports = {
  wallCollision: function wallCollision(pos, clientBorder, wallHitboxTol) {
    if (wallHitboxTol == undefined || wallHitboxTol == null) {
      wallHitboxTol = 0;
    }
    let border0 = false;
    let colliding = { x: false, y: false };
    let distances = [];
    copy(clientBorder).forEach((b) => {
      if (border0) {
        let dst = 0;
        if (border0.y - b.y >= -1 && Math.abs(border0.y - b.y) <= 2) {
          //When wall no Clip change -1 / 2
          dst = border0.y - pos.y;
          if (
            border0.y - pos.y >= wallHitboxTol &&
            border0.y - pos.y <= hitbox &&
            ((border0.x - (pos.x + hitbox) <= 0 && b.x - pos.x >= 0) ||
              (border0.x - (pos.x + hitbox) >= 0 && b.x - pos.x <= 0) ||
              (border0.x - pos.x <= 0 && b.x - (pos.x + hitbox) >= 0) ||
              (border0.x - pos.x >= 0 && b.x - (pos.x + hitbox) <= 0))
          ) {
            colliding.y = true;
          }
        }
        if (border0.x - b.x >= -1 && Math.abs(border0.x - b.x) <= 2) {
          //When wall no Clip change -1 / 2
          dst = border0.x - pos.x;
          if (
            border0.x - pos.x >= wallHitboxTol &&
            border0.x - pos.x <= hitbox &&
            ((border0.y - (pos.y + hitbox) <= 0 && b.y - pos.y >= 0) ||
              (border0.y - (pos.y + hitbox) >= 0 && b.y - pos.y <= 0) ||
              (border0.y - pos.y <= 0 && b.y - (pos.y + hitbox) >= 0) ||
              (border0.y - pos.y >= 0 && b.y - (pos.y + hitbox) <= 0))
          ) {
            colliding.x = true;
          }
        }
        distances.push(copy(dst));
      }
      border0 = b;
    });
    if (distances[0] == undefined || (!colliding.x && !colliding.y)) {
      return { collision: false, minDistance: 0 };
    }
    let minDist = Math.abs(copy(distances[0]));
    distances.forEach((d) => {
      if (minDist > Math.abs(d)) {
        minDist = Math.abs(copy(d));
      }
    });
    return { collision: colliding, minDistance: minDist };
  },
};
