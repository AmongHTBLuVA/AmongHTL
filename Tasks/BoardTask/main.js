document.addEventListener('mousemove', function(e){
    const scratch = document.createElement('span');
    const body = document.querySelector('body');
    

    scratch.style.top = -50 + e.offsetY + 'px';
    scratch.style.left = -50 + e.offsetX + 'px';

    body.appendChild(scratch);

    
});