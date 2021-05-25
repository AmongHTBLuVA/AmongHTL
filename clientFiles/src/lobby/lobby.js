import { logOn } from "/script/Events.js";
import { socket } from "/script/socket.js";
import { members, currLobby} from"/script/lobbyEvents.js";

$(document).on("ready", () => {
  setTimeout(() => {
    $(".loading").addClass("hide");
    $(".content-wrapper").removeClass("hide");
  }, 500);

  $("#confUserNameBtn").click(() => {
    let userName = $(".form__field").val();
    if (userName != "") {
      logOn(userName);
    }
  });

  $(".startBtn ").click(function(event) {
      if(members > 4 || true){ //!!!!!!!!!!!!CHANGE!!!!!!!!!!!!!!!!!
        socket.emit("lobbyStartRequest", currLobby);
      }
      event.preventDefault();
  });
});