import { socket, getId, setName } from "/script/socket.js";

function logOn(userName) {
  $(".userNamePopup").hide();
  $(".container").removeClass("popUpBackground");
  $("#username").html(userName);
  $("#userNameLabel").removeClass("hide");
  let path = window.location.pathname;
  setName(userName);
  socket.emit(
    "authenticated",
    userName,
    path.substr(1, path.length - 1) == ""
      ? false
      : path.substr(1, path.length - 1)
  );
}

function isLoggedOn() {
  let time = localStorage.getItem("time");
  if (time) {
    console.log(time);
    console.log("Time: " + (Date.now() - time));
    if (Date.now - time < 1500) {
      console.log(localStorage.getItem("name"));
    }
  }
}

$(document).on("ready", () => {
  setTimeout(() => {
    $(".loading").addClass("hide");
    $(".content-wrapper").removeClass("hide");
  }, 500);

  if (isLoggedOn()) {
    logOn(localStorage.getItem("name"));
  }

  $("#confUserNameBtn").click(() => {
    let userName = $(".form__field").val();
    console.log(userName);
    if (userName != "") {
      logOn(userName);
    }
  });
});

socket.on("checkLogOn", (oldName, absID) => {
  console.log("name: " + oldName);
  if(oldName){
    logOn(oldName);
  }else{
    localStorage.setItem("absID", absID);
  }
});

socket.on("assignRoomKey", (roomKey) => {
  $("#roomKey").html(roomKey);
});

socket.on("lobbyMembers", (roomMembers) => {
  console.log("test + " + roomMembers);
  if (roomMembers.length > 1) {
    $(".playerJoined").empty();
    roomMembers.forEach((element, i) => {
      console.log("element: " + element.id);
      if (element.id != getId()) {
        if(i == 0){
          $(".playerJoined").append("<p style='color: red;'>" + element.name + "</p>");
        }else{
        $(".playerJoined").append("<p>" + element.name + "</p>");
        }
      } else if (i != 0) {
        $(".btnContainer").hide();
      }
    });
  }
});
