import "https://cdn.socket.io/3.1.3/socket.io.min.js";

var socket = io();
var Clientid = undefined;
var userName = undefined;
var playerRole = undefined;
var TaskLocations = undefined;
var OpenTasks = undefined;
var roomKey = undefined;
const mapName = "HTL3Floor";

function setplayerRole(role) {
  playerRole = role;
}

function getplayerRole() {
  return playerRole;
}

function setRoomKey(key) {
  roomKey = key;
}

function getRoomKey() {
  return roomKey;
}

function setId(id) {
  Clientid = id;
}

function getId() {
  return Clientid;
}

function setName(name) {
  userName = name;
}

function getName() {
  if (userName) {
    return userName;
  }
  return false;
}

function setLocations(locations) {
  TaskLocations = locations;
}

function getLocations() {
  if (TaskLocations) {
    return TaskLocations;
  }
  return false;
}

function setOpenTasks(openTasks) {
  OpenTasks = openTasks;
}

function getOpenTasks() {
  if (OpenTasks) {
    return OpenTasks;
  }
  return false;
}

export {
  socket,
  setId,
  getId,
  setName,
  getName,
  getplayerRole,
  setplayerRole,
  setLocations,
  getLocations,
  setOpenTasks,
  getOpenTasks,
  setRoomKey,
  getRoomKey,
  mapName,
};
