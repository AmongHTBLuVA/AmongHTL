import { socket } from "/script/socket.js";


$(document).ready(function () {
    $("#true").click(function (e) { 
        e.preventDefault();
        socket.emit("taskFinished", 2);
        alert("Your answer was correct!");
    });
    $("#false").click(function (e) { 
        e.preventDefault();
        alert("Your answer was incorrect! Try again.");
    });
});