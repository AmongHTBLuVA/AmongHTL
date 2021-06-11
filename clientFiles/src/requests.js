import { socket, getId, getplayerRole } from "/script/socket.js";

$(document).ready(function () {
    $("#buttonContainer").hide();
    $("#taskFrame").hide();

    $("#killButton").click(function (e) { 
        e.preventDefault();
        if(getplayerRole() == "imposter"){
            let id = getId()
            console.log(`sending kill request`);
            socket.emit("killRequest", id);
        }
    });

    $("#taskButton").click(function(e) {
        e.preventDefault();
        $("#taskFrame").toggle();
    });
});