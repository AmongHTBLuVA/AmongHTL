import { socket } from "/script/socket.js";

socket.on("task", (type) => {
    //type => ID
    /* ID | Name
    *  0  | ClockTask
    *  1  | LockerTask
    *  2  | CodeTask
    *  3  | FishTask
    *  4  | WettexTask
    *  5  | BoardTask
    */

    var url = ""

    console.log("task type: " + type);
    switch(type){
        case 0:
            url = "/Tasks/ClockTask";
            break;
        case 1:
            url = "/Tasks/LockerTask";
            break;
        case 2:
            url = "/Tasks/CodeTask";
            break;
        case 3:
            url = "/Tasks/FishTask";
            break;
        case 4:
            url = "/Tasks/WettexTask";
            break;
        case 5:
            url = "/Tasks/BoardTask";
            break;
    }

    console.log(url);
    $("#taskFrame").attr('src', url);
    $("#taskFrame").show();
});