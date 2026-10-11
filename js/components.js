// ===== MatheuxMed Components System (i18n + Gamification) =====
// Reusable components for all pages. All internal links are resolved from the
// script's own URL at runtime, so the site works on GitHub Pages (/mathyxo/)
// as well as on a custom domain or a local server.

// ===== Resolve the site base path from this script's URL =====
(function () {
    var base = '/';
    try {
        var script = document.currentScript;
        if (script && script.src) {
            var path = new URL(script.src, window.location.href).pathname;
            var resolved = path.replace(/\/js\/components\.js$/i, '/');
            if (resolved !== path) base = resolved;
        }
    } catch (e) {
        base = '/';
    }
    if (!/\/$/.test(base)) base += '/';
    window.MATHYXO_BASE = base;
})();

var MATHYXO_BASE = window.MATHYXO_BASE || '/';

// ===== Safe translation helper (works if i18n.js is missing) =====
function t(key, params) {
    if (typeof I18N !== 'undefined' && typeof I18N.t === 'function') {
        return I18N.t(key, params || {});
    }
    return key;
}

// ===== Gamification System =====
var GAMIFICATION = {
    userKey: 'mathyxo_user',

    getOrCreateUser: function () {
        const stored = localStorage.getItem(this.userKey);
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { /* fall through */ }
        }

        const newUser = {
            username: t('gamif.profile') || 'Apprenant',
            avatar: '👤',
            xp: 0,
            level: 0,
            currentLevelId: 'seconde',
            badges: [],
            lessonsCompleted: 0,
            streakDays: 0,
            joinDate: new Date().toISOString()
        };
        localStorage.setItem(this.userKey, JSON.stringify(newUser));
        return newUser;
    },

    addXP: function (points) {
        const user = this.getOrCreateUser();
        user.xp += points;
        const newLevel = Math.floor(user.xp / 100);
        if (newLevel > user.level) {
            user.level = newLevel;
            user.badges.push({ name: 'Level ' + newLevel, icon: '⭐', date: new Date().toISOString() });
        }
        localStorage.setItem(this.userKey, JSON.stringify(user));
        return user;
    },

    setCurrentLevel: function (levelId) {
        const user = this.getOrCreateUser();
        user.currentLevelId = levelId;
        localStorage.setItem(this.userKey, JSON.stringify(user));
    },

    getUser: function () {
        return this.getOrCreateUser();
    }
};

// ===== Site Configuration =====
var SITE_CONFIG = {
    baseUrl: MATHYXO_BASE,
    siteName: 'MatheuxMed',
    year: new Date().getFullYear(),
    navItems: [
        { name: 'nav.home', href: MATHYXO_BASE },
        { name: 'nav.seconde', href: MATHYXO_BASE + 'seconde/' },
        { name: 'nav.premiere', href: MATHYXO_BASE + 'premiere/' },
        { name: 'nav.terminale', href: MATHYXO_BASE + 'terminale/' },
        { name: 'nav.contact', href: MATHYXO_BASE + 'contact.html' }
    ],
    educationLevels: [
        { id: 'primaire-1', nameKey: 'level.primary1', iconKey: '📗', descKey: 'level.primary1.desc', xpReward: 10, category: 'Primaire' },
        { id: 'primaire-2', nameKey: 'level.primary2', iconKey: '📘', descKey: 'level.primary2.desc', xpReward: 15, category: 'Primaire' },
        { id: 'primaire-3', nameKey: 'level.primary3', iconKey: '📕', descKey: 'level.primary3.desc', xpReward: 20, category: 'Primaire' },
        { id: 'primaire-4', nameKey: 'level.primary4', iconKey: '📗', descKey: 'level.primary4.desc', xpReward: 25, category: 'Primaire' },
        { id: 'primaire-5', nameKey: 'level.primary5', iconKey: '📘', descKey: 'level.primary5.desc', xpReward: 30, category: 'Primaire' },
        { id: 'primaire-6', nameKey: 'level.primary6', iconKey: '📕', descKey: 'level.primary6.desc', xpReward: 35, category: 'Primaire' },
        { id: 'college-1', nameKey: 'level.middle1', iconKey: '📙', descKey: 'level.middle1.desc', xpReward: 40, category: 'Collège' },
        { id: 'college-2', nameKey: 'level.middle2', iconKey: '📗', descKey: 'level.middle2.desc', xpReward: 50, category: 'Collège' },
        { id: 'college-3', nameKey: 'level.middle3', iconKey: '📘', descKey: 'level.middle3.desc', xpReward: 60, category: 'Collège' },
        { id: 'tronc-commun', nameKey: 'level.trunk', iconKey: '📊', descKey: 'level.trunk.desc', xpReward: 75, category: 'Secondaire' },
        { id: 'bac1-se', nameKey: 'level.bac1se', iconKey: '🔬', descKey: 'level.bac1se.desc', xpReward: 100, category: 'Baccalauréat' },
        { id: 'bac1-sh', nameKey: 'level.bac1sh', iconKey: '📈', descKey: 'level.bac1sh.desc', xpReward: 85, category: 'Baccalauréat' },
        { id: 'bac2-pc', nameKey: 'level.bac2pc', iconKey: '⚗️', descKey: 'level.bac2pc.desc', xpReward: 120, category: 'Baccalauréat' },
        { id: 'bac2-svt', nameKey: 'level.bac2svt', iconKey: '🌿', descKey: 'level.bac2svt.desc', xpReward: 110, category: 'Baccalauréat' },
        { id: 'bac2-sm', nameKey: 'level.bac2sm', iconKey: '🧮', descKey: 'level.bac2sm.desc', xpReward: 125, category: 'Baccalauréat' }
    ],
    socialLinks: [
        { nameKey: 'social.github', url: 'https://github.com/matheuxmed', icon: '🐙', color: '#333' },
        { nameKey: 'social.email', url: 'mailto:contact@matheuxmed.com', icon: '📧', color: '#D44638' },
        { nameKey: 'social.linkedin', url: 'https://linkedin.com/in/matheuxmed', icon: '💼', color: '#0077B5' },
        { nameKey: 'social.twitter', url: 'https://twitter.com/matheuxmed', icon: '𝕏', color: '#000000' },
        { nameKey: 'social.instagram', url: 'https://instagram.com/matheuxmed', icon: '📸', color: '#E4405F' }
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
        navHTML += `<li><a href="${item.href}" class="nav-link">${t(item.name)}</a></li>`;
    });

    const levelName = currentLevel ? t(currentLevel.nameKey) : t('gamif.level');
    const levelIcon = currentLevel ? currentLevel.iconKey : '📚';

    navHTML += `</ul>
        </div>
        <div class="nav-right">
            <div class="current-level">
                <span>${levelIcon}</span>
                <span>${levelName}</span>
            </div>
            <div class="profile-section" onclick="alert('${t('gamif.profile')}: ${user.username}\\n${t('gamif.level')}: ${user.level}\\n${t('gamif.xp')}: ${user.xp}')">
                <div class="profile-avatar">${user.avatar}</div>
                <div class="xp-badge">
                    <span>⭐</span>
                    <span>${user.xp} ${t('gamif.xp')}</span>
                </div>
            </div>
        </div>
    </nav>`;

    return navHTML;
}

// ===== Footer Component =====
function renderFooter() {
    const copyright = t('footer.copyright', { year: SITE_CONFIG.year, siteName: SITE_CONFIG.siteName });
    const madeWith = t('footer.madeWith');

    return `
        <footer>
            <p>${copyright}</p>
            <p>${madeWith}</p>
        </footer>
    `;
}

// ===== Hero Section Component =====
function renderHero() {
    const user = GAMIFICATION.getUser();
    const greeting = t('hero.greeting', { name: user.username });
    const stats = t('hero.stats', { xp: user.xp, level: user.level, lessons: user.lessonsCompleted });
    const tagline = t('hero.tagline');

    return `
        <section class="hero">
            <h2>${greeting}</h2>
            <p>${stats}</p>
            <p><strong>${tagline}</strong></p>
        </section>
    `;
}

// ===== Level Cards Component =====
function renderLevelCards() {
    let cardsHTML = '<section class="levels">';

    SITE_CONFIG.educationLevels.forEach(level => {
        const progressPercent = '0';
        const levelName = t(level.nameKey);
        const levelDesc = t(level.descKey);
        const btnText = t('btn.start');

        cardsHTML += `
            <div class="level-card" onclick="selectLevel('${level.id}')">
                <div class="level-icon">${level.iconKey}</div>
                <h3>${levelName}</h3>
                <p>${levelDesc}</p>
                <div class="level-meta">
                    <span>📊 ${level.category}</span>
                    <span><strong>+${level.xpReward} ${t('gamif.xp')}</strong></span>
                </div>
                <div class="level-progress">
                    <div class="level-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <a href="#" class="btn">${btnText}</a>
            </div>
        `;
    });

    cardsHTML += '</section>';
    return cardsHTML;
}

function selectLevel(levelId) {
    GAMIFICATION.setCurrentLevel(levelId);
    GAMIFICATION.addXP(5);
    alert('Niveau sélectionné! +5 XP');
    location.reload();
}

// ===== Features Component =====
function renderFeatures() {
    const features = [
        { icon: '🎯', titleKey: 'feature.interactive', descKey: 'feature.interactive.desc' },
        { icon: '🎓', titleKey: 'feature.pedagogical', descKey: 'feature.pedagogical.desc' },
        { icon: '💰', titleKey: 'feature.free', descKey: 'feature.free.desc' },
        { icon: '📱', titleKey: 'feature.responsive', descKey: 'feature.responsive.desc' },
        { icon: '🎮', titleKey: 'feature.gamified', descKey: 'feature.gamified.desc' },
        { icon: '🌍', titleKey: 'feature.moroccan', descKey: 'feature.moroccan.desc' }
    ];

    let featuresHTML = `
        <section class="features">
            <h2>${t('features.title')}</h2>
            <div class="features-grid">
    `;

    features.forEach(feature => {
        featuresHTML += `
            <div class="feature">
                <h4>${feature.icon} ${t(feature.titleKey)}</h4>
                <p>${t(feature.descKey)}</p>
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
            <h2>${t('cta.title')}</h2>
            <p>${t('cta.subtitle')}</p>
            <div class="cta-buttons">
                <a href="#levels" class="btn btn-primary">${t('btn.discover')}</a>
                <a href="${MATHYXO_BASE}contact.html" class="btn btn-primary">${t('btn.contact')}</a>
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
            <a href="${link}" class="btn">${t('btn.access_lesson')}</a>
        </div>
    `;
}

// ===== Contact Page Component =====
function renderContact() {
    let contactHTML = `
        <div class="page-header">
            <h1>${t('contact.title')}</h1>
            <p>${t('contact.subtitle')}</p>
        </div>
        <section class="contact-section">
            <div class="social-links-grid">
    `;

    SITE_CONFIG.socialLinks.forEach(link => {
        contactHTML += `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-card" style="border-top-color: ${link.color};">
                <div class="social-icon">${link.icon}</div>
                <h3>${t(link.nameKey)}</h3>
                <span class="arrow">→</span>
            </a>
        `;
    });

    contactHTML += `
            </div>
        </section>
        <div style="text-align: center; margin-top: 60px;">
            <a href="${MATHYXO_BASE}" class="btn">${t('btn.back')}</a>
        </div>
    `;

    return contactHTML;
}

// ===== Back to Home Button =====
function renderBackButton() {
    return `
        <div style="text-align: center; margin-top: 40px;">
            <a href="${MATHYXO_BASE}" class="btn">${t('btn.back')}</a>
        </div>
    `;
}

// ===== Tips Section =====
function renderTipsSection(tips) {
    let tipsHTML = `
        <section style="text-align: center; padding: 40px 20px; background: #f0f0f0; border-radius: 10px;">
            <h2>${t('tips.title')}</h2>
            <ul style="list-style: none; padding: 0; color: #666; text-align: left; max-width: 600px; margin: 20px auto;">
    `;

    (tips || []).forEach(tip => {
        tipsHTML += `<li>✅ ${tip}</li>`;
    });

    tipsHTML += '</ul></section>';
    return tipsHTML;
}

// ===== Set Active Navigation Link =====
function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    const normalize = (value) => value.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        let targetPath;
        try {
            targetPath = normalize(new URL(href, window.location.href).pathname);
        } catch (e) {
            targetPath = normalize(href);
        }
        const currentNormalized = normalize(currentPath);

        if (currentNormalized === targetPath ||
            (currentNormalized === '/' && targetPath === '/')) {
            link.classList.add('active');
        }
    });
}

// ===== Mobile Menu Toggle =====
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function () {
                navMenu.classList.remove('active');
            });
        });
    }
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
    if (typeof IntersectionObserver === 'undefined') return;

    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver(function (entries) {
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

// ===== Auto-inject shared layout on every page =====
document.addEventListener('DOMContentLoaded', function () {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) headerContainer.innerHTML = renderHeader();

    const navContainer = document.getElementById('nav-container');
    if (navContainer) {
        navContainer.innerHTML = renderNavbar(window.location.pathname);
        initMobileMenu();
        setActiveNavLink();
    }

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) footerContainer.innerHTML = renderFooter();

    initSmoothScroll();
    initScrollAnimations();
});
