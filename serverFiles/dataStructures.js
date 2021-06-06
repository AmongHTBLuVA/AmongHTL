//-----Socket--Express--
var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

//------Objects--------------
var socketToSessionID = {};

var playerPos = {};
var deltaPositions = {};
var deadPositions = {};
var movesTillCheck = {};
var readingBorders = {};
var BordersAbsolute = {};
var EntityBorders = {};

var openLobbies = {};
var activeGames = {};

var roomGameLoops = {};
var connectedUsers = {};

var killedPlayers = {};

//------Class--------------



//-----Exports-----

module.exports = {
    deltaPositions: deltaPositions,
    deadPositions: deadPositions,
    movesTillCheck: movesTillCheck,
    readingBorders: readingBorders,
    BordersAbsolute: BordersAbsolute,
    playerPos: playerPos,
    killedPlayers: killedPlayers,
    openLobbies : openLobbies,
    activeGames : activeGames,
    roomGameLoops : roomGameLoops,
    connectedUsers : connectedUsers,
    socketToSessionID : socketToSessionID,
    app: app,
    io: io,
    server:server,
    EntityBorders : EntityBorders
  };