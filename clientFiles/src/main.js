import { getDeltaPos, requestMovement } from "/script/movement.js";
import { socket } from "/script/socket.js";

var player = new Image();
const playerImageUrl = "/img/Wieser.png";

var background = new Image();
const backgroundImageUrl = "/img/testmapKlein.png";

var canvas;
var ctx;
var readingBorders = false;

var height;
var width;

const speed = 4;
const tickIntervall = 50;

console.log("WINDOW: " + window.innerWidth);

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

function setWidth(a) {
  width = a;
}

function getWidth() {
  return width;
}

function setHeight(a) {
  height = a;
}

function getHeight() {
  return height;
}

function setReadingBorders(reading) {
  readingBorders = reading;
}

function getReadingBorders() {
  return readingBorders;
}

$(document).on("ready", () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  player.width = 70;
  player.height = 70;
  player.src = playerImageUrl;
  background.src = backgroundImageUrl;
  height = window.innerHeight;
  width = window.innerWidth;
  canvas.width = width;
  canvas.height = height;
  setInterval(tick, tickIntervall);
});

function tick() {
  let delta = getDeltaPos();
  if (delta.x != 0 || delta.y != 0) {
    for (let i = 0; i < speed; i++) {
      requestMovement(delta);
    }
  }
}

export {
  player,
  background,
  ctx,
  canvas,
  setReadingBorders,
  getReadingBorders,
  copy,
  setWidth,
  getWidth,
  getHeight,
  setHeight,
};
