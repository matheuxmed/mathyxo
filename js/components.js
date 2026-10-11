// ===== Set Active Navigation Link =====
function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    const normalize = (value) => value.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        const targetPath = normalize(new URL(href, window.location.href).pathname);
        const currentNormalized = normalize(currentPath);

        if (currentNormalized === targetPath ||
            (currentNormalized === '/' && targetPath === '/')) {
            link.classList.add('active');
        }
    });
}
