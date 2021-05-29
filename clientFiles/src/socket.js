import "https://cdn.socket.io/3.1.3/socket.io.min.js";

var socket = io();
var Clientid = undefined;
var userName = undefined;
const mapName = "testmapKlein";

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

export { socket, setId, getId, setName, getName, mapName};
