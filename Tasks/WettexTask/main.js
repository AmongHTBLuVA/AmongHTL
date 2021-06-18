import { socket } from "/script/socket.js";

window.addEventListener("load", function () {
  var scContainer = document.getElementById("wallContainer");
  var sc = new ScratchCard("#wallContainer", {
    enabledPercentUpdate: true,
    scratchType: SCRATCH_TYPE.LINE,
    containerWidth: scContainer.offsetWidth,
    containerHeight: 200,
    imageForwardSrc: "/Tasks/WettexTask/images/htl4life.png",
    imageBackgroundSrc: "",
    htmlBackground: "",
    clearZoneRadius: 30,
    percentToFinish: 95, // When the percent exceeds 95 on touchend event the callback will be exec.
    nPoints: 30,
    pointSize: 6,
    callback: function () {
      parent.focus();
      window.parent.endTask(4);
    },
  });

  sc.init()
    .then(() => {
      sc.canvas.addEventListener("scratch.move", () => {});
    })
    .catch((error) => {
      // image not loaded
      alert(error.message);
    });
});
