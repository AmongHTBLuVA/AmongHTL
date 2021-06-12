import { socket, setplayerRole } from "/script/socket.js";

$(document).on("ready", () => {
  setTimeout(() => {
    $(".bkgFade").removeClass("fadeInital");
    $(".bkgFadeNarrow").removeClass("fadeInital");
  }, 200);
});

socket.on("assignRole", (role, playerCount, time) => {
  console.log("TIME: " + time);
  playerCount--;
  $("#buttonContainer").show();
  if(role == "imposter"){
    $("#roleReveal").html("Imposter");
    $("h3").hide();
    $("body").addClass("imposter");
    playerCount = 1;
  } else if (role == "crewmate") {
    $("#killButton").hide();
  }

  $(".container").removeClass("hide");
    console.log("role: " + role);
    setplayerRole(role);

    let size = 230;
    let sizeOffset = 0.3;
    let marginOffset = 50;
    let margin = -(Math.floor(playerCount / 2) * marginOffset);
    let marginMax = playerCount * marginOffset;
    for (let i = 0; i < playerCount; i++) {
      let iSize = Math.floor(
        size *
          (1 -
            ((Math.abs(margin) / marginMax) *
              (Math.abs(margin) / marginOffset) *
              sizeOffset))
    );
    iSize = iSize == 0 ? 1 : iSize;
    console.log("isize: " + iSize);
    let posneg = margin < 0 ? -1 : 1;

    $(".playerDisplay").append(
      "<img src='/img/Wieser.png'" +
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
  }

  let startTime = new Date(time);
  let startTimeSeconds = startTime.getSeconds() + startTime.getMinutes() * 60;
  let now = new Date();
  let timeTill = startTimeSeconds - (now.getSeconds() + now.getMinutes() * 60);

  console.log("start: " + timeTill);
  setTimeout(() => {
    $(".container").hide();
    $(".gameContainer").removeClass("hide");
  }, (timeTill < 0 ? 0 : timeTill) * 1000);
});
