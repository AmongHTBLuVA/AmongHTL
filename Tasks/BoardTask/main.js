window.addEventListener('load', function () {
    var scContainer = document.getElementById('boardContainer');
    var sc = new ScratchCard('#boardContainer', {
        enabledPercentUpdate: true,
        scratchType: SCRATCH_TYPE.LINE,
        containerWidth: scContainer.offsetWidth,
        containerHeight: 200,
        imageForwardSrc: '/Tasks/BoardTask/images/bestLife.png',
        imageBackgroundSrc: '',
        htmlBackground: '',
        clearZoneRadius: 30,
        percentToFinish: 95, // When the percent exceeds 95 on touchend event the callback will be exec.
        nPoints: 30,
        pointSize: 4,
        callback: function () {
            window.parent.endTask(5);
        }
    })

    sc.init().then(() => {
        sc.canvas.addEventListener('scratch.move', () => {
        })
    }).catch((error) => {
        // image not loaded
        alert(error.message);
    });
});