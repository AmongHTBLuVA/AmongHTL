import {
  socket,
  setId,
  setName,
  mapName,
  setLocations,
  getplayerRole,
  setOpenTasks,
  setRoomKey,
} from "/script/socket.js";
import { idToSkin } from "/script/skinManagement.js";

window.endTask = function (taskID) {
  setTimeout(() => {
    socket.emit("taskFinished", taskID);
    $("#taskFrame").hide();
  }, 500);
};

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

var cooldownDsp2 = 0;
socket.on("meetingCooldown", (timeTillMeeting) => {
  $(".cooldownContainer").removeClass("hide");
  $(".cooldownContainer").removeClass("fade");
  $("#cooldownLeft").html(timeTillMeeting);
  cooldownDsp2++;
  setTimeout(() => {
    $(".cooldownContainer").addClass("fade");
    setTimeout(() => {
      if (cooldownDsp2 == 1) {
        $(".cooldownContainer").removeClass("fade");
        $(".cooldownContainer").addClass("hide");
      }
      cooldownDsp2--;
    }, 3000);
  }, 1000);
});

socket.on("gameEnd", (outcome, players) => {
  gameEnd(players, outcome);

  setTimeout(() => {
    window.location = "https://www.amonghtl.games";
  }, 35000);
});

function logOn(userName) {
  $(".userNamePopup").hide();
  $(".container").removeClass("popUpBackground");
  $("#username").html(userName);
  $("#userNameLabel").removeClass("hide");
  let path = window.location.pathname;
  let key = path.substr(1, path.length - 1);
  let parts = key.split("/");
  setRoomKey(parts[parts.length - 1]);
  setName(userName);
  socket.emit("authenticated", userName, key, mapName);
}

function gameEnd(players, outcome) {
  $(".container").show();
  $(".gameContainer").addClass("fade");
  setTimeout(() => {
    $(".gameContainer").hide();
  }, 4000);
  let playerCount = Object.keys(players).length;
  if (outcome == "i") {
    playerCount = 1;
  } else {
    playerCount--;
  }
  let size = 230;
  let sizeOffset = 0.3;
  let marginOffset = 50;
  let margin = -(Math.floor(playerCount / 2) * marginOffset);
  let marginMax = playerCount * marginOffset;
  let i = 0;
  var BreakException = {};
  let text = undefined;
  if (
    (outcome == "c" && getplayerRole() == "crewmate") ||
    (outcome == "i" && getplayerRole() == "imposter")
  ) {
    text = "Victory";
    $(".gameBackground").removeClass("imposter");
  } else {
    text = "Defeat";
    $(".gameBackground").addClass("imposter");
  }
  $("#roleReveal").html(text);
  $(".crwMateText").hide();
  $(".playerDisplay").empty();
  console.log(Object.keys(players).length);
  Object.keys(players).forEach((playerID) => {
    console.log(players[playerID]);
    if (
      (outcome == "c" && players[playerID].role != "imposter") ||
      (outcome == "i" && players[playerID].role == "imposter")
    ) {
      let iSize = Math.floor(
        size *
          (1 -
            (Math.abs(margin) / marginMax) *
              (Math.abs(margin) / marginOffset) *
              sizeOffset)
      );
      iSize = iSize == 0 ? 1 : iSize;
      let posneg = margin < 0 ? -1 : 1;
      $(".playerDisplay").append(
        `<img src='${idToSkin[playerID].src}'` +
          "style='margin-bottom: " +
          Math.abs(margin) +
          "px;" +
          "width:" +
          iSize +
          "px;" +
          "height:" +
          iSize +
          "px;" +
          "position:absolute;" +
          "left:" +
          Math.floor(
            (Math.abs(margin) / marginMax) *
              (iSize + 260) *
              (playerCount / 2.6) *
              posneg
          ) +
          "px;" +
          "z-index:" +
          (marginMax - Math.abs(margin)) +
          ";" +
          "filter: brightness(" +
          (1 - (Math.abs(margin) / (marginOffset * 10)) * 1.2) +
          ");'></img>"
      );
      margin += marginOffset;
      i++;
    }
  });
}

export { logOn };
