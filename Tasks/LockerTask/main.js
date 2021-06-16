
$(document).ready(function () {
  $("#bread").click(function (e) { 
    e.preventDefault();
    this.style.display = "none";
    window.parent.endTask(1);
  });
});