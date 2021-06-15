import {socket} from "/script/socket.js"

let hourAngle = Math.floor(Math.random() * 360);
let minuteAngle = Math.floor(Math.random() * 360);
let dragHour = false;
let dragMinute = false;
const center = { x: 600, y: 300 };

function getAngle(center, pos) {
  let dy = pos.y - center.y;
  let dx = pos.x - center.x;
  let theta = Math.atan2(dy, dx);
  theta *= 180 / Math.PI;
  theta -= 270;
  if(theta <= 0){
      theta += 360;
  }
  return theta;
}

function degToMin (deg) {
    if(deg <= 0){
        deg = 270 + 90 + deg;
    }
    let min = Math.floor((deg / 360) * 60);
    return min++;
 }

function degToHour(deg){
    if(deg <= 0){
        deg = 270 + 90 + deg;
    }
    let hour = Math.floor((deg / 360) * 12);
    return hour++;
}

$('img').on('dragstart', function(event) { event.preventDefault(); });

$(".container").mousemove((e) => {
  if (dragMinute || dragHour) {
    let angle = getAngle(center, { x: e.clientX, y: e.clientY });
    if (dragMinute) {
      minuteAngle = angle;
      $("#minute").css("transform", `rotate(${angle}deg)`);
    } else {
      hourAngle = angle;
      $("#hour").css("transform", `rotate(${angle}deg)`);
    }
  }
});

$(".container").mouseup((e) => {
  dragHour = false;
  dragMinute = false;
  let hour = degToHour(hourAngle) > 12 ? degToHour(hourAngle) - 1 : degToHour(hourAngle);
  hour = hour == 0 ? 12 : hour;
  let min = degToMin(minuteAngle);
  let now = new Date();
  if(hour == now.getHours() && (min >= now.getMinutes()-1 && min <= now.getMinutes()+1)){
      setTimeout(() => {
          socket.emit("taskFinished", 0);
      })
  }
});

$("#hour").mousedown((e) => {
  dragHour = true;
});

$("#minute").mousedown((e) => {
  dragMinute = true;
});

$("#hour").css("transform", `rotate(${hourAngle}deg)`);
$("#minute").css("transform", `rotate(${minuteAngle}deg)`);
