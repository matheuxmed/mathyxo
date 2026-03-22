// ===== MatheuxMed Components System =====
// Reusable components for all pages

const SITE_CONFIG = {
    baseUrl: '/mathyxo',
    siteName: 'MatheuxMed',
    year: new Date().getFullYear(),
    navItems: [
        { name: '🏠 Accueil', href: '/mathyxo/' },
        { name: '📚 Seconde', href: '/mathyxo/seconde/' },
        { name: '📊 Première', href: '/mathyxo/premiere/' },
        { name: '🎓 Terminale', href: '/mathyxo/terminale/' },
        { name: '📧 Contact', href: '#contact' }
    ]
};

// ===== Header Component =====
function renderHeader() {
    return `
        <header>
            <div class="header-content">
                <h1>📐 ${SITE_CONFIG.siteName}</h1>
                <p>Mathématiques pour le Lycée Marocain</p>
            </div>
        </header>
    `;
}

// ===== Navbar Component =====
function renderNavbar(activePath = '') {
    let navHTML = '<nav class="navbar"><ul class="nav-menu">';
    
    SITE_CONFIG.navItems.forEach(item => {
        const isActive = activePath === item.href ? 'active' : '';
        navHTML += `<li><a href="${item.href}" class="nav-link ${isActive}">${item.name}</a></li>`;
    });
    
    navHTML += `</ul>
        <div class="hamburger">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </nav>`;
    
    return navHTML;
}

// ===== Footer Component =====
function renderFooter() {
    return `
        <footer>
            <p>&copy; ${SITE_CONFIG.year} ${SITE_CONFIG.siteName}. Plateforme gratuite pour l'enseignement des mathématiques.</p>
            <p>Créée avec ❤️ pour les lycéens marocains</p>
        </footer>
    `;
}

// ===== Hero Section Component =====
function renderHero() {
    return `
        <section class="hero">
            <h2>Bienvenue sur ${SITE_CONFIG.siteName}</h2>
            <p>Une plateforme interactive et engageante pour apprendre les mathématiques du lycée marocain.</p>
            <p><strong>100% Gratuit • Interactif • En Français</strong></p>
        </section>
    `;
}

// ===== Level Cards Component =====
function renderLevelCards() {
    const levels = [
        {
            icon: '📘',
            title: 'Seconde',
            description: 'Découvrez les fondamentaux : équations, fonctions, géométrie plane et statistiques.',
            link: '/mathyxo/seconde/'
        },
        {
            icon: '📗',
            title: 'Première',
            description: 'Approfondissez vos connaissances : polynômes, trigonométrie, suites et probabilités.',
            link: '/mathyxo/premiere/'
        },
        {
            icon: '📕',
            title: 'Terminale',
            description: 'Maîtrisez les concepts avancés : calcul, nombres complexes, matrices et statistiques.',
            link: '/mathyxo/terminale/'
        }
    ];

    let cardsHTML = '<section class="levels">';
    
    levels.forEach(level => {
        cardsHTML += `
            <div class="level-card">
                <div class="level-icon">${level.icon}</div>
                <h3>${level.title}</h3>
                <p>${level.description}</p>
                <a href="${level.link}" class="btn">Accéder →</a>
            </div>
        `;
    });
    
    cardsHTML += '</section>';
    return cardsHTML;
}

// ===== Features Component =====
function renderFeatures() {
    const features = [
        { icon: '🎯', title: 'Interactif', desc: 'Graphiques Desmos, géométrie GeoGebra, simulations PhET' },
        { icon: '🎓', title: 'Pédagogique', desc: 'Explications claires, exercices progressifs, quizzes intégrés' },
        { icon: '💰', title: 'Gratuit', desc: '100% gratuit, 0 publicité, accessible de partout' },
        { icon: '📱', title: 'Responsive', desc: 'Fonctionne sur desktop, tablette et téléphone' },
        { icon: '🔄', title: 'À jour', desc: 'Aligné avec le curriculum marocain officiel' },
        { icon: '🌍', title: 'Français', desc: 'Entièrement en français avec contexte marocain' }
    ];

    let featuresHTML = `
        <section class="features">
            <h2>Pourquoi ${SITE_CONFIG.siteName}?</h2>
            <div class="features-grid">
    `;
    
    features.forEach(feature => {
        featuresHTML += `
            <div class="feature">
                <h4>${feature.icon} ${feature.title}</h4>
                <p>${feature.desc}</p>
            </div>
        `;
    });
    
    featuresHTML += '</div></section>';
    return featuresHTML;
}

// ===== CTA Component =====
function renderCTA() {
    return `
        <section class="cta">
            <h2>Prêt à commencer?</h2>
            <p>Choisissez votre niveau et explorez les leçons interactives</p>
            <div class="cta-buttons">
                <a href="/mathyxo/seconde/" class="btn btn-primary">Seconde</a>
                <a href="/mathyxo/premiere/" class="btn btn-primary">Première</a>
                <a href="/mathyxo/terminale/" class="btn btn-primary">Terminale</a>
            </div>
        </section>
    `;
}

// ===== Page Header Component =====
function renderPageHeader(title, description) {
    return `
        <div class="page-header">
            <h1>${title}</h1>
            <p>${description}</p>
        </div>
    `;
}

// ===== Lesson Card Component =====
function renderLessonCard(number, title, description, link) {
    return `
        <div class="lesson-card">
            <h3>${number} ${title}</h3>
            <p>${description}</p>
            <a href="${link}" class="btn">Accéder à la leçon →</a>
        </div>
    `;
}

// ===== Back to Home Button =====
function renderBackButton() {
    return `
        <div style="text-align: center; margin-top: 40px;">
            <a href="/mathyxo/" class="btn">← Retour à l'accueil</a>
        </div>
    `;
}

// ===== Tips Section =====
function renderTipsSection(tips) {
    let tipsHTML = `
        <section style="text-align: center; padding: 40px 20px; background: #f0f0f0; border-radius: 10px;">
            <h2>🎯 Conseils pour Réussir</h2>
            <ul style="list-style: none; padding: 0; color: #666; text-align: left; max-width: 600px; margin: 20px auto;">
    `;
    
    tips.forEach(tip => {
        tipsHTML += `<li>✅ ${tip}</li>`;
    });
    
    tipsHTML += '</ul></section>';
    return tipsHTML;
}

// ===== Initialize Components on Page Load =====
document.addEventListener('DOMContentLoaded', function() {
    // Inject header
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = renderHeader();
    }

    // Inject navbar
    const navContainer = document.getElementById('nav-container');
    if (navContainer) {
        const currentPath = window.location.pathname;
        navContainer.innerHTML = renderNavbar(currentPath);
        initMobileMenu();
    }

    // Inject footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        footerContainer.innerHTML = renderFooter();
    }

    // Set active nav link
    setActiveNavLink();
});

// ===== Mobile Menu Toggle =====
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
}

// ===== Set Active Navigation Link =====
function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (currentPath === href || 
            (currentPath === '/mathyxo/' && href === '/mathyxo/') ||
            (currentPath.startsWith(href) && href !== '/mathyxo/')) {
            link.classList.add('active');
        }
    });
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ===== Scroll Animations =====
function initScrollAnimations() {
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
}

// Initialize all interactions
document.addEventListener('DOMContentLoaded', function() {
    initSmoothScroll();
    initScrollAnimations();
});
