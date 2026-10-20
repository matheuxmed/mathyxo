// ===== Curriculum Catalog Renderer =====
// Category -> Level -> Chapter -> Lesson navigation, driven by data/curriculum.json

var CATALOG = { data: null };

function catalogBase() {
    return window.MATHYXO_BASE || '/';
}

function queryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function esc(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Localized title/description of a curriculum node
function cat(node, field) {
    return esc(L(node, field));
}

function difficultyLabel(level) {
    const key = 'catalog.difficulty.' + level;
    const label = t(key);
    return label === key ? '' : label;
}

function lessonsLabel(count) {
    if (count === 1) return t('catalog.lessonCountOne');
    return t('catalog.lessonsCount', { n: nt(count) });
}

async function loadCurriculum() {
    if (CATALOG.data) return CATALOG.data;
    const res = await fetch(catalogBase() + 'data/curriculum.json');
    if (!res.ok) throw new Error('Curriculum not found (' + res.status + ')');
    CATALOG.data = await res.json();
    return CATALOG.data;
}

function findCategory(data, id) {
    return data.categories.find(c => c.id === id);
}

function findLevel(data, levelId) {
    for (const cat of data.categories) {
        const level = cat.levels.find(l => l.id === levelId);
        if (level) return { category: cat, level };
    }
    return null;
}

function setPageContent(headerHtml, bodyHtml) {
    const header = document.getElementById('content-header');
    const body = document.getElementById('content-body');
    if (header) header.innerHTML = headerHtml;
    if (body) body.innerHTML = bodyHtml;
}

function errorBlock(message) {
    return `<div class="page-header"><h1>${t('catalog.errorTitle')}</h1><p>${esc(message)}</p></div>
        <div style="text-align:center;margin-top:40px;"><a href="${catalogBase()}" class="btn">${t('catalog.backHome')}</a></div>`;
}

// ===== Levels page (levels of a category) =====
async function renderLevelsPage() {
    const catId = queryParam('cat');
    try {
        const data = await loadCurriculum();
        const category = findCategory(data, catId);
        if (!category) {
            setPageContent(errorBlock(t('catalog.error.category')), '');
            return;
        }

        const cards = category.levels.map(level => {
            const chapterCount = level.chapters.length;
            const lessonCount = level.chapters.reduce((n, c) => n + c.lessons.length, 0);
            return `
                <a class="level-card" href="chapitres.html?niveau=${encodeURIComponent(level.id)}">
                    <div class="level-icon">${level.icon || '📘'}</div>
                    <h3>${cat(level, 'title')}</h3>
                    <p>${cat(level, 'description')}</p>
                    <div class="level-meta">
                        <span>📖 ${t('catalog.chaptersCount', { n: nt(chapterCount) })}</span>
                        <span><strong>${lessonsLabel(lessonCount)}</strong></span>
                    </div>
                    <span class="btn">${t('catalog.viewChapters')}</span>
                </a>
            `;
        }).join('');

        setPageContent(
            `<div class="page-header"><h1>${category.icon || ''} ${cat(category, 'title')}</h1><p>${cat(category, 'description')}</p></div>`,
            `<section class="levels">${cards}</section>
             <div style="text-align:center;margin-top:40px;"><a href="${catalogBase()}" class="btn">${t('catalog.backHome')}</a></div>`
        );
    } catch (error) {
        console.error(error);
        setPageContent(errorBlock(t('catalog.error.curriculum')), '');
    }
}

// ===== Chapters page (chapters of a level) =====
async function renderChaptersPage() {
    const levelId = queryParam('niveau');
    try {
        const data = await loadCurriculum();
        const found = findLevel(data, levelId);
        if (!found) {
            setPageContent(errorBlock(t('catalog.error.level')), '');
            return;
        }
        const { category, level } = found;

        const cards = level.chapters.map((chapter, index) => {
            const lessonCount = chapter.lessons.length;
            return `
                <a class="level-card" href="lecons.html?niveau=${encodeURIComponent(level.id)}&chapitre=${encodeURIComponent(chapter.id)}">
                    <div class="level-icon">${index + 1}️⃣</div>
                    <h3>${cat(chapter, 'title')}</h3>
                    <p>${cat(chapter, 'description')}</p>
                    <div class="level-meta">
                        <span>${category.icon || ''} ${cat(level, 'title')}</span>
                        <span><strong>${lessonsLabel(lessonCount)}</strong></span>
                    </div>
                    <span class="btn">${t('catalog.viewLessons')}</span>
                </a>
            `;
        }).join('');

        setPageContent(
            `<div class="page-header">
                <p class="breadcrumb"><a href="niveaux.html?cat=${encodeURIComponent(category.id)}">${category.icon || ''} ${cat(category, 'title')}</a></p>
                <h1>${level.icon || ''} ${cat(level, 'title')}</h1>
                <p>${cat(level, 'description')}</p>
            </div>`,
            `<section class="levels">${cards}</section>
             <div style="text-align:center;margin-top:40px;"><a href="niveaux.html?cat=${encodeURIComponent(category.id)}" class="btn">${t('catalog.backLevels')}</a></div>`
        );
    } catch (error) {
        console.error(error);
        setPageContent(errorBlock(t('catalog.error.chapters')), '');
    }
}

// ===== Lessons page (lessons/chunks of a chapter) =====
async function renderLessonsPage() {
    const levelId = queryParam('niveau');
    const chapterId = queryParam('chapitre');
    try {
        const data = await loadCurriculum();
        const found = findLevel(data, levelId);
        if (!found) {
            setPageContent(errorBlock(t('catalog.error.level')), '');
            return;
        }
        const { category, level } = found;
        const chapter = level.chapters.find(c => c.id === chapterId);
        if (!chapter) {
            setPageContent(errorBlock(t('catalog.error.chapter')), '');
            return;
        }

        const cards = chapter.lessons.map((lesson, index) => `
            <a class="lesson-card" href="lecon.html?niveau=${encodeURIComponent(level.id)}&chapitre=${encodeURIComponent(chapter.id)}&lecon=${encodeURIComponent(lesson.id)}">
                <h3>${index + 1}. ${cat(lesson, 'title')}</h3>
                <p>${cat(lesson, 'description')}</p>
                <div class="level-meta">
                    <span>⏱️ ${t('catalog.minutes', { n: nt(lesson.duration || 30) })}</span>
                    <span>🎯 ${difficultyLabel(lesson.difficulty)}</span>
                </div>
                <span class="btn">${t('catalog.accessLesson')}</span>
            </a>
        `).join('');

        setPageContent(
            `<div class="page-header">
                <p class="breadcrumb">
                    <a href="niveaux.html?cat=${encodeURIComponent(category.id)}">${cat(category, 'title')}</a> ·
                    <a href="chapitres.html?niveau=${encodeURIComponent(level.id)}">${cat(level, 'title')}</a>
                </p>
                <h1>${cat(chapter, 'title')}</h1>
                <p>${cat(chapter, 'description')}</p>
            </div>`,
            `<section class="lessons-grid">${cards}</section>
             <div style="text-align:center;margin-top:40px;"><a href="chapitres.html?niveau=${encodeURIComponent(level.id)}" class="btn">${t('catalog.backChapters')}</a></div>`
        );
    } catch (error) {
        console.error(error);
        setPageContent(errorBlock(t('catalog.error.lessons')), '');
    }
}

// ===== Lesson detail page =====
async function renderLessonPage() {
    const levelId = queryParam('niveau');
    const chapterId = queryParam('chapitre');
    const lessonId = queryParam('lecon');
    try {
        const data = await loadCurriculum();
        const found = findLevel(data, levelId);
        const chapter = found && found.level.chapters.find(c => c.id === chapterId);
        const lesson = chapter && chapter.lessons.find(l => l.id === lessonId);
        if (!found || !chapter || !lesson) {
            setPageContent(errorBlock(t('catalog.error.lesson')), '');
            return;
        }
        const { level } = found;

        setPageContent(
            `<div class="page-header">
                <p class="breadcrumb">
                    <a href="chapitres.html?niveau=${encodeURIComponent(level.id)}">${cat(level, 'title')}</a> ·
                    <a href="lecons.html?niveau=${encodeURIComponent(level.id)}&chapitre=${encodeURIComponent(chapter.id)}">${cat(chapter, 'title')}</a>
                </p>
                <h1>${cat(lesson, 'title')}</h1>
                <p>⏱️ ${t('catalog.minutes', { n: nt(lesson.duration || 30) })} · 🎯 ${difficultyLabel(lesson.difficulty)}</p>
            </div>`,
            `<div id="lesson-auth-note"></div>
            <article class="lesson-content">
                <p>${cat(lesson, 'description')}</p>
                <div class="placeholder-note">${t('catalog.lessonSoon')}</div>
            </article>
            <div style="text-align:center;margin-top:40px;">
                <a href="lecons.html?niveau=${encodeURIComponent(level.id)}&chapitre=${encodeURIComponent(chapter.id)}" class="btn">${t('catalog.backLessons')}</a>
            </div>`
        );
        applyLessonAuthNote();
    } catch (error) {
        console.error(error);
        setPageContent(errorBlock(t('catalog.error.lessonPage')), '');
    }
}

// Non-blocking sign-in prompt for lessons viewed while signed out.
async function applyLessonAuthNote() {
    const note = document.getElementById('lesson-auth-note');
    if (!note) return;

    let user = null;
    try {
        if (window.SUPABASE_CLIENT) {
            const { data } = await window.SUPABASE_CLIENT.auth.getSession();
            user = data && data.session && data.session.user;
        }
    } catch (error) {
        console.warn('Lesson auth note session check failed:', error);
    }

    if (user) {
        note.innerHTML = '';
        return;
    }

    const loginHref = (window.MATHYXO_BASE || '/') + 'auth/login.html';
    const registerHref = (window.MATHYXO_BASE || '/') + 'auth/register.html';
    note.innerHTML = `
        <div class="auth-banner">
            <span>${t('catalog.signInBanner')}</span>
            <span class="auth-banner-actions">
                <a href="${loginHref}" class="btn btn-ghost">${t('auth.nav.login')}</a>
                <a href="${registerHref}" class="btn">${t('auth.nav.register')}</a>
            </span>
        </div>
    `;
}
