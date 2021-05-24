import { socket, getId } from "/script/socket.js";

var members = 1;
var currLobby = undefined;

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
                if (i == 0) {
                    $(".playerJoined").append("<p style='font-weight: 600;'>" + element.name + "</p>");
                } else {
                    $(".playerJoined").append("<p>" + element.name + "</p>");
                }
            } else if (i != 0) {
                $(".btnContainer").hide();
            }
        });
    }
});

export {members, currLobby};