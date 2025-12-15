const menuBtn = document.getElementById('menuToggle');
const drawer = document.getElementById('drawer');

menuBtn?.addEventListener('click', () => {
  drawer.style.display =
    drawer.style.display === 'block' ? 'none' : 'block';
});
