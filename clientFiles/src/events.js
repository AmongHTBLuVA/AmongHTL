import { socket, setId, getName } from "/script/socket.js";

socket.on("connect", () => {
  /*
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  player.width = 70;
  player.height = 70;
  player.src = playerImageUrl;
  background.src = backgroundImageUrl;
  setInterval(tick, tickIntervall);*/
});

socket.on("sendClientId", (id, absId) => {
  setId(id);
  let prevAbsId = localStorage.getItem("absID");
  if(prevAbsId){
    socket.emit("checkPreviousLogOn", prevAbsId);
  }else{
    localStorage.setItem("absID", absId);
  }
  /*height = window.innerHeight;
  width = window.innerWidth;
  canvas.width = width;
  canvas.height = height;*/
});
