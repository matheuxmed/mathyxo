// ===== Mobile Menu Toggle =====
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Fermer le menu quand un lien est cliqué
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                // Marquer le lien comme actif
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
});

// ===== Active Link Detection =====
function setActiveLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentLocation = location.pathname.split('/')[1] || '';

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href').split('/')[1] || '';
        if (href === currentLocation || (currentLocation === '' && link.getAttribute('href') === '/')) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('load', setActiveLink);

// ===== Smooth Scroll pour les ancres =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ===== Animation au scroll =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.level-card, .feature, .lesson-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===== Afficher l'année courante dans le footer =====
document.addEventListener('DOMContentLoaded', function() {
    const yearElement = document.querySelector('footer p:first-child');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = `© ${currentYear} MatheuxMed. Plateforme gratuite pour l'enseignement des mathématiques.`;
    }
});