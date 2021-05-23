import { logOn } from "/script/Events.js";
import { socket, getId } from "/script/socket.js";

var members = 1;
var currLobby = undefined;

$(document).on("ready", () => {
  setTimeout(() => {
    $(".loading").addClass("hide");
    $(".content-wrapper").removeClass("hide");
  }, 500);

  $("#confUserNameBtn").click(() => {
    let userName = $(".form__field").val();
    console.log(userName);
    if (userName != "") {
      logOn(userName);
    }
  });

  $(".startBtn ").click(function(event) {
      if(members > 4 || true){ //!!!!!!!!!!!!CHANGE!!!!!!!!!!!!!!!!!
        console.log("TEST");
        socket.emit("lobbyStartRequest", currLobby);
      }
      event.preventDefault();
  });
});

socket.on("assignRoomKey", (roomKey) => {
  currLobby = roomKey;
  $("#roomKey").html(roomKey);
});

socket.on("startLobby", () => {
  window.location.href = "/game/" + currLobby;
});

socket.on("lobbyMembers", (roomMembers) => {
  members = roomMembers.length;
  if (roomMembers.length > 1) {
    $(".playerJoined").empty();
    roomMembers.forEach((element, i) => {
      console.log("element: " + element.id);
      if (element.id != getId()) {
        if(i == 0){
          $(".playerJoined").append("<p style='font-weight: 600;'>" + element.name + "</p>");
        }else{
          $(".playerJoined").append("<p>" + element.name + "</p>");
        }
      } else if (i != 0) {
        $(".btnContainer").hide();
      }
    });
  }
});
