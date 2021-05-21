import "https://cdn.socket.io/3.1.3/socket.io.min.js";

var socket = io();
var Clientid = undefined;

function setId(id) {
    Clientid = id;
}

function getId() {
    return Clientid;
}

export {socket, setId, getId};