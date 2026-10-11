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
        { name: 'nav.primary', href: MATHYXO_BASE + 'niveaux.html?cat=primaire' },
        { name: 'nav.middle', href: MATHYXO_BASE + 'niveaux.html?cat=college' },
        { name: 'nav.lycee', href: MATHYXO_BASE + 'niveaux.html?cat=lycee' },
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

    navHTML += `</ul>
        </div>
        <div class="nav-right">
            <div class="nav-auth" id="nav-auth"></div>
            <div class="current-level" id="nav-current-level" style="display:none;"></div>
            <div class="profile-section" id="nav-profile" style="display:none;" onclick="toggleProfile(event)">
                <div class="profile-avatar" id="nav-profile-avatar">👤</div>
                <div class="xp-badge">
                    <span id="nav-profile-name"></span>
                    <span id="nav-profile-points"></span>
                </div>
                <div class="profile-dropdown" id="nav-profile-dropdown" hidden onclick="event.stopPropagation()">
                    <div class="profile-dropdown-header">
                        <div class="profile-avatar">👤</div>
                        <strong id="dd-name">-</strong>
                        <span id="dd-email">-</span>
                    </div>
                    <ul class="profile-dropdown-list">
                        <li><span>Niveau</span><strong id="dd-level">-</strong></li>
                        <li><span>Points</span><strong id="dd-points">0</strong></li>
                        <li><span>Leçons complétées</span><strong id="dd-lessons">0</strong></li>
                        <li><span>Membre depuis</span><strong id="dd-joined">-</strong></li>
                    </ul>
                    <a href="${MATHYXO_BASE}student-dashboard/" class="btn">📊 Tableau de bord</a>
                    <button type="button" class="btn btn-danger" onclick="logoutUser()">🚪 Déconnexion</button>
                </div>
            </div>
        </div>
    </nav>`;

    return navHTML;
}

function toggleProfile(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('nav-profile-dropdown');
    if (dropdown) dropdown.hidden = !dropdown.hidden;
}

function closeProfile() {
    const dropdown = document.getElementById('nav-profile-dropdown');
    if (dropdown) dropdown.hidden = true;
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
            <div class="hero-auth" id="hero-auth"></div>
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
    const normalize = (value) => value.replace(/index\.html$/, '').replace(/\/+$/, '') || '/';
    const current = new URL(window.location.href);
    const currentPath = normalize(current.pathname);

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (!href) return;

        let target;
        try {
            target = new URL(href, window.location.href);
        } catch (e) {
            return;
        }

        let matches = currentPath === normalize(target.pathname);
        if (matches && target.search) {
            matches = current.search === target.search;
        }
        if (matches) link.classList.add('active');
    });
}

// ===== Authentication UI (navbar + hero) =====
function renderAuthArea(container, loggedIn) {
    if (!container) return;
    const loginHref = MATHYXO_BASE + 'auth/login.html';
    const registerHref = MATHYXO_BASE + 'auth/register.html';
    const dashboardHref = MATHYXO_BASE + 'student-dashboard/';

    if (loggedIn) {
        container.innerHTML = `
            <a href="${dashboardHref}" class="btn nav-auth-btn">📊 Tableau de bord</a>
            <button type="button" class="btn btn-danger nav-auth-btn" onclick="logoutUser()">Déconnexion</button>
        `;
    } else {
        container.innerHTML = `
            <a href="${loginHref}" class="btn btn-outline nav-auth-btn">Connexion</a>
            <a href="${registerHref}" class="btn nav-auth-btn">Inscription</a>
        `;
    }
}

async function refreshAuthUI() {
    let user = null;
    try {
        if (window.SUPABASE_CLIENT) {
            const { data } = await window.SUPABASE_CLIENT.auth.getSession();
            user = data && data.session && data.session.user;
        }
    } catch (error) {
        console.warn('Auth UI session check failed:', error);
    }
    renderAuthArea(document.getElementById('nav-auth'), !!user);
    renderAuthArea(document.getElementById('hero-auth'), !!user);
    await renderProfile(user);
}

async function renderProfile(user) {
    const profile = document.getElementById('nav-profile');
    const currentLevel = document.getElementById('nav-current-level');
    if (!profile) return;

    // No logged-in student: never show the profile content.
    if (!user) {
        profile.style.display = 'none';
        if (currentLevel) currentLevel.style.display = 'none';
        return;
    }

    let info = null;
    try {
        if (typeof getCurrentUserData === 'function') info = await getCurrentUserData();
    } catch (error) {
        console.warn('Could not load profile data:', error);
    }
    info = info || {};

    let completedLessons = 0;
    try {
        if (typeof getUserProgress === 'function') {
            const progress = await getUserProgress(user.id);
            completedLessons = progress.filter(p => p.completed).length;
        }
    } catch (error) {
        console.warn('Could not load progress:', error);
    }

    const meta = user.user_metadata || {};
    const displayName = info.display_name || meta.display_name || user.email || 'Étudiant';
    const level = info.level || meta.level || '-';
    const points = Number(info.total_points || 0);
    const joined = info.created_at || user.created_at;

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    setText('nav-profile-name', displayName);
    setText('nav-profile-points', points + ' ' + t('gamif.xp'));
    setText('dd-name', displayName);
    setText('dd-email', user.email || '-');
    setText('dd-level', level);
    setText('dd-points', points);
    setText('dd-lessons', completedLessons);
    setText('dd-joined', joined ? new Date(joined).toLocaleDateString('fr-FR') : '-');

    if (currentLevel) {
        currentLevel.style.display = 'flex';
        currentLevel.innerHTML = `<span>📚</span><span>${level}</span>`;
    }

    profile.style.display = 'flex';
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

    refreshAuthUI();
    document.addEventListener('click', closeProfile);
    initSmoothScroll();
    initScrollAnimations();
});
