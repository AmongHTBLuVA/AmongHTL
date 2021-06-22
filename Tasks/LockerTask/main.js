var drag = false;
var angle = undefined;
var combination = [];
const center = { x: 600, y: 300 };

for(let i=0; i<3; i++){
  combination[i] = Math.floor(Math.random() * 100);
}

var startAngle = 0;
function getAngle(center, pos) {
  let dy = pos.y - center.y;
  let dx = pos.x - center.x;
  let theta = Math.atan2(dy, dx);
  theta *= 180 / Math.PI;
  theta -= 270;
  theta -= startAngle;
  if (theta <= 0) {
    theta += 360;
  }
  return theta;
}

function degToNum(deg) {
  if (deg <= 0) {
    deg = 270 + 90 + deg;
  }
  let num = Math.floor((deg / 360) * 100);
  return num;
}

var currComb = 0;

$(document).ready(function () {
  $("#combinationText").html(combination[0]+"-"+combination[1]+"-"+combination[2]);
  $("body").append('<img id="bread" src="/Tasks/LockerTask/images/bread.png" alt="" />');
  $("#bread").hide();
  $(".lockPick").hide();
  $(".lockPick").removeClass("hide");

  $("img").on("dragstart", function (event) {
    event.preventDefault();
  });

  $("#bread").click(function (e) { 
    e.preventDefault();
    this.style.display = "none";
    parent.focus();
    window.parent.endTask(1);
  });

  $("#zoomLock").click((e) =>{
    e.stopPropagation();
    $(".lockPick").show();
  });

  $("#container").click((e) => {
    if(drag){
      drag = false;
    }else{      
      $(".lockPick").hide();
    }
  })

  $(".lockPick").mousemove((e) => {
    if (drag) {
      e.stopPropagation();
      angle = getAngle(center, { x: e.clientX, y: e.clientY });
      $("#innerLock").css("transform", `rotate(${angle}deg)`);
    }
  });
  
  $(".lockPick").mouseup((event) => {
    event.stopPropagation();
    let num = degToNum(-angle);
    startAngle = getAngle(center, { x: event.clientX, y: event.clientY });
    if(num -1 <= combination[currComb] && num +1 >= combination[currComb]){
      currComb++;
      startAngle = 0;
      $("#innerLock").css("transform", `rotate(0deg)`);
      if(currComb == 3){
        $(".lockPick").hide();
        $("#zoomLock").hide();
        $("#postIt").hide();
        $("#bread").show();
        $("body").css("background-image", "url(/Tasks/LockerTask/images/locker.png)")
      }
    }
  });
  
  $("#lockdrag").mousedown((e) => {
    e.stopPropagation();
    startAngle = getAngle(center, { x: e.clientX, y: e.clientY });
    drag = true;
  });
});