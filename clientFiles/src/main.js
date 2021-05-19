var player = new Image();
const playerImageUrl = "Wieser.png";

var background = new Image();
const backgroundImageUrl = "testmapKlein.png";

var canvas;
var ctx;
var readingBorders = false;
var keyPressed = { w: false, s: false, d: false, a: false };

var Clientid;
const speed = 4;
const tickIntervall = 50;

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

function tick() {
  let delta = getDeltaPos();
  if (delta.x != 0 || delta.y != 0) {
    for (let i = 0; i < speed; i++) {
      requestMovement(delta);
    }
  }
}
