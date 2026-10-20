// ===== Micro-learning chunk engine =====
// Renders a lesson as a sequence of gated chunks. Each micro-concept runs
//   Explainer -> Example -> Application (kind A) -> Application (kind B)
// Chunks are locked until the previous one is mastered. A wrong answer is met
// with encouragement and a FRESH variant of the same skill; after repeated
// misses the concept's explainer/example is shown again before retrying.
//
// Lesson data shape (see data/lessons/**.json):
// {
//   id, title:{fr,ar}, xp: 30,
//   concepts: [
//     {
//       id, title:{fr,ar},
//       explainer: { type:'explainer', steps:[{html, caption:{fr,ar}}] },
//       example:   { type:'explainer', steps:[...] },      // optional
//       applications: [ {type:'quiz', topic:'count', ...}, {type:'matching', ...} ]
//     }
//   ]
// }
//
// Mastery contract with the widget layer (js/activities.js):
//   - spec.onComplete()  => the attempt succeeded (mastered)
//   - spec.onWrong()     => the attempt failed and the student should retry

const ChunkEngine = (function () {

    // After this many failed attempts, re-teach before letting them retry.
    const MAX_ATTEMPTS_BEFORE_HELP = 2;

    const T = {
        explain: { fr: 'Découverte', ar: 'الاستكشاف' },
        example: { fr: 'Exemple', ar: 'مثال' },
        apply1: { fr: 'À toi ! (1)', ar: 'دورك! (1)' },
        apply2: { fr: 'À toi ! (2)', ar: 'دورك! (2)' },
        continue: { fr: 'Continuer →', ar: 'متابعة ←' },
        nextChunk: { fr: 'Étape suivante →', ar: 'الخطوة التالية ←' },
        retry: { fr: 'Réessayer', ar: 'أعد المحاولة' },
        mastered: { fr: 'Étape réussie !', ar: 'أحسنت!' },
        encourage: {
            fr: ['Presque ! Tu y es presque 💪', "Bien essayé ! On recommence ensemble 🌱",
                 "Ce n'est pas grave, les erreurs font apprendre ✨", 'Continue, tu progresses ! 🚀'],
            ar: ['قريب جداً! أنت على وشك النجاح 💪', 'محاولة جيدة! لنعد معاً 🌱',
                 'لا بأس، الأخطاء تعلّمنا ✨', 'واصل، أنت تتقدم! 🚀']
        },
        helpAgain: { fr: 'Regardons encore une fois ensemble 👇', ar: 'لنشاهد مرة أخرى معاً 👇' },
        done: { fr: 'Leçon terminée !', ar: 'أكملت الدرس!' },
        progress: { fr: 'Progression', ar: 'التقدم' },
        starsLabel: { fr: 'Étoiles gagnées', ar: 'النجوم المكتسبة' },
        xpEarned: { fr: '{n} XP gagnés', ar: '{n} نقطة خبرة' },
        savedXp: { fr: 'Tes {n} XP ont été ajoutés à ton compte ✓', ar: 'أُضيفت {n} نقطة خبرة إلى حسابك ✓' },
        starsEarned: { fr: 'Tu as gagné {n} étoiles ! ⭐', ar: 'ربحت {n} نجمة! ⭐' },
        keepRewards: {
            fr: 'Crée un compte gratuit pour garder tes étoiles et ta progression !',
            ar: 'أنشئ حساباً مجانياً للاحتفاظ بنجومك وتقدمك!'
        },
        signUp: { fr: 'Créer un compte', ar: 'إنشاء حساب' },
        signIn: { fr: 'Se connecter', ar: 'تسجيل الدخول' },
        backToLessons: { fr: '⬅ Retour aux leçons', ar: '⬅ العودة إلى الدروس' }
    };

    const lang = () => (typeof I18N !== 'undefined' && I18N.currentLanguage) || 'fr';

    const pick = (v) => {
        if (v == null) return '';
        if (typeof v === 'string') return v;
        return v[lang()] || v.fr || v.ar || '';
    };

    const pickIndex = (v, i) => {
        if (typeof v === 'string') return v;
        const list = v[lang()] || v.fr || [];
        return list.length ? list[i % list.length] : '';
    };

    const fill = (template, n) => String(template).replace('{n}', n);

    const el = (tag, className, html) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (html != null) node.innerHTML = html;
        return node;
    };

    // Flatten a lesson into an ordered list of gated steps.
    function buildSteps(lesson) {
        const steps = [];
        (lesson.concepts || []).forEach((concept, ci) => {
            const base = { conceptId: concept.id, conceptIndex: ci, conceptTitle: concept.title };
            steps.push(Object.assign({}, base, {
                kind: 'explainer', spec: concept.explainer, needsMastery: false,
                label: T.explain, icon: '📖'
            }));
            if (concept.example) {
                steps.push(Object.assign({}, base, {
                    kind: 'example', spec: concept.example, needsMastery: false,
                    label: T.example, icon: '💡'
                }));
            }
            (concept.applications || []).forEach((app, ai) => {
                steps.push(Object.assign({}, base, {
                    kind: 'application', spec: app, needsMastery: true,
                    label: ai === 0 ? T.apply1 : T.apply2, icon: '✏️', appIndex: ai
                }));
            });
        });
        return steps;
    }

    function mount(lesson, host) {
        const steps = buildSteps(lesson);
        const masterySteps = steps.filter(s => s.needsMastery).length;
        let index = 0;
        let attempts = 0;
        let starsEarned = 0;
        const state = { lesson, steps, index: () => index, stars: () => starsEarned };

        host.classList.add('chunk-lesson');

        // ---- chrome ----
        function renderProgress() {
            const done = Math.min(index, steps.length);
            const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
            const bar = el('div', 'chunk-progress');
            bar.innerHTML =
                '<div class="chunk-progress-label">' + pick(T.progress) +
                ' <span dir="ltr">' + done + ' / ' + steps.length + '</span></div>' +
                '<div class="act-progress"><span style="width:' + pct + '%"></span></div>';
            host.appendChild(bar);
        }

        function renderRail() {
            const rail = el('div', 'chunk-rail');
            steps.forEach((step, i) => {
                const chip = el('span', 'chunk-chip' + (i === index ? ' current' : '') +
                    (i < index ? ' done' : '') + (i > index ? ' locked' : ''));
                chip.textContent = step.icon;
                chip.title = pick(step.label);
                rail.appendChild(chip);
            });
            host.appendChild(rail);
        }

        function advance() {
            index++;
            attempts = 0;
            if (index >= steps.length) renderFinish();
            else render();
        }

        // ---- step rendering ----
        function render() {
            host.innerHTML = '';
            renderProgress();
            renderRail();

            const step = steps[index];
            const card = el('div', 'activity chunk-card');
            const head = el('div', 'activity-head');
            head.innerHTML = '<h3 class="activity-title">' + step.icon + ' ' + pick(step.label) + '</h3>' +
                (step.conceptTitle ? '<span class="activity-kind">' + pick(step.conceptTitle) + '</span>' : '');
            card.appendChild(head);

            const stage = el('div', 'activity-stage');
            card.appendChild(stage);
            const footer = el('div', 'activity-actions chunk-footer');
            card.appendChild(footer);
            host.appendChild(card);

            if (step.needsMastery) renderApplication(step, stage, footer);
            else renderTeaching(step, stage, footer);
        }

        // Explainer / Example: a walkthrough with a Continue button.
        function renderTeaching(step, stage, footer) {
            renderActivity(Object.assign({}, step.spec, { replay: false }), stage);
            const btn = el('button', 'act-btn success');
            btn.type = 'button';
            btn.textContent = pick(T.continue);
            btn.addEventListener('click', advance);
            footer.appendChild(btn);
        }

        // Application: locked until answered correctly.
        function renderApplication(step, stage, footer) {
            const holder = el('div', 'chunk-variant');
            const feedback = el('div', 'act-feedback');
            const actions = el('div', 'chunk-retry-actions');
            stage.appendChild(holder);
            stage.appendChild(feedback);
            stage.appendChild(actions);

            let solved = false;
            // Stable per-step seed so each retry differs but the skill is the same.
            const baseSeed = (Date.now() % 1000000) + index * 7919;

            function announce(message, cls) {
                feedback.className = 'act-feedback ' + (cls || '');
                feedback.textContent = message || '';
            }

            function succeed() {
                if (solved) return;
                solved = true;
                starsEarned++;
                announce('⭐ ' + pick(T.mastered), 'good');
                actions.innerHTML = '';
                const btn = el('button', 'act-btn success');
                btn.type = 'button';
                btn.textContent = index === steps.length - 1 ? pick(T.continue) : pick(T.nextChunk);
                btn.addEventListener('click', advance);
                actions.appendChild(btn);
            }

            function fail() {
                if (solved) return;
                attempts++;
                announce(pickIndex(T.encourage, attempts - 1), 'info');
                actions.innerHTML = '';
                const retry = el('button', 'act-btn');
                retry.type = 'button';
                retry.textContent = '↻ ' + pick(T.retry);
                retry.addEventListener('click', () => {
                    showHelpIfNeeded(step, stage, feedback);
                    mountAttempt();
                });
                actions.appendChild(retry);
            }

            // After repeated misses, re-teach the concept above the retry.
            function showHelpIfNeeded(step, stage, feedback) {
                if (attempts < MAX_ATTEMPTS_BEFORE_HELP) return;
                stage.querySelectorAll('.chunk-help').forEach(n => n.remove());
                const help = el('div', 'chunk-help');
                help.appendChild(el('p', 'chunk-help-title', pick(T.helpAgain)));
                const body = el('div', 'chunk-help-body');
                help.appendChild(body);
                stage.insertBefore(help, feedback);
                const concept = lesson.concepts && lesson.concepts[step.conceptIndex];
                const teaching = (concept && (concept.example || concept.explainer)) || step.spec;
                renderActivity(Object.assign({}, teaching, { replay: false }), body);
            }

            function mountAttempt() {
                holder.innerHTML = '';
                announce('', '');
                actions.innerHTML = '';
                const variant = buildVariant(step.spec, attempts, baseSeed);
                const spec = Object.assign({}, variant, {
                    replay: false,
                    onComplete: succeed,
                    onWrong: fail
                });
                // A quiz reports a score at the end rather than firing onWrong:
                // a perfect score masters the step, anything less is a miss.
                if (step.spec.type === 'quiz') {
                    spec.onComplete = (score, total) => {
                        if (score === total) succeed();
                        else fail();
                    };
                }
                renderActivity(spec, holder);
            }

            mountAttempt();
        }

        // ---- finish ----
        function renderFinish() {
            host.innerHTML = '';
            const wrap = el('div', 'chunk-finish');
            host.appendChild(wrap);

            const xp = lesson.xp || 20;
            wrap.innerHTML =
                '<h2>🎉 ' + pick(T.done) + '</h2>' +
                '<p class="chunk-finish-stars">' + pick(T.starsLabel) +
                ': <strong dir="ltr">' + starsEarned + ' / ' + masterySteps + '</strong> ' +
                '⭐'.repeat(Math.min(starsEarned, 10)) + '</p>';

            const actions = el('div', 'chunk-finish-actions');
            wrap.appendChild(actions);

            const back = el('div', 'chunk-finish-back');
            const backUrl = (window.MATHYXO_BASE || '/') + 'lecons.html' +
                (lesson._query ? '?' + lesson._query : '');
            back.innerHTML = '<a class="btn btn-ghost" href="' + backUrl + '">' +
                pick(T.backToLessons) + '</a>';
            wrap.appendChild(back);

            if (typeof getCurrentUser !== 'function') return;

            getCurrentUser().then(user => {
                if (!user) {
                    // Signed out: star reward screen + nudge to keep rewards.
                    actions.innerHTML =
                        '<div class="chunk-stars">' + fill(pick(T.starsEarned), starsEarned) + '</div>' +
                        '<p class="chunk-keep">' + pick(T.keepRewards) + '</p>' +
                        '<div class="chunk-auth-buttons">' +
                        '<a class="act-btn" href="' + (window.MATHYXO_BASE || '/') + 'auth/register.html">' +
                        pick(T.signUp) + '</a>' +
                        '<a class="act-btn secondary" href="' + (window.MATHYXO_BASE || '/') + 'auth/login.html">' +
                        pick(T.signIn) + '</a>' +
                        '</div>';
                    return;
                }
                // Signed in: add the XP to the account.
                const landed = '<div class="chunk-xp-good">⭐ ' + fill(pick(T.xpEarned), xp) + '</div>';
                const record = (typeof completeLesson === 'function') ? completeLesson
                    : (typeof saveProgress === 'function' ? saveProgress : null);
                if (!record) {
                    actions.innerHTML = landed;
                    return;
                }
                actions.innerHTML = '<div class="chunk-xp-good">…</div>';
                record(lesson.id, xp).then(() => {
                    actions.innerHTML = landed + '<p>' + fill(pick(T.savedXp), xp) + '</p>';
                }).catch(() => {
                    actions.innerHTML = landed;
                });
            }).catch(() => { /* leave the finish screen as-is */ });
        }

        render();
        return state;
    }

    return { mount, buildSteps };
})();
