
$(document).ready(function () {
    $("#true").click(function (e) { 
        e.preventDefault();
        parent.focus();
        window.parent.endTask(2);
    });
    $("#false").click(function (e) { 
        e.preventDefault();
        alert("Your answer was incorrect! Try again.");
    });
});