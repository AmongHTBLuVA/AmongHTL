
$(document).ready(function () {
  $("body").append('<img id="bread" src="/Tasks/LockerTask/images/bread.png" alt="" />');
  $("#bread").hide();

  $("#bread").click(function (e) { 
    e.preventDefault();
    this.style.display = "none";
    window.parent.endTask(1);
  });
});