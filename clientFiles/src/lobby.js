import { socket, getId } from "/script/socket.js";

$(document).on("ready", () => {
    $("#confUserNameBtn").click(()=>{
        let userName = $(".userNameInput").val();
        console.log(userName);
        if(userName != ""){
            $(".userNamePopup").hide();
            $(".container").removeClass("popUpBackground");
            let path = window.location.pathname;
            socket.emit("authenticated", userName, path.substr(1, path.length-1) == "" ? false : path.substr(1, path.length-1));
        }
    });
});

socket.on("assignRoomKey", (roomKey) => {
  $("#roomKey").html(roomKey);
});

socket.on("lobbyMembers", (roomMembers) => {
  console.log("test");
  if (roomMembers.length > 1) {
    $(".playerJoined").empty();
    roomMembers.forEach((element, i) => {
      if (element != getId()) {
        console.log("element: " + element);
        $(".playerJoined").append("<p>" + element + "</p>");
      }else if(i != 0){
          $(".btnContainer").hide();
      }
    });
  }
});
