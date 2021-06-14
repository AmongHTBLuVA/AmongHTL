import {
  socket,
  setId,
  setName,
  mapName,
  setLocations,
  getLocations,
  setOpenTasks,
  getOpenTasks,
} from "/script/socket.js";

socket.on("connect", () => {});

socket.on("pingRequest", (time, ping) => {
  socket.emit("pingResponse", time);
  $("#ping").html(ping ? ping : "-");
});

socket.on("sendTaskLocations", (locations) => {
  setLocations(locations);
});

socket.on("sendClientId", (id, absId) => {
  setId(id);
  let prevAbsId = localStorage.getItem("absID");
  let boss = localStorage.getItem("msdb");
  console.log("boss: " + boss);
  if (prevAbsId) {
    socket.emit("checkPreviousLogOn", prevAbsId, boss);
  } else {
    localStorage.setItem("absID", absId);
  }
});

socket.on("checkLogOn", (oldName, absID) => {
  console.log("name: " + oldName);
  if (oldName) {
    logOn(oldName);
  } else {
    localStorage.setItem("absID", absID);
  }
});

socket.on("openTasks", (tasks) => {
  setOpenTasks(tasks);
});

var cooldownDsp = 0;
socket.on("killCooldown", (timeTillKill) => {
  $(".cooldownContainer").removeClass("hide");
  $(".cooldownContainer").removeClass("fade");
  $("#cooldownLeft").html(timeTillKill);
  cooldownDsp++;
  setTimeout(() => {
    $(".cooldownContainer").addClass("fade");
    setTimeout(() => {
      if (cooldownDsp == 1) {
        $(".cooldownContainer").removeClass("fade");
        $(".cooldownContainer").addClass("hide");
      }
      cooldownDsp--;
    }, 3000);
  }, 1000);
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
  socket.emit("authenticated", userName, key, mapName);
}

export { logOn };
