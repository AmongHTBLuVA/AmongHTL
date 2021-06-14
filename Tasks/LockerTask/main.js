import { socket } from "/script/socket.js";


function myFunction() {
  var x = document.getElementById("bread");
  x.style.display = "none";
  socket.emit("taskFinished", 1);
}

export { myFunction };