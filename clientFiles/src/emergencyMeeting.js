import { socket } from "/script/socket.js";
import { sessionIdToSkin, idToSkin } from "/script/skinManagement.js";

var ableToVote = true;
var voteEnds = undefined;
var votingEndsTick;

$(document).on("ready", () => {
  $(".emergencyContainer").hide();
  $(".emergencyContainer").removeClass("hide");

  $("#playersContainer").on("click", "div", function () {
    $("#playersContainer").find(".VoteButtons").addClass("hide");
    if (
      !$(this).find(".playerName").hasClass("killedNameColor") &&
      ableToVote
    ) {
      $(this).find(".VoteButtons").removeClass("hide");
    }
  });

  $("#playersContainer").on("click", "button", function () {
    let playerId = $(this).parent().parent().parent().parent().attr("id");
    if ($(this).hasClass("cancelVoteButton")) {
      return;
    }
    ableToVote = false;
    socket.emit("voteForImposter", playerId);
  });

  $("#skipButton").click(() => {
    socket.emit("voteForImposter", 0);
    ableToVote = false;
  });
});

socket.on("startEmergencyMeeting", (players) => {
  $(".votingEnds").show();
  $(".emergencyContainer").show();
  $(".emergencyContainer").removeClass("hide");
  $("#voteForSkip").empty();
  $("#playersContainer").empty();
  $("#skipButton").prop("disabled", false);
  players.forEach((p) => {
    let playerID = p.id;
    let playerImage = sessionIdToSkin[p.id].src;
    let playerName = p.name;
    const playerElement = `<div class="player" id="${playerID}"><div class="playerContainer"><div class="hasVoted hide"><p>Voted</p></div><div class="killFade hide"></div><div class="playerContentContainer"><img class="initiatorSymbol hide" src="/img/megaphone.png"><div class="imgContainer"><span class="killedX hide">&#10007</span><img src="${playerImage}" alt="" id="playerImage"></div><p class="playerName">${playerName}</p><div class="votedFor"></div><div class="VoteButtons hide"><button class="confVoteButton">&#10003</button><button class="cancelVoteButton">&#10006</button></div></div></div></div>`;
    $("#playersContainer").append(playerElement);
    if (p.isInitator) {
      $("#" + playerID)
        .find(".initiatorSymbol")
        .removeClass("hide");
    } else if (p.killed) {
        if(p.id == localStorage.getItem("absID")){
            ableToVote = false;
        }
      $("#" + playerID)
        .find(".killFade")
        .removeClass("hide");
      $("#" + playerID)
        .find(".killedX")
        .removeClass("hide");
      $("#" + playerID)
        .find("#playerImage")
        .addClass("killedImage");
      $("#" + playerID)
        .find(".playerName")
        .addClass("killedNameColor");
    }
  });
});

socket.on("voteUpdate", (votes) => {
  let sessionId = localStorage.getItem("absID");
  voteEnds = new Date(votes.voteEnds);
  if (!votingEndsTick) {
    votingEndsTick = setInterval(() => {
      let now = new Date();
      let secondsTillEnd = Math.floor((voteEnds.getTime() - now.getTime()) / 1000);
       if(secondsTillEnd <= 0){
           socket.emit("votingTimeUp");
       }
    $("#votingSecondLeft").html(Math.max(0, secondsTillEnd));
    }, 1000);
  }
  if (votes) {
    Object.keys(votes).forEach((susPlayer) => {
      if (
        susPlayer != "skip" &&
        susPlayer != "totalVotes" &&
        susPlayer != "voteEnds" &&
        susPlayer != "initiator"
      ) {
        votes[susPlayer].forEach((votedPlayer) => {
          ableToVote = !(sessionId == votedPlayer);
          $("#" + votedPlayer)
            .find(".hasVoted")
            .removeClass("hide");
        });
      }
    });
    votes.skip.forEach((votedPlayer) => {
      ableToVote = !(sessionId == votedPlayer);
      $("#" + votedPlayer)
        .find(".hasVoted")
        .removeClass("hide");
    });
    if (!ableToVote) {
      $("#skipButton").prop("disabled", true);
    }
  }
});

socket.on("showVoteResults", (votes, ejected) => {
    ableToVote = false;
  Object.keys(votes).forEach((susPlayer) => {
    if (
      susPlayer != "skip" &&
      susPlayer != "totalVotes" &&
      susPlayer != "voteEnds" &&
      susPlayer != "initiator"
    ) {
        $("#" + susPlayer).find(".votedFor").empty();
      votes[susPlayer].forEach((votedPlayer) => {
        $("#" + susPlayer)
          .find(".votedFor")
          .append(`<img src="${sessionIdToSkin[votedPlayer].src}">`);
      });
    }
  });
  $("#voteForSkip").empty();
  votes.skip.forEach((votedPlayer) => {
    $("#voteForSkip").append(`<img src="${sessionIdToSkin[votedPlayer].src}">`);
  });
  $(".votingEnds").hide();
  setTimeout(() => {
    voteEnds = undefined;
    ableToVote = true;
    clearInterval(votingEndsTick);
    votingEndsTick = undefined;
    $(".emergencyContainer").addClass("hide");
    if(ejected != "tie"){
      ejectScreen(ejected);
    }else{
      socket.emit("continueGame");
    }
  }, 5000);
});

function ejectScreen(ejected){
    $(".emergencyContainer").addClass("hide");
    $(".ejectedDisplay").removeClass("hide");
    $("#ejectedName").html(ejected.name);
    if(ejected.role == "imposter"){
        $("#ejectedRoleMessage").html("Imposter");
    }else{
        $("#ejectedRoleMessage").html("not Imposter");
    }
    $(".ejectedDisplay").append(`<img src="${sessionIdToSkin[ejected.id].src}" alt="" id="ejectedImage">`);
    setTimeout(() => {
        $(".ejectedDisplay").addClass("hide");
        socket.emit("continueGame");
    }, 7000);
}