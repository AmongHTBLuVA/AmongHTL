import { socket, setId, setName, mapName } from "/script/socket.js";

socket.on("connect", () => {
});

socket.on("sendClientId", (id, absId) => {
  setId(id);
  let prevAbsId = localStorage.getItem("absID");
  if(prevAbsId){
    socket.emit("checkPreviousLogOn", prevAbsId);
  }else{
    console.log("RIP: " + prevAbsId);
    localStorage.setItem("absID", absId);
  }
});

socket.on("checkLogOn", (oldName, absID) => {
  console.log("name: " + oldName);
  if(oldName){
    logOn(oldName);
  }else{
    localStorage.setItem("absID", absID);
  }
});

function logOn(userName) {
  $(".userNamePopup").hide();
  $(".container").removeClass("popUpBackground");
  $("#username").html(userName);
  $("#userNameLabel").removeClass("hide");
  let path = window.location.pathname;
  let key = path.substr(1, path.length - 1);
  setName(userName);
  console.log(mapName);
  socket.emit(
    "authenticated",
    userName,
    key,
    mapName
  );
}

export {logOn};