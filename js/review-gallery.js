// ===== Review gallery =====
// One worked prototype for each interaction type, using real primary-school
// curriculum topics. This page is for reviewing the activities before they are
// wired into the actual lessons. Not linked from the site navigation.

const ReviewGallery = (function () {

    // ---- Shared bilingual strings ----
    const S = {
        correct: { fr: 'Bravo ! ✓', ar: 'أحسنت! ✓' },
        incorrect: { fr: 'Pas encore, essaie encore.', ar: 'ليس بعد، حاول مرة أخرى.' },
        win: { fr: 'Excellent travail ! 🎉', ar: 'عمل ممتاز! 🎉' },
        tryAgain: { fr: 'Continue à t\'entraîner 💪', ar: 'واصل التدريب 💪' },
        restart: { fr: 'Rejouer', ar: 'إعادة اللعب' },
        streakLabel: { fr: 'Série :', ar: 'المتتالية:' },
        bestLabel: { fr: 'record !', ar: 'رقم قياسي!' },
        tooMany: { fr: 'Presque ! Tu en as colorié trop.', ar: 'تقريباً! لوّنت أكثر من اللازم.' }
    };

    // ---------- Section 1: manipulatives ----------
    const manipulatives = [
        {
            type: 'count-tap',
            title: { fr: 'Compter des objets (1–5)', ar: 'عدّ الأشياء (1-5)' },
            prompt: { fr: 'Touche chaque pomme pour la compter.', ar: 'المس كل تفاحة لعدّها.' },
            target: { fr: 'Toutes comptées !', ar: 'تم عدّها كلها!' },
            success: S.correct,
            items: ['🍎', '🍎', '🍎', '🍎', '🍎'],
            why: {
                fr: 'Correspondance un-à-un : chaque objet touché = un nombre dit à voix haute.',
                ar: 'التناظر واحد بواحد: كل شيء يُلمس يقابل عدداً يُقال بصوت عالٍ.'
            }
        },
        {
            type: 'tenframe',
            title: { fr: 'Le cadre de dix', ar: 'إطار العشرة' },
            prompt: { fr: 'Remplis le cadre pour faire exactement 10.', ar: 'املأ الإطار لتكوين 10 بالضبط.' },
            success: { fr: 'Exactement 10 ! ✓', ar: 'بالضبط 10! ✓' },
            frames: 1,
            target: 10,
            why: {
                fr: 'Le cadre de dix installe l\'ancrage visuel de la dizaine, base de tout le calcul mental.',
                ar: 'إطار العشرة يرسّخ صورة العشرة ذهنياً، وهي أساس الحساب الذهني.'
            }
        },
        {
            type: 'tenframe',
            title: { fr: 'Dizaines et unités', ar: 'العشرات والوحدات' },
            prompt: { fr: 'Représente le nombre 24.', ar: 'مثّل العدد 24.' },
            success: { fr: '24 = 2 dizaines + 4 unités ✓', ar: '24 = عشرتان و4 وحدات ✓' },
            frames: 3,
            target: 24,
            why: {
                fr: 'Décomposition en dizaines et unités, prérequis de la numération et des opérations posées.',
                ar: 'التفكيك إلى عشرات ووحدات، وهو تمهيد للترقيم والعمليات العمودية.'
            }
        },
        {
            type: 'count-tap',
            title: { fr: 'Addition simple (3 + 2)', ar: 'الجمع البسيط (3 + 2)' },
            prompt: { fr: 'Compte les canards de chaque groupe, puis le total.', ar: 'عُدّ البط في كل مجموعة، ثم المجموع.' },
            target: { fr: '3 + 2 = 5 🦆', ar: '3 + 2 = 5 🦆' },
            success: S.correct,
            items: ['🦆', '🦆', '🦆', '🦆', '🦆'],
            why: {
                fr: 'L\'addition naît du dénombrement de deux collections réunies.',
                ar: 'الجمع ينشأ من عدّ مجموعتين مجتمعتين.'
            }
        }
    ];

    // ---------- Section 2: compare / order ----------
    const compare = [
        {
            type: 'number-line',
            title: { fr: 'Placer les nombres sur la ligne', ar: 'وضع الأعداد على المستقيم' },
            prompt: { fr: 'Glisse chaque nombre à sa place sur la ligne de 0 à 10.', ar: 'اسحب كل عدد إلى مكانه على المستقيم من 0 إلى 10.' },
            success: { fr: 'Tous bien placés ! 📏', ar: 'كلها في أماكنها الصحيحة! 📏' },
            retry: S.incorrect,
            min: 0,
            max: 10,
            slots: [2, 5, 8]
        },
        {
            type: 'matching',
            title: { fr: 'Relier nombre et quantité', ar: 'الربط بين العدد والكمية' },
            prompt: { fr: 'Associe chaque nombre à la bonne collection.', ar: 'اربط كل عدد بالمجموعة المناسبة.' },
            pairCorrect: S.correct,
            pairWrong: S.incorrect,
            pairs: [
                { left: '3', right: '⭐⭐⭐' },
                { left: '5', right: '⭐⭐⭐⭐⭐' },
                { left: '7', right: '⭐⭐⭐⭐⭐⭐⭐' }
            ]
        },
        {
            type: 'sort',
            title: { fr: 'Trier plus petit / plus grand que 10', ar: 'الترتيب: أصغر من 10 / أكبر من 10' },
            prompt: { fr: 'Range chaque nombre dans le bon panier.', ar: 'رتّب كل عدد في السلة الصحيحة.' },
            correct: S.correct,
            incorrect: S.incorrect,
            success: { fr: 'Tri réussi ! 🧺', ar: 'تم الترتيب بنجاح! 🧺' },
            buckets: [
                { id: 'lt', label: { fr: 'Plus petit que 10', ar: 'أصغر من 10' } },
                { id: 'gt', label: { fr: 'Plus grand que 10', ar: 'أكبر من 10' } }
            ],
            items: [
                { label: '7', bucket: 'lt' },
                { label: '14', bucket: 'gt' },
                { label: '9', bucket: 'lt' },
                { label: '20', bucket: 'gt' }
            ]
        },
        {
            type: 'explainer',
            title: { fr: 'Les signes < = >', ar: 'الرموز < = >' },
            prompt: { fr: 'Compare deux nombres, étape par étape.', ar: 'قارن بين عددين خطوة بخطوة.' },
            prev: { fr: '‹ Précédent', ar: '‹ السابق' },
            next: { fr: 'Suivant ›', ar: 'التالي ›' },
            replay: { fr: '↻ Revoir', ar: '↻ إعادة' },
            steps: [
                {
                    html: '<div class="compare-row"><span>7</span><span class="compare-slot">?</span><span>4</span></div>',
                    caption: { fr: 'On veut comparer 7 et 4.', ar: 'نريد المقارنة بين 7 و4.' }
                },
                {
                    html: '<div class="compare-row"><span>7</span><span class="compare-slot">&gt;</span><span>4</span></div>',
                    caption: { fr: '7 est plus grand que 4 : la bouche du crocodile est ouverte vers 7.', ar: '7 أكبر من 4: فم التمساح مفتوح نحو 7.' }
                },
                {
                    html: '<div class="compare-row"><span>7</span><span class="compare-slot">&gt;</span><span>4</span></div>' +
                          '<div class="compare-row" style="font-size:1.1rem;margin-top:14px"><span>4</span><span class="compare-slot">&lt;</span><span>7</span></div>',
                    caption: { fr: 'Attention : 4 < 7 revient au même, lu dans l\'autre sens.', ar: 'انتبه: 4 < 7 نفس المعنى لكن في الاتجاه الآخر.' }
                }
            ]
        }
    ];

    // ---------- Section 3: geometry ----------
    const geometry = [
        {
            type: 'shapes',
            title: { fr: 'Reconnaître les figures', ar: 'التعرف على الأشكال' },
            prompt: { fr: 'Trouve le triangle parmi ces figures.', ar: 'اعثر على المثلث بين هذه الأشكال.' },
            success: S.correct,
            retry: S.incorrect,
            target: 'triangle',
            shapes: [
                { id: 'carre', name: { fr: 'Carré', ar: 'مربع' } },
                { id: 'triangle', name: { fr: 'Triangle', ar: 'مثلث' } },
                { id: 'cercle', name: { fr: 'Cercle', ar: 'دائرة' } },
                { id: 'rectangle', name: { fr: 'Rectangle', ar: 'مستطيل' } }
            ]
        },
        {
            type: 'shapes',
            title: { fr: 'Les solides de l\'espace', ar: 'مجسمات الفضاء' },
            prompt: { fr: 'Touche chaque solide pour le nommer.', ar: 'المس كل مجسم لتسميته.' },
            shapes: [
                { id: 'cube', name: { fr: 'Cube', ar: 'مكعب' }, note: { fr: '6 faces carrées', ar: '6 أوجه مربعة' } },
                { id: 'pave', name: { fr: 'Pavé droit', ar: 'متوازي المستطيلات' }, note: { fr: '6 faces rectangulaires', ar: '6 أوجه مستطيلة' } },
                { id: 'boule', name: { fr: 'Boule', ar: 'كرة' }, note: { fr: 'roule dans tous les sens', ar: 'تتدحرج في كل الاتجاهات' } },
                { id: 'cylindre', name: { fr: 'Cylindre', ar: 'أسطوانة' }, note: { fr: '2 disques + 1 surface courbe', ar: 'قرصان وسطح منحنٍ' } }
            ]
        },
        {
            type: 'symmetry',
            title: { fr: 'Symétrie : le miroir', ar: 'التماثل: المرآة' },
            prompt: { fr: 'Dessine à gauche ; observe le reflet se construire à droite.', ar: 'ارسم على اليسار؛ ولاحظ انعكاس الرسم على اليمين.' },
            hint: { fr: 'Le reflet bleu clair montre le résultat du pliage selon l\'axe rouge.', ar: 'الانعكاس بالأزرق الفاتح يبيّن نتيجة الطي وفق المحور الأحمر.' },
            verticalLabel: { fr: 'Axe vertical', ar: 'محور عمودي' },
            horizontalLabel: { fr: 'Axe horizontal', ar: 'محور أفقي' },
            clear: { fr: 'Effacer', ar: 'مسح' },
            size: 8,
            axis: 'vertical'
        },
        {
            type: 'explainer',
            title: { fr: 'Construire un carré', ar: 'إنشاء مربع' },
            prompt: { fr: 'Les étapes de construction, une par une.', ar: 'خطوات الإنشاء، واحدة واحدة.' },
            prev: { fr: '‹ Précédent', ar: '‹ السابق' },
            next: { fr: 'Suivant ›', ar: 'التالي ›' },
            replay: { fr: '↻ Revoir', ar: '↻ إعادة' },
            steps: [
                { html: '<svg width="200" height="170" viewBox="0 0 200 170"><line x1="50" y1="130" x2="150" y2="130" stroke="#e5484d" stroke-width="3"/><circle cx="50" cy="130" r="3.5" fill="#1f2d3d"/><circle cx="150" cy="130" r="3.5" fill="#1f2d3d"/><text x="100" y="152" text-anchor="middle" fill="#64748b" font-size="13">4 cm</text></svg>', caption: { fr: 'On trace un premier segment de 4 cm.', ar: 'نرسم قطعة أولى بطول 4 سم.' } },
                { html: '<svg width="200" height="170" viewBox="0 0 200 170"><line x1="50" y1="130" x2="150" y2="130" stroke="#e5484d" stroke-width="3"/><line x1="50" y1="130" x2="50" y2="30" stroke="#2b7fff" stroke-width="3" stroke-dasharray="5 4"/><circle cx="50" cy="130" r="3.5" fill="#1f2d3d"/><circle cx="50" cy="30" r="3.5" fill="#2b7fff"/><path d="M50 112 h18 v-18" fill="none" stroke="#94a3b8" stroke-width="2"/><text x="26" y="84" text-anchor="middle" fill="#64748b" font-size="13">4 cm</text></svg>', caption: { fr: 'On élève une perpendiculaire à l\'équerre, de même longueur.', ar: 'نرفع عمودياً باستعمال المسطرة القائمة، بنفس الطول.' } },
                { html: '<svg width="200" height="170" viewBox="0 0 200 170"><rect x="50" y="30" width="100" height="100" fill="none" stroke="#22a06b" stroke-width="3"/><path d="M50 112 h18 v-18" fill="none" stroke="#94a3b8" stroke-width="2"/><path d="M150 112 h-18 v-18" fill="none" stroke="#94a3b8" stroke-width="2"/><path d="M50 48 h18 v-18" fill="none" stroke="#94a3b8" stroke-width="2"/><path d="M150 48 h-18 v-18" fill="none" stroke="#94a3b8" stroke-width="2"/><text x="100" y="152" text-anchor="middle" fill="#64748b" font-size="13">4 cm</text><text x="26" y="84" text-anchor="middle" fill="#64748b" font-size="13">4 cm</text></svg>', caption: { fr: 'Les 4 côtés égaux et 4 angles droits : c\'est un carré.', ar: 'الأضلاع الأربعة متساوية والزوايا الأربع قائمة: هذا مربع.' } }
            ]
        }
    ];

    // ---------- Section 4: explainers (carry + division) ----------
    const explainers = [
        {
            type: 'explainer',
            title: { fr: 'L\'addition avec retenue', ar: 'الجمع مع الاحتفاظ' },
            prompt: { fr: 'Calculons 28 + 15 ensemble.', ar: 'لنحسب 28 + 15 معاً.' },
            prev: { fr: '‹ Précédent', ar: '‹ السابق' },
            next: { fr: 'Suivant ›', ar: 'التالي ›' },
            replay: { fr: '↻ Revoir', ar: '↻ إعادة' },
            steps: [
                {
                    html: '<div class="col-sum">' +
                          '<div class="row"><span class="cell blank"></span><span class="cell blank"></span></div>' +
                          '<div class="row"><span class="cell">2</span><span class="cell">8</span></div>' +
                          '<div class="row"><span class="cell">1</span><span class="cell">5</span></div>' +
                          '<div class="row rule"><span></span><span></span></div>' +
                          '<div class="row"><span class="cell blank"></span><span class="cell blank"></span></div>' +
                          '</div>',
                    caption: { fr: 'On pose l\'opération : unités sous unités, dizaines sous dizaines.', ar: 'نضع العملية: الوحدات تحت الوحدات والعشرات تحت العشرات.' }
                },
                {
                    html: '<div class="col-sum">' +
                          '<div class="row"><span class="cell blank"></span><span class="cell blank"></span></div>' +
                          '<div class="row"><span class="cell">2</span><span class="cell">8</span></div>' +
                          '<div class="row"><span class="cell">1</span><span class="cell">5</span></div>' +
                          '<div class="row rule"><span></span><span></span></div>' +
                          '<div class="row"><span class="cell blank"></span><span class="cell blank"></span></div>' +
                          '</div>' +
                          '<div class="col-note">8 + 5 = 13</div>',
                    caption: { fr: 'On commence par les unités : 8 + 5 = 13.', ar: 'نبدأ بالوحدات: 8 + 5 = 13.' }
                },
                {
                    html: '<div class="col-sum">' +
                          '<div class="row"><span class="cell blank"></span><span class="cell carry">1</span></div>' +
                          '<div class="row"><span class="cell">2</span><span class="cell hot">8</span></div>' +
                          '<div class="row"><span class="cell">1</span><span class="cell hot">5</span></div>' +
                          '<div class="row rule"><span></span><span></span></div>' +
                          '<div class="row"><span class="cell blank"></span><span class="cell result">3</span></div>' +
                          '</div>',
                    caption: { fr: '13, c\'est 1 dizaine et 3 unités : j\'écris 3 et je retiens 1.', ar: '13 هي عشرة واحدة و3 وحدات: أكتب 3 وأحتفظ بـ 1.' }
                },
                {
                    html: '<div class="col-sum">' +
                          '<div class="row"><span class="cell blank"></span><span class="cell carry">1</span></div>' +
                          '<div class="row"><span class="cell hot">2</span><span class="cell">8</span></div>' +
                          '<div class="row"><span class="cell hot">1</span><span class="cell">5</span></div>' +
                          '<div class="row rule"><span></span><span></span></div>' +
                          '<div class="row"><span class="cell result">4</span><span class="cell result">3</span></div>' +
                          '</div>' +
                          '<div class="col-note">1 + 2 + 1 = 4</div>',
                    caption: { fr: 'Dizaines : 1 (retenue) + 2 + 1 = 4. Résultat : 43 ✔', ar: 'العشرات: 1 (المحتفظ به) + 2 + 1 = 4. النتيجة: 43 ✔' }
                }
            ]
        },
        {
            type: 'explainer',
            title: { fr: 'Le sens de la division (partage)', ar: 'معنى القسمة (التقسيم)' },
            prompt: { fr: 'Comment partager 12 bonbons entre 3 enfants ?', ar: 'كيف نوزع 12 حلوى على 3 أطفال؟' },
            prev: { fr: '‹ Précédent', ar: '‹ السابق' },
            next: { fr: 'Suivant ›', ar: 'التالي ›' },
            replay: { fr: '↻ Revoir', ar: '↻ إعادة' },
            steps: [
                {
                    html: '<div class="bead-row">' + '🍬'.repeat(12) + '</div>',
                    caption: { fr: 'On a 12 bonbons en tout.', ar: 'لدينا 12 حلوى في المجموع.' }
                },
                {
                    html: '<div class="bead-row">' + '🍬'.repeat(3) + '<span style="margin:0 14px"></span>' + '🍬'.repeat(3) + '<span style="margin:0 14px"></span>' + '🍬'.repeat(3) + '</div>' +
                          '<div style="text-align:center;margin-top:10px;color:#64748b">🍬🍬🍬</div>',
                    caption: { fr: 'On distribue 1 par 1 : 3 parts égales.', ar: 'نوزع واحداً واحداً: 3 أجزاء متساوية.' }
                },
                {
                    html: '<div style="font-size:1.6rem;font-weight:800;text-align:center">12 ÷ 3 = 4</div>',
                    caption: { fr: 'Chaque enfant reçoit 4 bonbons.', ar: 'كل طفل يحصل على 4 حلوى.' }
                }
            ]
        }
    ];

    // ---------- Section 5: games ----------
    const games = [
        {
            type: 'quiz',
            title: { fr: 'Défi : les nombres de 0 à 9', ar: 'تحدٍّ: الأعداد من 0 إلى 9' },
            prompt: { fr: 'Réponds vite pour gagner des étoiles !', ar: 'أجب بسرعة لتكسب النجوم!' },
            correct: S.correct,
            incorrect: S.incorrect,
            win: S.win,
            tryAgain: S.tryAgain,
            restart: S.restart,
            questions: [
                { prompt: { fr: 'Quel nombre vient juste après 7 ?', ar: 'ما العدد الذي يأتي مباشرة بعد 7؟' }, options: ['6', '8', '9'], answer: 1 },
                { prompt: { fr: 'Combien de doigts sur une main ?', ar: 'كم إصبعاً في اليد الواحدة؟' }, options: ['4', '5', '10'], answer: 1 },
                { prompt: { fr: '3 + 4 = ?', ar: '3 + 4 = ؟' }, options: ['6', '7', '8'], answer: 1 },
                { prompt: { fr: 'Quel est le plus grand ?', ar: 'أيّها الأكبر؟' }, options: ['2', '9', '5'], answer: 1 },
                { prompt: { fr: 'Combien de côtés a un triangle ?', ar: 'كم ضلعاً للمثلث؟' }, options: ['3', '4', '5'], answer: 0 }
            ]
        },
        {
            type: 'tables',
            title: { fr: 'Jeu des tables de multiplication', ar: 'لعبة جداول الضرب' },
            prompt: { fr: 'Choisis une table et bats ton record de série.', ar: 'اختر جدولاً وحطّم رقمك القياسي.' },
            correct: S.correct,
            wrong: { fr: 'La bonne réponse :', ar: 'الجواب الصحيح:' },
            streakLabel: S.streakLabel.fr,
            bestLabel: S.bestLabel.fr,
            tables: [2, 3, 4, 5]
        }
    ];

    // ---------- Section 6: extended widgets (primaire 3–6) ----------
    const extended = [
        {
            type: 'fraction',
            title: { fr: 'Colorie la fraction 3/4', ar: 'لوّن الكسر 3/4' },
            prompt: { fr: 'Touche les parts pour en colorier trois sur quatre.', ar: 'المس الأجزاء لتلوّن ثلاثة من أربعة.' },
            correct: S.correct, retry: S.tryAgain, tooMany: S.tooMany,
            shape: 'bar', parts: 4, mode: 'shade', target: 3
        },
        {
            type: 'fraction',
            title: { fr: 'Quelle fraction est coloriée ?', ar: 'ما الكسر الملوّن؟' },
            prompt: { fr: 'Lis la fraction représentée par le disque.', ar: 'اقرأ الكسر الذي تمثله الدائرة.' },
            correct: S.correct, retry: S.tryAgain,
            shape: 'pie', parts: 6, mode: 'read', shaded: 4, target: 4
        },
        {
            type: 'place-value',
            title: { fr: 'Place les chiffres de 3,45', ar: 'ضع أرقام 3,45' },
            prompt: { fr: 'Touche chaque case pour choisir le bon chiffre.', ar: 'المس كل مربع لاختيار الرقم الصحيح.' },
            correct: S.correct,
            mode: 'build', number: '3,45'
        },
        {
            type: 'place-value',
            title: { fr: 'Compare 3,45 et 3,5', ar: 'قارن 3,45 و3,5' },
            prompt: { fr: 'Choisis le bon signe.', ar: 'اختر الرمز الصحيح.' },
            correct: S.correct, retry: S.tryAgain,
            mode: 'compare', a: '3,45', b: '3,5'
        },
        {
            type: 'angle',
            title: { fr: 'Construis un angle droit', ar: 'أنشئ زاوية قائمة' },
            prompt: { fr: 'Glisse le rayon bleu pour former un angle de 90°.', ar: 'اسحب الشعاع الأزرق لتكوين زاوية 90°.' },
            correct: S.correct,
            mode: 'make', target: 90
        },
        {
            type: 'angle',
            title: { fr: 'Reconnais l\'angle', ar: 'تعرّف على الزاوية' },
            prompt: { fr: 'Quelle sorte d\'angle vois-tu ?', ar: 'أي نوع من الزوايا ترى؟' },
            correct: S.correct, retry: S.tryAgain,
            mode: 'identify', angle: 40
        },
        {
            type: 'column',
            title: { fr: 'Multiplication posée : 23 × 4', ar: 'ضرب عمودي: 23 × 4' },
            prompt: { fr: 'Observe la disposition en colonnes.', ar: 'لاحظ الترتيب العمودي.' },
            correct: S.correct,
            op: 'mul', a: 23, b: 4
        },
        {
            type: 'column',
            title: { fr: 'Division posée : 47 ÷ 5', ar: 'قسمة عمودية: 47 ÷ 5' },
            prompt: { fr: 'Trouve le quotient et le reste.', ar: 'جد الخارج والباقي.' },
            correct: S.correct,
            op: 'div', a: 47, b: 5
        },
        {
            type: 'chart',
            title: { fr: 'Lis le diagramme', ar: 'اقرأ المخطط' },
            prompt: { fr: 'Quel jour a le plus de livres lus ?', ar: 'أي يوم فيه أكثر كتب مقروءة؟' },
            correct: S.correct, retry: S.tryAgain,
            mode: 'read',
            labels: [
                { fr: 'Lundi', ar: 'الاثنين' },
                { fr: 'Mardi', ar: 'الثلاثاء' },
                { fr: 'Mercredi', ar: 'الأربعاء' },
                { fr: 'Jeudi', ar: 'الخميس' }
            ],
            values: [4, 7, 2, 6],
            question: { answer: 1 }
        },
        {
            type: 'chart',
            title: { fr: 'Calcule la moyenne', ar: 'احسب المتوسط' },
            prompt: { fr: 'Quelle est la moyenne des points ?', ar: 'ما متوسط النقاط؟' },
            correct: S.correct, retry: S.tryAgain,
            mode: 'mean',
            labels: [
                { fr: 'Ana', ar: 'آنا' },
                { fr: 'Ben', ar: 'بن' },
                { fr: 'Chloé', ar: 'كلوي' }
            ],
            values: [4, 6, 8],
            target: 6
        },
        {
            type: 'measure',
            title: { fr: 'Mesure 6 cm', ar: 'قِس 6 سم' },
            prompt: { fr: 'Glisse la poignée pour mesurer 6 cm.', ar: 'اسحب المقبض لقياس 6 سم.' },
            correct: S.correct,
            target: 6, maxCm: 10
        },
        {
            type: 'pattern',
            title: { fr: 'Continue la suite', ar: 'أكمل المتتالية' },
            prompt: { fr: 'Quel nombre vient ensuite ?', ar: 'ما العدد التالي؟' },
            correct: S.correct, retry: S.tryAgain,
            start: 3, step: 2, length: 6, missing: 5
        }
    ];

    // Apply the right streak wording per language at render time.
    function localizeGameSpecs() {
        const lang = (typeof I18N !== 'undefined' && I18N.currentLanguage) || 'fr';
        games.forEach(g => {
            if (g.streakLabel && typeof g.streakLabel === 'object') {
                g.streakLabel = S.streakLabel[lang];
            }
        });
    }

    const SECTIONS = [
        { sel: '#sec-manip', items: manipulatives },
        { sel: '#sec-compare', items: compare },
        { sel: '#sec-geometry', items: geometry },
        { sel: '#sec-explain', items: explainers },
        { sel: '#sec-games', items: games },
        { sel: '#sec-extended', items: extended }
    ];

    let mounted = [];

    function renderAll() {
        localizeGameSpecs();
        mounted = [];
        SECTIONS.forEach(section => {
            const host = document.querySelector(section.sel);
            if (!host) return;
            mounted = mounted.concat(renderActivities(section.items, host));
        });
    }

    function mount() {
        renderAll();

        const langBtn = document.getElementById('lang-btn');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                if (typeof I18N === 'undefined') return;
                const next = I18N.currentLanguage === 'ar' ? 'fr' : 'ar';
                if (I18N.setLanguage) I18N.setLanguage(next);
                window.location.reload();
            });
        }

        const dirBtn = document.getElementById('dir-btn');
        if (dirBtn) {
            dirBtn.addEventListener('click', () => {
                const root = document.documentElement;
                const next = root.dir === 'rtl' ? 'ltr' : 'rtl';
                root.dir = next;
                root.lang = next === 'rtl' ? 'ar' : 'fr';
            });
        }

        const resetBtn = document.getElementById('reset-all');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                mounted.forEach(api => api && api.reset && api.reset());
            });
        }

        if (typeof applyI18n === 'function') applyI18n();
    }

    return { mount, renderAll };
})();
