var canvas;
var ctx;
var fish = new Image();

var drag = false;

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
canvas.width = 1200;
canvas.height = 600;
fish.src = "/img/fish/fish.png";
fish.width = 400;
fish.height = 180;

ctx.drawImage(fish, 200, 420, 150, 50);

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

var prev = { x: 0, y: 0 };
var time = new Date();
$("#canvas").mousemove((e) => {
  if (drag) {
    let pos = getMousePos(canvas, e);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(fish, pos.x, pos.y, 150, 50);
    let xSpeed = prev.x - pos.x;
    let ySpeed = prev.y - pos.y;
    let now = new Date();
    let diff = now.getTime() - time.getTime();
    if (Math.abs(xSpeed) > 3 || Math.abs(ySpeed) > 3) {
      drag = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(fish, 200, 420, 150, 50);
    }
    prev = pos;
    time = new Date();
  }
});

$("#canvas").mouseup((e) => {
  let poss = [{ x: 1046, y: 425 }];
  let element = getMousePos(canvas, e);
  let inside = false;
  let hitbox = 50;
  poss.forEach((pos) => {
    if (!inside) {
      let right = Math.floor(element.x - (pos.x - hitbox));
      let left = Math.floor(element.x - hitbox - pos.x);
      let bottom = Math.floor(element.y + hitbox - pos.y);
      let top = Math.floor(element.y - (pos.y + hitbox));
      inside =
        ((right >= 0 && right <= hitbox) || (left <= 0 && left >= -hitbox)) &&
        ((bottom >= 0 && bottom <= hitbox) || (top <= 0 && top >= -hitbox));
    }
  });
  drag = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!inside) {
    ctx.drawImage(fish, 200, 420, 150, 50);
  } else {
    ctx.drawImage(fish, 1000, 430, 150, 50);
    window.parent.endTask(3);
  }
});

$("#canvas").mousedown((e) => {
  let poss = [
    { x: 280, y: 444 },
    { x: 240, y: 444 },
    { x: 320, y: 444 },
  ];
  let hitbox = 20;
  let element = getMousePos(canvas, e);
  let inside = false;
  poss.forEach((pos) => {
    if (!inside) {
      let right = Math.floor(element.x - (pos.x - hitbox));
      let left = Math.floor(element.x - hitbox - pos.x);
      let bottom = Math.floor(element.y + hitbox - pos.y);
      let top = Math.floor(element.y - (pos.y + hitbox));
      inside =
        ((right >= 0 && right <= hitbox) || (left <= 0 && left >= -hitbox)) &&
        ((bottom >= 0 && bottom <= hitbox) || (top <= 0 && top >= -hitbox));
    }
  });
  drag = inside;
  prev = element;
  time = new Date();
});
