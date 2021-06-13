import {mapName} from "/script/socket.js"

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
  background.src = backgroundImageUrl;
  backgroundTopLayer.src = backgroundTopLayerUrl;
  height = window.innerHeight;
  width = window.innerWidth;
  canvas.width = width;
  canvas.height = height;
});

export {
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
