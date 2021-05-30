import { socket, getId } from "/script/socket.js";

$(document).ready(function () {
    $("#killButton").click(function (e) { 
        e.preventDefault();

        let id = getId()
        console.log(`sending kill request`);
        socket.emit("killRequest", id);
    });
});