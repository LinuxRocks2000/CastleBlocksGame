const og = document.getElementById('og');

og.addEventListener('click', () => {
    og.style.display = 'none';
    
    const box = document.getElementById('loginscreen');
    box.style.display = 'none';
});