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

function difficultyLabel(level) {
    return { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' }[level] || '';
}

async function loadCurriculum() {
    if (CATALOG.data) return CATALOG.data;
    const res = await fetch(catalogBase() + 'data/curriculum.json');
    if (!res.ok) throw new Error('Curriculum introuvable (' + res.status + ')');
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
    return `<div class="page-header"><h1>Oups</h1><p>${esc(message)}</p></div>
        <div style="text-align:center;margin-top:40px;"><a href="${catalogBase()}" class="btn">← Retour à l'accueil</a></div>`;
}

// ===== Levels page (chapters of a category) =====
async function renderLevelsPage() {
    const catId = queryParam('cat');
    try {
        const data = await loadCurriculum();
        const category = findCategory(data, catId);
        if (!category) {
            setPageContent(errorBlock('Catégorie introuvable.'), '');
            return;
        }

        const cards = category.levels.map(level => {
            const chapterCount = level.chapters.length;
            const lessonCount = level.chapters.reduce((n, c) => n + c.lessons.length, 0);
            return `
                <a class="level-card" href="chapitres.html?niveau=${encodeURIComponent(level.id)}">
                    <div class="level-icon">${level.icon || '📘'}</div>
                    <h3>${esc(level.title)}</h3>
                    <p>${esc(level.description)}</p>
                    <div class="level-meta">
                        <span>📖 ${chapterCount} chapitres</span>
                        <span><strong>${lessonCount} leçons</strong></span>
                    </div>
                    <span class="btn">Voir les chapitres →</span>
                </a>
            `;
        }).join('');

        setPageContent(
            `<div class="page-header"><h1>${category.icon || ''} ${esc(category.title)}</h1><p>${esc(category.description)}</p></div>`,
            `<section class="levels">${cards}</section>
             <div style="text-align:center;margin-top:40px;"><a href="${catalogBase()}" class="btn">← Retour à l'accueil</a></div>`
        );
    } catch (error) {
        console.error(error);
        setPageContent(errorBlock('Impossible de charger le programme.'), '');
    }
}

// ===== Chapters page (chapters of a level) =====
async function renderChaptersPage() {
    const levelId = queryParam('niveau');
    try {
        const data = await loadCurriculum();
        const found = findLevel(data, levelId);
        if (!found) {
            setPageContent(errorBlock('Niveau introuvable.'), '');
            return;
        }
        const { category, level } = found;

        const cards = level.chapters.map((chapter, index) => {
            const lessonCount = chapter.lessons.length;
            return `
                <a class="level-card" href="lecons.html?niveau=${encodeURIComponent(level.id)}&chapitre=${encodeURIComponent(chapter.id)}">
                    <div class="level-icon">${index + 1}️⃣</div>
                    <h3>${esc(chapter.title)}</h3>
                    <p>${esc(chapter.description)}</p>
                    <div class="level-meta">
                        <span>${category.icon || ''} ${esc(level.title)}</span>
                        <span><strong>${lessonCount} leçon${lessonCount > 1 ? 's' : ''}</strong></span>
                    </div>
                    <span class="btn">Voir les leçons →</span>
                </a>
            `;
        }).join('');

        setPageContent(
            `<div class="page-header">
                <p class="breadcrumb"><a href="niveaux.html?cat=${encodeURIComponent(category.id)}">${category.icon || ''} ${esc(category.title)}</a></p>
                <h1>${level.icon || ''} ${esc(level.title)}</h1>
                <p>${esc(level.description)}</p>
            </div>`,
            `<section class="levels">${cards}</section>
             <div style="text-align:center;margin-top:40px;"><a href="niveaux.html?cat=${encodeURIComponent(category.id)}" class="btn">← Retour aux niveaux</a></div>`
        );
    } catch (error) {
        console.error(error);
        setPageContent(errorBlock('Impossible de charger les chapitres.'), '');
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
            setPageContent(errorBlock('Niveau introuvable.'), '');
            return;
        }
        const { category, level } = found;
        const chapter = level.chapters.find(c => c.id === chapterId);
        if (!chapter) {
            setPageContent(errorBlock('Chapitre introuvable.'), '');
            return;
        }

        const cards = chapter.lessons.map((lesson, index) => `
            <a class="lesson-card" href="lecon.html?niveau=${encodeURIComponent(level.id)}&chapitre=${encodeURIComponent(chapter.id)}&lecon=${encodeURIComponent(lesson.id)}">
                <h3>${index + 1}. ${esc(lesson.title)}</h3>
                <p>${esc(lesson.description)}</p>
                <div class="level-meta">
                    <span>⏱️ ${lesson.duration || 30} min</span>
                    <span>🎯 ${difficultyLabel(lesson.difficulty)}</span>
                </div>
                <span class="btn">Accéder à la leçon →</span>
            </a>
        `).join('');

        setPageContent(
            `<div class="page-header">
                <p class="breadcrumb">
                    <a href="niveaux.html?cat=${encodeURIComponent(category.id)}">${esc(category.title)}</a> ·
                    <a href="chapitres.html?niveau=${encodeURIComponent(level.id)}">${esc(level.title)}</a>
                </p>
                <h1>${esc(chapter.title)}</h1>
                <p>${esc(chapter.description)}</p>
            </div>`,
            `<section class="lessons-grid">${cards}</section>
             <div style="text-align:center;margin-top:40px;"><a href="chapitres.html?niveau=${encodeURIComponent(level.id)}" class="btn">← Retour aux chapitres</a></div>`
        );
    } catch (error) {
        console.error(error);
        setPageContent(errorBlock('Impossible de charger les leçons.'), '');
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
            setPageContent(errorBlock('Leçon introuvable.'), '');
            return;
        }
        const { level } = found;

        setPageContent(
            `<div class="page-header">
                <p class="breadcrumb">
                    <a href="chapitres.html?niveau=${encodeURIComponent(level.id)}">${esc(level.title)}</a> ·
                    <a href="lecons.html?niveau=${encodeURIComponent(level.id)}&chapitre=${encodeURIComponent(chapter.id)}">${esc(chapter.title)}</a>
                </p>
                <h1>${esc(lesson.title)}</h1>
                <p>⏱️ ${lesson.duration || 30} min · 🎯 ${difficultyLabel(lesson.difficulty)}</p>
            </div>`,
            `<article class="lesson-content">
                <p>${esc(lesson.description)}</p>
                <div class="placeholder-note">📝 Le contenu détaillé de cette leçon sera bientôt disponible.</div>
            </article>
            <div style="text-align:center;margin-top:40px;">
                <a href="lecons.html?niveau=${encodeURIComponent(level.id)}&chapitre=${encodeURIComponent(chapter.id)}" class="btn">← Retour aux leçons</a>
            </div>`
        );
    } catch (error) {
        console.error(error);
        setPageContent(errorBlock('Impossible de charger la leçon.'), '');
    }
}
