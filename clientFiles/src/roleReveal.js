import { socket, setplayerRole, getplayerRole, getId } from "/script/socket.js";
import { idToSkin } from "/script/skinManagement.js";

$(document).on("ready", () => {
  setTimeout(() => {
    $(".bkgFade").removeClass("fadeInital");
    $(".bkgFadeNarrow").removeClass("fadeInital");
  }, 200);
});

socket.on("assignRole", (role) => {
  $("#buttonContainer").show();
  if (role == "imposter") {
    $("#roleReveal").html("Imposter");
    $("h3").hide();
    $("body").addClass("imposter");
    $("#compassContainer").hide();
  } else if (role == "crewmate") {
    $("#killButton").hide();
  }



  $(".container").removeClass("hide");
  console.log("role: " + role);
  setplayerRole(role);
});

socket.on("showRoleReveal", (players, time) => {
  roleReveal(players, time);
});

function roleReveal(players, time) {
  let role = getplayerRole();
  let playerCount = Object.keys(players).length;
  if (role == "imposter") {
    playerCount = 1;
  }
  let size = 230;
  let sizeOffset = 0.3;
  let marginOffset = 50;
  let margin = -(Math.floor(playerCount / 2) * marginOffset);
  let marginMax = playerCount * marginOffset;
  let i = 0;
  var BreakException = {};
  try {
    Object.keys(players).forEach((playerID) => {
      if (role == "imposter") {
        playerID = getId();
      }
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
      if (role == "imposter") {
        throw BreakException;
      }
      margin += marginOffset;
      i++;
    });
  } catch (e) {}
  let startTime = new Date(time);
  let startTimeSeconds = startTime.getSeconds() + startTime.getMinutes() * 60;
  let now = new Date();
  let timeTill = startTimeSeconds - (now.getSeconds() + now.getMinutes() * 60);

  console.log("start: " + timeTill);
  setTimeout(() => {
    $(".container").hide();
    $(".gameContainer").removeClass("hide");
  }, (timeTill < 0 ? 0 : timeTill) * 1000);
}