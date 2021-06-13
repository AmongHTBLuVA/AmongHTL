import { socket } from "/script/socket.js";

var idToSkin;
var sessionIdToSkin;

function setSkins(skins, sessionToSocketID) {
  idToSkin = {};
  sessionIdToSkin = {};
  Object.keys(skins).forEach((playerID) => {
    let img = new Image();
    switch (skins[playerID]) {
      case 0:
        img.src = "/img/skin/WieserBlue.png";
        break;
      case 1:
        img.src = "/img/skin/WieserGreen.png";
        break;
      case 2:
        img.src = "/img/skin/WieserLila.png";
        break;
      case 3:
        img.src = "/img/skin/WieserPink.png";
        break;
      case 4:
        img.src = "/img/skin/WieserWhite.png";
        break;
      case 5:
        img.src = "/img/skin/WieserYellow.png";
        break;
      case 6:
        img.src = "/img/skin/WieserDarkBlue.png";
        break;
      case 7:
        img.src = "/img/skin/Wieser.png";
        break;
      case 8:
        img.src = "/img/skin/WieserDarkBlue.png";
        break;
      case 9:
        img.src = "/img/skin/WieserTrip.png";
        break;
      case 10:
        img.src = "/img/skin/Zenitsu.png";
        break;
    }
    img.width = 70;
    img.height = 70;
    console.log("session: " + sessionToSocketID[playerID].socketID);
    idToSkin[sessionToSocketID[playerID].socketID] = img;
    sessionIdToSkin[playerID] = img;
  });
}

socket.on("assignSkins", (skins, sessionToSocketID) => {
  setSkins(skins, sessionToSocketID);
  console.log(idToSkin);
});

export { idToSkin, sessionIdToSkin };
