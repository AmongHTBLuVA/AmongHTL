import { socket } from "/script/socket.js";

$(document).ready(function () {
  $("#bread").click(function (e) { 
    e.preventDefault();
    this.style.display = "none";
    socket.emit("taskFinished", 1);
  });
});