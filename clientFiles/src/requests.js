import { socket, getId, getplayerRole } from "/script/socket.js";

$(document).ready(function () {
    $("#killButton").hide();

    $("#killButton").click(function (e) { 
        e.preventDefault();
        if(getplayerRole() == "imposter"){
            let id = getId()
            console.log(`sending kill request`);
            socket.emit("killRequest", id);
        }
    });

    $("#tmpUse").click(function (e) {
        socket.emit("actionRequest");
        $("#tmpUse").prop("disabled", true);
        setTimeout(() => {
            $("#tmpUse").prop("disabled", false);
        },500);
    });
});
