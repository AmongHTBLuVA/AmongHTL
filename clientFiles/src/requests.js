import { socket, getId, getplayerRole } from "/script/socket.js";

$(document).ready(function () {
    $("#buttonContainer").hide();
    $("#taskFrame").hide();

    $("#killButton").click(function (e) { 
        e.preventDefault();
        if(getplayerRole() == "imposter"){
            let id = getId()
            socket.emit("killRequest", id);
        }
    });

    $("#taskButton").click(function(e) {
        e.preventDefault();
        socket.emit("actionRequest");
        // $("#tmpUse").prop("disabled", true);
        // setTimeout(() => {
        //     $("#tmpUse").prop("disabled", false);
        // },500);
    });
});
