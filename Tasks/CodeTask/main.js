import { socket } from "/script/socket.js";


function game(isCorrect) {
    if (isCorrect)
        socket.emit("taskFinished", 2);
}

export { game };