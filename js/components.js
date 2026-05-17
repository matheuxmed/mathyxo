// ===== MatheuxMed Components System (Updated with i18n) =====
// Reusable components for all pages with Gamification and Internationalization

// ===== Gamification System =====
const GAMIFICATION = {
    // localStorage keys
    userKey: 'mathyxo_user',
    
    // Initialize or get user profile
    getOrCreateUser: function() {
        const stored = localStorage.getItem(this.userKey);
        if (stored) return JSON.parse(stored);
        
        const newUser = {
            username: I18N.t('gamif.profile') || 'Apprenant',
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
        { name: 'nav.home', href: '/mathyxo/' },
        { name: 'nav.primary', href: '/mathyxo/primaire/' },
        { name: 'nav.middle', href: '/mathyxo/college/' },
        { name: 'nav.trunk', href: '/mathyxo/tronc-commun/' },
        { name: 'nav.bac1', href: '/mathyxo/bac1/' },
        { name: 'nav.bac2', href: '/mathyxo/bac2/' },
        { name: 'nav.contact', href: '/mathyxo/contact.html' }
    ],
    educationLevels: [
        {
            id: 'primaire-1',
            nameKey: 'level.primary1',
            iconKey: '📗',
            descKey: 'level.primary1.desc',
            xpReward: 10,
            category: 'Primaire'
        },
        {
            id: 'primaire-2',
            nameKey: 'level.primary2',
            iconKey: '📘',
            descKey: 'level.primary2.desc',
            xpReward: 15,
            category: 'Primaire'
        },
        {
            id: 'primaire-3',
            nameKey: 'level.primary3',
            iconKey: '📕',
            descKey: 'level.primary3.desc',
            xpReward: 20,
            category: 'Primaire'
        },
        {
            id: 'primaire-4',
            nameKey: 'level.primary4',
            iconKey: '📗',
            descKey: 'level.primary4.desc',
            xpReward: 25,
            category: 'Primaire'
        },
        {
            id: 'primaire-5',
            nameKey: 'level.primary5',
            iconKey: '📘',
            descKey: 'level.primary5.desc',
            xpReward: 30,
            category: 'Primaire'
        },
        {
            id: 'primaire-6',
            nameKey: 'level.primary6',
            iconKey: '📕',
            descKey: 'level.primary6.desc',
            xpReward: 35,
            category: 'Primaire'
        },
        {
            id: 'college-1',
            nameKey: 'level.middle1',
            iconKey: '📙',
            descKey: 'level.middle1.desc',
            xpReward: 40,
            category: 'Collège'
        },
        {
            id: 'college-2',
            nameKey: 'level.middle2',
            iconKey: '📗',
            descKey: 'level.middle2.desc',
            xpReward: 50,
            category: 'Collège'
        },
        {
            id: 'college-3',
            nameKey: 'level.middle3',
            iconKey: '📘',
            descKey: 'level.middle3.desc',
            xpReward: 60,
            category: 'Collège'
        },
        {
            id: 'tronc-commun',
            nameKey: 'level.trunk',
            iconKey: '📊',
            descKey: 'level.trunk.desc',
            xpReward: 75,
            category: 'Secondaire'
        },
        {
            id: 'bac1-se',
            nameKey: 'level.bac1se',
            iconKey: '🔬',
            descKey: 'level.bac1se.desc',
            xpReward: 100,
            category: 'Baccalauréat'
        },
        {
            id: 'bac1-sh',
            nameKey: 'level.bac1sh',
            iconKey: '📈',
            descKey: 'level.bac1sh.desc',
            xpReward: 85,
            category: 'Baccalauréat'
        },
        {
            id: 'bac2-pc',
            nameKey: 'level.bac2pc',
            iconKey: '⚗️',
            descKey: 'level.bac2pc.desc',
            xpReward: 120,
            category: 'Baccalauréat'
        },
        {
            id: 'bac2-svt',
            nameKey: 'level.bac2svt',
            iconKey: '🌿',
            descKey: 'level.bac2svt.desc',
            xpReward: 110,
            category: 'Baccalauréat'
        },
        {
            id: 'bac2-sm',
            nameKey: 'level.bac2sm',
            iconKey: '🧮',
            descKey: 'level.bac2sm.desc',
            xpReward: 125,
            category: 'Baccalauréat'
        }
    ],
    socialLinks: [
        { 
            nameKey: 'social.github',
            url: 'https://github.com/matheuxmed',
            icon: '🐙',
            color: '#333'
        },
        { 
            nameKey: 'social.email',
            url: 'mailto:contact@matheuxmed.com',
            icon: '📧',
            color: '#D44638'
        },
        { 
            nameKey: 'social.linkedin',
            url: 'https://linkedin.com/in/matheuxmed',
            icon: '💼',
            color: '#0077B5'
        },
        { 
            nameKey: 'social.twitter',
            url: 'https://twitter.com/matheuxmed',
            icon: '𝕏',
            color: '#000000'
        },
        { 
            nameKey: 'social.instagram',
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
        const itemName = I18N.t(item.name);
        navHTML += `<li><a href="${item.href}" class="nav-link ${isActive}">${itemName}</a></li>`;
    });
    
    const levelName = currentLevel ? I18N.t(currentLevel.nameKey) : I18N.t('gamif.level');
    const levelIcon = currentLevel ? currentLevel.iconKey : '📚';
    
    navHTML += `</ul>
        </div>
        <div class="nav-right">
            <div class="current-level">
                <span>${levelIcon}</span>
                <span>${levelName}</span>
            </div>
            <div class="profile-section" onclick="alert('${I18N.t('gamif.profile')}: ${user.username}\\n${I18N.t('gamif.level')}: ${user.level}\\n${I18N.t('gamif.xp')}: ${user.xp}')">
                <div class="profile-avatar">${user.avatar}</div>
                <div class="xp-badge">
                    <span>⭐</span>
                    <span>${user.xp} ${I18N.t('gamif.xp')}</span>
                </div>
            </div>
        </div>
    </nav>`;
    
    return navHTML;
}

// ===== Footer Component =====
function renderFooter() {
    const copyright = I18N.t('footer.copyright', { 
        year: SITE_CONFIG.year, 
        siteName: SITE_CONFIG.siteName 
    });
    const madeWith = I18N.t('footer.madeWith');
    
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
    const greeting = I18N.t('hero.greeting', { name: user.username });
    const stats = I18N.t('hero.stats', { 
        xp: user.xp, 
        level: user.level, 
        lessons: user.lessonsCompleted 
    });
    const tagline = I18N.t('hero.tagline');
    
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
        const progressPercent = (Math.random() * 100).toFixed(0);
        const levelName = I18N.t(level.nameKey);
        const levelDesc = I18N.t(level.descKey);
        const btnText = I18N.t('btn.start');
        
        cardsHTML += `
            <div class="level-card" onclick="selectLevel('${level.id}')">
                <div class="level-icon">${level.iconKey}</div>
                <h3>${levelName}</h3>
                <p>${levelDesc}</p>
                <div class="level-meta">
                    <span>📊 ${level.category}</span>
                    <span><strong>+${level.xpReward} ${I18N.t('gamif.xp')}</strong></span>
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
        { icon: '🎯', titleKey: 'feature.interactive', descKey: 'feature.interactive.desc' },
        { icon: '🎓', titleKey: 'feature.pedagogical', descKey: 'feature.pedagogical.desc' },
        { icon: '💰', titleKey: 'feature.free', descKey: 'feature.free.desc' },
        { icon: '📱', titleKey: 'feature.responsive', descKey: 'feature.responsive.desc' },
        { icon: '🎮', titleKey: 'feature.gamified', descKey: 'feature.gamified.desc' },
        { icon: '🌍', titleKey: 'feature.moroccan', descKey: 'feature.moroccan.desc' }
    ];

    let featuresHTML = `
        <section class="features">
            <h2>${I18N.t('contact.subtitle').replace('Connectez-vous', 'Pourquoi')} ${SITE_CONFIG.siteName}?</h2>
            <div class="features-grid">
    `;
    
    features.forEach(feature => {
        const title = I18N.t(feature.titleKey);
        const desc = I18N.t(feature.descKey);
        featuresHTML += `
            <div class="feature">
                <h4>${feature.icon} ${title}</h4>
                <p>${desc}</p>
            </div>
        `;
    });
    
    featuresHTML += '</div></section>';
    return featuresHTML;
}

// ===== CTA Component =====
function renderCTA() {
    const title = I18N.t('cta.title');
    const subtitle = I18N.t('cta.subtitle');
    const btnDiscover = I18N.t('btn.discover');
    const btnContact = I18N.t('btn.contact');
    
    return `
        <section class="cta">
            <h2>${title}</h2>
            <p>${subtitle}</p>
            <div class="cta-buttons">
                <a href="#levels" class="btn btn-primary">${btnDiscover}</a>
                <a href="/mathyxo/contact.html" class="btn btn-primary">${btnContact}</a>
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
    const btnText = I18N.t('btn.access_lesson');
    return `
        <div class="lesson-card">
            <h3>${number} ${title}</h3>
            <p>${description}</p>
            <a href="${link}" class="btn">${btnText}</a>
        </div>
    `;
}

// ===== Contact Page Component =====
function renderContact() {
    const title = I18N.t('contact.title');
    const subtitle = I18N.t('contact.subtitle');
    let contactHTML = `
        <div class="page-header">
            <h1>${title}</h1>
            <p>${subtitle}</p>
        </div>
        <section class="contact-section">
            <div class="social-links-grid">
    `;
    
    SITE_CONFIG.socialLinks.forEach(link => {
        const linkName = I18N.t(link.nameKey);
        contactHTML += `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-card" style="border-top-color: ${link.color};">
                <div class="social-icon">${link.icon}</div>
                <h3>${linkName}</h3>
                <span class="arrow">→</span>
            </a>
        `;
    });
    
    const btnBack = I18N.t('btn.back');
    contactHTML += `
            </div>
        </section>
        <div style="text-align: center; margin-top: 60px;">
            <a href="/mathyxo/" class="btn">${btnBack}</a>
        </div>
    `;
    
    return contactHTML;
}

// ===== Back to Home Button =====
function renderBackButton() {
    const btnText = I18N.t('btn.back');
    return `
        <div style="text-align: center; margin-top: 40px;">
            <a href="/mathyxo/" class="btn">${btnText}</a>
        </div>
    `;
}

// ===== Tips Section =====
function renderTipsSection(tips) {
    const tipsTitle = I18N.t('tips.title');
    let tipsHTML = `
        <section style="text-align: center; padding: 40px 20px; background: #f0f0f0; border-radius: 10px;">
            <h2>${tipsTitle}</h2>
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
