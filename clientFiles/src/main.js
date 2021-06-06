import {mapName} from "/script/socket.js"

var player = new Image();
const playerImageUrl = "/img/Wieser.png";

var background = new Image();
var backgroundTopLayer = new Image();
const backgroundTopLayerUrl = "/img/"+mapName+"Top.png";
const backgroundImageUrl = "/img/"+mapName+".png";

var canvas;
var ctx;
var readingBorders = false;

var height;
var width;

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
  backgroundTopLayer.src = backgroundTopLayerUrl;
  height = window.innerHeight;
  width = window.innerWidth;
  canvas.width = width;
  canvas.height = height;
});

export {
  player,
  background,
  backgroundTopLayer,
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
