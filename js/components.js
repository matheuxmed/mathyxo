// ===== MatheuxMed Components System =====
// Reusable components for all pages with Gamification

// ===== Gamification System =====
const GAMIFICATION = {
    // localStorage keys
    userKey: 'mathyxo_user',
    
    // Initialize or get user profile
    getOrCreateUser: function() {
        const stored = localStorage.getItem(this.userKey);
        if (stored) return JSON.parse(stored);
        
        const newUser = {
            username: 'Apprenant',
            avatar: '👤',
            xp: 0,
            level: 0,
            currentLevelId: 'secondaire-1',
            badges: [],
            lessonsCompleted: 0,
            streakDays: 0,
            joinDate: new Date().toISOString()
        };
        localStorage.setItem(this.userKey, JSON.stringify(newUser));
        return newUser;
    },
    
    // Add XP points
    addXP: function(points) {
        const user = this.getOrCreateUser();
        user.xp += points;
        // Level up every 100 XP
        const newLevel = Math.floor(user.xp / 100);
        if (newLevel > user.level) {
            user.level = newLevel;
            user.badges.push({ name: 'Level ' + newLevel, icon: '⭐', date: new Date() });
        }
        localStorage.setItem(this.userKey, JSON.stringify(user));
        return user;
    },
    
    // Update current level/section
    setCurrentLevel: function(levelId) {
        const user = this.getOrCreateUser();
        user.currentLevelId = levelId;
        localStorage.setItem(this.userKey, JSON.stringify(user));
    },
    
    // Get user
    getUser: function() {
        return this.getOrCreateUser();
    }
};

const SITE_CONFIG = {
    baseUrl: '/mathyxo',
    siteName: 'MatheuxMed',
    year: new Date().getFullYear(),
    navItems: [
        { name: '🏠 Accueil', href: '/mathyxo/' },
        { name: '📚 Primaire', href: '/mathyxo/primaire/' },
        { name: '📖 Collège', href: '/mathyxo/college/' },
        { name: '📊 Tronc Commun', href: '/mathyxo/tronc-commun/' },
        { name: '🎓 Bac 1ère', href: '/mathyxo/bac1/' },
        { name: '🏆 Bac 2ème', href: '/mathyxo/bac2/' },
        { name: '📧 Contact', href: '/mathyxo/contact.html' }
    ],
    educationLevels: [
        {
            id: 'primaire-1',
            name: '1ère Primaire',
            icon: '📗',
            description: 'Bases des mathématiques : compter, formes et patterns',
            xpReward: 10,
            category: 'Primaire'
        },
        {
            id: 'primaire-2',
            name: '2ème Primaire',
            icon: '📘',
            description: 'Addition, soustraction et premières opérations',
            xpReward: 15,
            category: 'Primaire'
        },
        {
            id: 'primaire-3',
            name: '3ème Primaire',
            icon: '📕',
            description: 'Multiplication, division et fractions simples',
            xpReward: 20,
            category: 'Primaire'
        },
        {
            id: 'primaire-4',
            name: '4ème Primaire',
            icon: '📗',
            description: 'Fractions décimales et géométrie de base',
            xpReward: 25,
            category: 'Primaire'
        },
        {
            id: 'primaire-5',
            name: '5ème Primaire',
            icon: '📘',
            description: 'Nombres décimaux et géométrie plane',
            xpReward: 30,
            category: 'Primaire'
        },
        {
            id: 'primaire-6',
            name: '6ème Primaire',
            icon: '📕',
            description: 'Préparation au collège : statistiques simples',
            xpReward: 35,
            category: 'Primaire'
        },
        {
            id: 'college-1',
            name: '1ère Année Collège',
            icon: '📙',
            description: 'Nombres entiers, fractions et opérations',
            xpReward: 40,
            category: 'Collège'
        },
        {
            id: 'college-2',
            name: '2ème Année Collège',
            icon: '📗',
            description: 'Equations, proportions et géométrie',
            xpReward: 50,
            category: 'Collège'
        },
        {
            id: 'college-3',
            name: '3ème Année Collège',
            icon: '📘',
            description: 'Théorème de Pythagore, trigonométrie basique',
            xpReward: 60,
            category: 'Collège'
        },
        {
            id: 'tronc-commun',
            name: 'Tronc Commun',
            icon: '📊',
            description: 'Fondamentaux pour tous : équations, fonctions et géométrie',
            xpReward: 75,
            category: 'Secondaire'
        },
        {
            id: 'bac1-se',
            name: '1ère Bac SE/SM',
            icon: '🔬',
            description: 'Limite, continuité, dérivée et fonctions exponentielles',
            xpReward: 100,
            category: 'Baccalauréat'
        },
        {
            id: 'bac1-sh',
            name: '1ère Bac SH',
            icon: '📈',
            description: 'Statistiques, probabilités et algèbre linéaire',
            xpReward: 85,
            category: 'Baccalauréat'
        },
        {
            id: 'bac2-pc',
            name: '2ème Bac PC',
            icon: '⚗️',
            description: 'Intégrales, équations différentielles et géométrie 3D',
            xpReward: 120,
            category: 'Baccalauréat'
        },
        {
            id: 'bac2-svt',
            name: '2ème Bac SVT',
            icon: '🌿',
            description: 'Calcul intégral, statistiques avancées',
            xpReward: 110,
            category: 'Baccalauréat'
        },
        {
            id: 'bac2-sm',
            name: '2ème Bac SM',
            icon: '🧮',
            description: 'Algèbre avancée, géométrie et séries',
            xpReward: 125,
            category: 'Baccalauréat'
        }
    ],
    socialLinks: [
        { 
            name: 'GitHub', 
            url: 'https://github.com/matheuxmed',
            icon: '🐙',
            color: '#333'
        },
        { 
            name: 'Email', 
            url: 'mailto:contact@matheuxmed.com',
            icon: '📧',
            color: '#D44638'
        },
        { 
            name: 'LinkedIn', 
            url: 'https://linkedin.com/in/matheuxmed',
            icon: '💼',
            color: '#0077B5'
        },
        { 
            name: 'Twitter', 
            url: 'https://twitter.com/matheuxmed',
            icon: '𝕏',
            color: '#000000'
        },
        { 
            name: 'Instagram', 
            url: 'https://instagram.com/matheuxmed',
            icon: '📸',
            color: '#E4405F'
        }
    ]
};

// ===== Header Component =====
function renderHeader() {
    return `
        <header>
            <div class="header-content">
                <h1>📐 ${SITE_CONFIG.siteName}</h1>
            </div>
        </header>
    `;
}

// ===== Navbar Component =====
function renderNavbar(activePath = '') {
    const user = GAMIFICATION.getUser();
    const currentLevel = SITE_CONFIG.educationLevels.find(l => l.id === user.currentLevelId);
    
    let navHTML = `<nav class="navbar">
        <div class="nav-left">
            <div class="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <ul class="nav-menu">
    `;
    
    SITE_CONFIG.navItems.forEach(item => {
        const isActive = activePath === item.href || activePath.includes(item.href.split('/')[item.href.split('/').length - 2]) ? 'active' : '';
        navHTML += `<li><a href="${item.href}" class="nav-link ${isActive}">${item.name}</a></li>`;
    });
    
    navHTML += `</ul>
        </div>
        <div class="nav-right">
            <div class="current-level">
                <span>${currentLevel ? currentLevel.icon : '📚'}</span>
                <span>${currentLevel ? currentLevel.name : 'Select Level'}</span>
            </div>
            <div class="profile-section" onclick="alert('Profil: ${user.username}\\nNiveau: ${user.level}\\nXP: ${user.xp}')">
                <div class="profile-avatar">${user.avatar}</div>
                <div class="xp-badge">
                    <span>⭐</span>
                    <span>${user.xp} XP</span>
                </div>
            </div>
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
    const user = GAMIFICATION.getUser();
    return `
        <section class="hero">
            <h2>Bienvenue, ${user.username}! 👋</h2>
            <p>Vous avez ${user.xp} XP • Niveau ${user.level} • ${user.lessonsCompleted} leçons complétées</p>
            <p><strong>100% Gratuit • Interactif • En Français</strong></p>
        </section>
    `;
}

// ===== Level Cards Component =====
function renderLevelCards() {
    let cardsHTML = '<section class="levels">';
    
    SITE_CONFIG.educationLevels.forEach(level => {
        const progressPercent = (Math.random() * 100).toFixed(0);
        cardsHTML += `
            <div class="level-card" onclick="selectLevel('${level.id}')">
                <div class="level-icon">${level.icon}</div>
                <h3>${level.name}</h3>
                <p>${level.description}</p>
                <div class="level-meta">
                    <span>📊 ${level.category}</span>
                    <span><strong>+${level.xpReward} XP</strong></span>
                </div>
                <div class="level-progress">
                    <div class="level-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <a href="#" class="btn">Commencer →</a>
            </div>
        `;
    });
    
    cardsHTML += '</section>';
    return cardsHTML;
}

// Select level function
function selectLevel(levelId) {
    GAMIFICATION.setCurrentLevel(levelId);
    GAMIFICATION.addXP(5);
    alert('Niveau sélectionné! +5 XP');
    location.reload();
}

// ===== Features Component =====
function renderFeatures() {
    const features = [
        { icon: '🎯', title: 'Interactif', desc: 'Graphiques Desmos, géométrie GeoGebra, simulations PhET' },
        { icon: '🎓', title: 'Pédagogique', desc: 'Explications claires, exercices progressifs, quizzes intégrés' },
        { icon: '💰', title: 'Gratuit', desc: '100% gratuit, 0 publicité, accessible de partout' },
        { icon: '📱', title: 'Responsive', desc: 'Fonctionne sur desktop, tablette et téléphone' },
        { icon: '🎮', title: 'Gamifié', desc: 'Gagnez des XP, débloquez des badges et progressez' },
        { icon: '🌍', title: 'Marocain', desc: 'Aligné avec le curriculum marocain officiel' }
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
            <h2>Prêt à apprendre?</h2>
            <p>Choisissez votre niveau et commencez votre voyage éducatif</p>
            <div class="cta-buttons">
                <a href="#levels" class="btn btn-primary">Découvrir les Niveaux</a>
                <a href="/mathyxo/contact.html" class="btn btn-primary">Nous Contacter</a>
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

// ===== Contact Page Component =====
function renderContact() {
    let contactHTML = `
        <div class="page-header">
            <h1>📧 Contactez-moi</h1>
            <p>Connectez-vous avec moi sur les réseaux sociaux</p>
        </div>
        <section class="contact-section">
            <div class="social-links-grid">
    `;
    
    SITE_CONFIG.socialLinks.forEach(link => {
        contactHTML += `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-card" style="border-top-color: ${link.color};">
                <div class="social-icon">${link.icon}</div>
                <h3>${link.name}</h3>
                <span class="arrow">→</span>
            </a>
        `;
    });
    
    contactHTML += `
            </div>
        </section>
        <div style="text-align: center; margin-top: 60px;">
            <a href="/mathyxo/" class="btn">← Retour à l'accueil</a>
        </div>
    `;
    
    return contactHTML;
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
            (currentPath.startsWith(href) && href !== '/mathyxo/') ||
            (currentPath.includes('contact') && href.includes('contact.html'))) {
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

    document.querySelectorAll('.level-card, .feature, .lesson-card, .social-card').forEach(el => {
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
