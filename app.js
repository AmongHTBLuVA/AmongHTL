var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

var playerPos = {};

const hitbox = 70;

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

var needBorders = true;
var BordersAbsolute = [];


const {
  getPlayerCollObj,
  mergePos,
  movePlayer,
} = require("./serverFiles/positionFunctions.js");

require("./router")(app);

function getStartPoint(playerPos) {
  let pos0 = { x: 50, y: 50 };
  if (Object.keys(playerPos).length == 0) {
    return pos0;
  }
  while (getPlayerCollObj(pos0, { x: 0, y: 0 }, "", playerPos).length != 0) {
    pos0.x = pos0.x + 1;
  }
  return pos0;
}

function playerCollision(collObjs, id, pos, clientBorder) {
  if (collObjs.length == 0) {
    playerPos[id] = mergedPos;
    return false;
  } else {
    collObjs.forEach((collObj) => {
      if (collObj.inside && !collObj.collision) {
        playerPos[id] = pos;
        return;
      }
      let wallCollObj = wallCollision(playerPos[collObj.victimId], clientBorder);
      let victimColl = getPlayerCollObj(
        playerPos[collObj.victimId],
        { x: 0, y: 0 },
        collObj.victimId,
        playerPos
      );
      if(wallCollObj.collision &&
        ((wallCollObj.type.y && !collObj.top && !collObj.bottom) || 
        (wallCollObj.type.x && !collObj.right && !collObj.left))){
          console.log("collll: " + wallCollObj.collision);
        return true;
      }
      let moveObj = movePlayer(pos, collObj, victimColl, playerPos);
      playerPos[id] = moveObj.initiator;
      playerPos[collObj.victimId] = moveObj.victim;
      return true;
    });
  }
}

function wallCollision(pos, clientBorder) {
  let border0 = false;
  let colliding = false;
  let distances = [];
  copy(clientBorder).forEach((b) => {
    if (border0) {
      let dstObj = {dist: 0, type: {x: false, y:false}};
      if (border0.y - b.y >= -1 && Math.abs(border0.y - b.y) <= 2) {
        //When wall no Clip change -1 /
        dstObj.dist = border0.y - pos.y;
        dstObj.type.y = true; 
        if (
          border0.y - pos.y >= 0 &&
          border0.y - pos.y <= hitbox &&
          ((border0.x - (pos.x + hitbox) <= 0 && b.x - pos.x >= 0) ||
            (border0.x - (pos.x + hitbox) >= 0 && b.x - pos.x <= 0) ||
            (border0.x - pos.x <= 0 && b.x - (pos.x + hitbox) >= 0) ||
            (border0.x - pos.x >= 0 && b.x - (pos.x + hitbox) <= 0))
        ) {
          colliding = true;
        }
      } if (border0.x - b.x >= -1 && Math.abs(border0.x - b.x) <= 2) {
        //When wall no Clip change -1 / 2
        dstObj.dist = border0.x - pos.x;
        dstObj.type.x = true;
        if (
          border0.x - pos.x >= 0 &&
          border0.x - pos.x <= hitbox &&
          ((border0.y - (pos.y + hitbox) <= 0 && b.y - pos.y >= 0) ||
            (border0.y - (pos.y + hitbox) >= 0 && b.y - pos.y <= 0) ||
            (border0.y - pos.y <= 0 && b.y - (pos.y + hitbox) >= 0) ||
            (border0.y - pos.y >= 0 && b.y - (pos.y + hitbox) <= 0))
        ) {
          colliding = true;
        }
      }
      distances.push(copy(dstObj));
    }
    border0 = b;
  });
  if(distances[0] == undefined){
    return { collision: false, minDistance: 0, type: null};
  }
  let minDist = copy(distances[0]);
  distances.forEach((d) => {
    if (minDist.dist > Math.abs(d.dist)) {
      let cpD = copy(d);
      cpD.dist = Math.abs(cpD.dist)
      minDist = copy(cpD);
    }
  });
  console.log("mindist obj: " + minDist);
  console.log("mindist type: " + minDist.type);
  console.log("mindist: " + minDist.type.x + " | " + minDist.type.y);
  return { collision: colliding, minDistance: minDist.dist, type: copy(minDist.type)};
}

io.on("connection", (socket) => {
  console.log("a user connected");
  var readingBorders = false;
  var clientBorders = [];
  var movesTillCheck = 0;

  socket.on("requestID", () => {
    console.log("SocketID: " + socket.id);
    playerPos[socket.id] = getStartPoint(playerPos);
    socket.emit("idReply", socket.id);
  });

  socket.on("ReplyMapBorders", (mapBorders) => {
    console.log("reply");
    BordersAbsolute = copy(mapBorders);
    needBorders = false;
    socket.emit("translateBorders", BordersAbsolute);
    socket.emit("playerMovement", playerPos);
    socket.broadcast.emit("playerMovement", playerPos);
    readingBorders = false;
  });

  socket.on("stillReading", (borderTmp, searchDirection, cpPos) => {
    console.log("conitnue: " + cpPos);
    socket.emit("continueReading", borderTmp, searchDirection, cpPos);
  });

  socket.on("connect_timeout", () => {
    console.log("connection timeout");
  });

  socket.on("movementRequest", (deltapos, id) => {
    if (readingBorders) {
      return;
    }
    id = socket.id;
    let pos = playerPos[id];
    mergedPos = mergePos(deltapos, copy(pos));
    playerPos[id] = mergedPos;
    let collObjs = getPlayerCollObj(mergedPos, deltapos, id, playerPos);
    playerCollision(collObjs, id, pos, copy(clientBorders));
    if (movesTillCheck-70 <= 0) {
      let wallColltest = wallCollision(copy(mergedPos), copy(clientBorders));
      if (wallColltest.collision) {
        playerPos[id] = copy(pos);
      } else {
        movesTillCheck = wallColltest.minDistance;
      }
    }
    movesTillCheck--;
    socket.broadcast.emit("playerMovement", playerPos);
    socket.emit("playerMovement", playerPos);
    socket.emit("drawBorders", copy(clientBorders), copy(mergedPos));
  });

  socket.on("authenticated", () => {
    console.log("Borders Needed: " + needBorders);
    if (needBorders) {
      console.log("REquesting");
      needBorders = false;
      readingBorders = true;
      setTimeout(() => {
        socket.emit("RequestMapBorders");
      }, 1000);
    } else {
      socket.emit("translateBorders", BordersAbsolute);
    }
  });

  socket.on("replyTranslatedBorders", (borders) => {
    clientBorders = copy(borders);
    socket.emit("playerMovement", playerPos);
    socket.broadcast.emit("playerMovement", playerPos);
  })

  socket.on("disconnect", () => {
    let tmp = {};
    needBorders = readingBorders;
    Object.keys(playerPos).forEach((e) => {
      if (e != socket.id) {
        tmp[e] = playerPos[e];
      }
    });
    playerPos = tmp;
    socket.broadcast.emit("playerMovement", playerPos);
    socket.emit("playerMovement", playerPos);
  });
});

server.listen(8080, function () {
  console.log("Server running at http://localhost:8080");
});
