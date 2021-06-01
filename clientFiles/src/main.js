import { getDeltaPos, requestMovement } from "/script/movement.js";
import {mapName} from "/script/socket.js"

var player = new Image();
const playerImageUrl = "/img/Wieser.png";

var background = new Image();
const backgroundImageUrl = "/img/"+mapName+".png";

var canvas;
var ctx;
var readingBorders = false;

var height;
var width;

const speed = 5;
const tickIntervall = 60;

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
    requestMovement(delta, speed);
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
