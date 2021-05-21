import {socket, setId} from "/script/socket.js"

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

socket.on("disconnect", () => {
  console.log("Disconnected;");
  window.clearInterval();
});

socket.on("sendClientId", (id) => {
  setId(id);
  console.log();
  /*height = window.innerHeight;
  width = window.innerWidth;
  canvas.width = width;
  canvas.height = height;*/
});
