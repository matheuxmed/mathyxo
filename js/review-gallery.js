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

    // ---- auto-test solver ----
    // Drives each mounted widget to a CORRECT answer using its spec, so the
    // reviewer can confirm at a glance that every prototype grades properly.
    // Returns true when the widget was driven; the badge then shows the result.
    function solveActivity(card) {
        const api = mounted.find(a => a && a._card === card);
        const spec = api && api._validatorSpec;
        if (!spec) return false;
        const q = sel => card.querySelectorAll(sel);
        const vis = el => el && el.offsetParent !== null;
        const clickAll = nodes => { nodes.forEach(n => n.click()); return true; };
        const type = spec.type;

        if (type === 'count-tap') return clickAll(q('.count-token'));
        if (type === 'tenframe') {
            // Fill exactly `target` slots.
            const slots = Array.from(q('.tenframe .slot'));
            for (let i = 0; i < (spec.target || 0) && i < slots.length; i++) slots[i].click();
            return true;
        }
        if (type === 'number-line') {
            // Chips fill the first empty slot, so place them in slot order.
            const slots = Array.from(q('.numline-slot'));
            const pool = card.querySelector('.numline-pool');
            if (!pool) return false;
            slots.forEach(slot => {
                const want = slot.dataset.answer;
                const chip = pool.querySelector('[data-value="' + want + '"]:not(.used)');
                if (chip) chip.click();
            });
            return true;
        }
        if (type === 'matching') {
            // Tap left then its matching right by data-pair.
            const lefts = Array.from(q('.match-col'))[0];
            const rights = Array.from(q('.match-col'))[1];
            if (!lefts || !rights) return false;
            const leftItems = Array.from(lefts.querySelectorAll('.match-item'));
            leftItems.forEach(l => {
                const idx = l.dataset.pair;
                const r = rights.querySelector('[data-pair="' + idx + '"]');
                if (r) { l.click(); r.click(); }
            });
            return true;
        }
        if (type === 'sort') {
            // Place each item into the bucket its spec says.
            const pool = card.querySelector('.sort-pool');
            if (!pool) return false;
            Array.from(spec.items).forEach((item, i) => {
                const node = pool.querySelector('[data-item="' + i + '"]');
                const bucket = card.querySelector('[data-bucket="' + item.bucket + '"]');
                if (node && bucket) { node.click(); bucket.click(); }
            });
            return true;
        }
        if (type === 'shapes') {
            const cards = Array.from(q('.shape-card'));
            // Prefer the published answer key (review mode); fall back to spec.
            let want = spec.target;
            try { const k = JSON.parse(card.querySelector('.activity-stage').dataset.key || '{}'); if (k.target) want = k.target; } catch (e) { /* ignore */ }
            const target = cards.find(c => c.dataset.shape === want);
            if (target) target.click();
            return !!target;
        }
        if (type === 'fraction') {
            const parts = Array.from(q('.frac-part'));
            const want = spec.mode === 'read' ? (spec.shaded || spec.target) : spec.target;
            if (spec.shape === 'pie' && spec.mode === 'read') {
                // read mode: choose the option that states the right fraction
                const opts = Array.from(q('.frac-choices .act-btn, .frac-choice'));
                const o = opts.find(b => b.textContent.includes(String(want))) || opts[0];
                if (o) o.click(); return !!o;
            }
            for (let i = 0; i < want && i < parts.length; i++) parts[i].click();
            return true;
        }
        if (type === 'place-value') {
            if (spec.mode === 'compare') {
                const a = String(spec.a).replace(',', '.'), b = String(spec.b).replace(',', '.');
                const want = Number(a) > Number(b) ? '>' : Number(a) < Number(b) ? '<' : '=';
                const opts = Array.from(q('.pv-choices .act-btn'));
                const o = opts.find(x => x.textContent.trim() === want);
                if (o) o.click(); return !!o;
            }
            const digits = String(spec.number).replace(',', '').split('');
            const inputs = Array.from(q('.pv-input'));
            inputs.forEach((cell, i) => {
                const goal = digits[i];
                for (let k = 0; k < 15 && cell.textContent.trim() !== goal; k++) cell.click();
            });
            return true;
        }
        if (type === 'angle') {
            if (spec.mode === 'identify') {
                const deg = spec.angle || 90;
                const want = deg === 90 ? /droit|قائمة/ : deg < 90 ? /aigu|حادة/ : /obtus|منفرجة/;
                const opts = Array.from(q('.angle-choices .act-btn'));
                const o = opts.find(b => want.test(b.textContent));
                if (o) o.click(); return !!o;
            }
            // make mode: drag on the SVG to the target angle.
            const svg = card.querySelector('.angle-svg');
            if (!svg) return false;
            const target = spec.target || 90;
            const rect = svg.getBoundingClientRect();
            const scale = 260 / rect.width;
            // Invert setFromPoint. In viewBox coords the vertex is (cx=40, cy=140)
            // and setFromPoint derives the angle from (vx+20-40, -(vy+20-140)),
            // so the point to send is cx-20 + cos*armLen, cy-20 - sin*armLen.
            const armLen = 170;
            const rad = target * Math.PI / 180;
            const vx = 20 + Math.cos(rad) * armLen;
            const vy = 120 - Math.sin(rad) * armLen;
            const clientX = rect.left + (vx + 20) / scale;
            const clientY = rect.top + (vy + 20) / scale;
            const fire = (el, typeName) => el.dispatchEvent(new MouseEvent(typeName, {
                bubbles: true, cancelable: true, clientX, clientY
            }));
            fire(svg, 'mousedown');
            fire(document, 'mousemove');
            fire(document, 'mouseup');
            return true;
        }
        if (type === 'column') { const v = q('.colboard-actions .act-btn')[0]; if (v) v.click(); return !!v; }
        if (type === 'chart') {
            const opts = Array.from(q('.chart-choices .act-btn, .chart-choice'));
            let want = spec.target;
            if (spec.mode === 'read' && spec.question && spec.question.answer != null) {
                // the answer index points at the label
                const idx = spec.question.answer;
                const o = opts[idx] || opts[0];
                if (o) { o.click(); return true; }
            }
            const o = opts.find(b => Number(b.textContent.trim()) === Number(want)) || opts[0];
            if (o) o.click(); return !!o;
        }
        if (type === 'measure') {
            // Drag the handle to spec.target. Simulate by dispatching pointer events.
            const handle = card.querySelector('.ruler-handle');
            const ruler = card.querySelector('.ruler');
            if (!handle || !ruler) return false;
            const rect = ruler.getBoundingClientRect();
            const x = rect.left + (spec.target * 34);
            const y = rect.top + rect.height / 2;
            const fire = (el, typeName, cx, cy) => el.dispatchEvent(new MouseEvent(typeName, {
                bubbles: true, cancelable: true, clientX: cx, clientY: cy
            }));
            fire(handle, 'mousedown', x, y);
            fire(document, 'mousemove', x, y);
            fire(document, 'mouseup', x, y);
            return true;
        }
        if (type === 'pattern') {
            const opts = Array.from(q('.pattern-choices .act-btn, .pattern-choice'));
            const slot = card.querySelector('.pattern-slot');
            const want = slot ? slot.dataset.answer : null;
            const o = (want != null && opts.find(b => b.dataset.value === want)) || opts[0];
            if (o) { o.click(); return true; }
            return false;
        }
        if (type === 'symmetry') {
            // Paint MIRROR_GOAL cells on the left half; the mirror follows and
            // the widget grades itself once enough cells are lit. Use pointer
            // events because the pads listen for pointerdown.
            const grid = card.querySelector('.sym-grid');
            if (!grid) return false;
            const size = spec.size || 8;
            const need = spec.goal || 3;
            const fire = (el, typeName) => el.dispatchEvent(new PointerEvent(typeName, {
                bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse'
            }));
            let painted = 0;
            for (let r = 0; r < size && painted < need; r++) {
                for (let c = 0; c < Math.floor(size / 2) && painted < need; c++) {
                    const cell = grid.children[r * size + c];
                    if (!cell) continue;
                    fire(cell, 'pointerdown');
                    fire(cell, 'pointerup');
                    painted++;
                }
            }
            return painted > 0;
        }
        if (type === 'quiz') {
            // Answer the *current* question correctly. The option carries
            // data-correct when it is the answer; fall back to the spec key.
            const opts = Array.from(q('.quiz-option')).filter(vis);
            if (!opts.length) return false;
            const marked = opts.find(o => o.dataset.correct);
            if (marked && !marked.disabled) { marked.click(); return true; }
            const counter = card.querySelector('.quiz-head span');
            const idx = counter ? Math.max(0, parseInt(counter.textContent, 10) - 1) : 0;
            const qspec = (spec.questions || [])[Math.min(idx, (spec.questions || []).length - 1)];
            const o = qspec && qspec.answer != null ? opts[qspec.answer] : opts[0];
            if (o && !o.disabled) { o.click(); return true; }
            return false;
        }
        if (type === 'tables') {
            // The pad asks `a × b`; click the matching product.
            const qt = card.querySelector('.table-question');
            const opts = Array.from(q('.table-pad button')).filter(vis);
            if (!opts.length) return false;
            let want = null;
            const m = qt && qt.textContent.match(/(\d+)\s*×\s*(\d+)/);
            if (m) want = Number(m[1]) * Number(m[2]);
            const o = (want != null && opts.find(x => Number(x.textContent.replace(/[^0-9]/g, '')) === want)) || opts[0];
            o.click();
            return true;
        }
        if (type === 'explainer') {
            // Step through every slide until the finish.
            const next = Array.from(q('button')).find(b => /Suivant ›/.test(b.textContent) && vis(b) && !b.disabled);
            if (next) { next.click(); return true; }
            return false;
        }
        return false;
    }

    let mounted = [];

    // Review mode wraps each activity's mastery callbacks so its badge lights
    // up when the activity actually grades a correct or wrong answer. This is
    // how a reviewer confirms the widget reports to the lesson engine.
    const VALIDATE_OPTS = { validate: true };

    // Widget kinds that are teaching or open-exploration only: they never call
    // onComplete, so a red badge would be misleading. The tester labels them
    // "teaching" instead of "failed".
    function isNonGraded(spec) {
        if (!spec) return false;
        if (spec.type === 'explainer') return true;
        // An explore-style shapes pad (no target to find) has nothing to grade.
        if (spec.type === 'shapes' && !spec.target) return true;
        return false;
    }

    function renderAll() {
        localizeGameSpecs();
        mounted = [];
        SECTIONS.forEach(section => {
            const host = document.querySelector(section.sel);
            if (!host) return;
            mounted = mounted.concat(renderActivities(section.items, host, VALIDATE_OPTS));
        });
        paintSummary();
    }

    // Update the toolbar tally of tested / validated / teaching widgets.
    function paintSummary() {
        const out = document.getElementById('validate-summary');
        if (!out) return;
        let total = 0, passed = 0, failed = 0, teaching = 0;
        mounted.forEach(api => {
            const v = api && api._validator;
            if (!v) return;
            total++;
            if (v.completed) passed++;
            if (v.wrong) failed++;
            if (isNonGraded(api._validatorSpec)) teaching++;
        });
        const graded = total - teaching;
        out.textContent = '✓ ' + passed + ' / ' + graded + '  ·  ✗ ' + failed +
            (teaching ? '  ·  ◐ ' + teaching : '');
        out.className = 'validate-summary' + (passed === graded && graded ? ' all' : '');
    }

    function mount() {
        renderAll();

        // Repaint the tally after any interaction so the counts stay live as the
        // reviewer plays each widget.
        document.addEventListener('click', () => paintSummary());

        // ---- one-click self-test ----
        // Walks every widget to a correct answer (so onComplete should fire) and
        // reports any that never turn green, which means the widget is not
        // honouring the mastery contract.
        const testBtn = document.getElementById('test-all');
        if (testBtn) {
            testBtn.addEventListener('click', async () => {
                testBtn.disabled = true;
                const original = testBtn.textContent;
                const cards = Array.from(document.querySelectorAll('.activity'));
                // Reset every badge first.
                mounted.forEach(api => {
                    const v = api && api._validator;
                    if (!v) return;
                    v.completed = 0; v.wrong = 0;
                    v.badge.className = 'activity-validate-badge idle';
                    v.badge.textContent = '● ' + pick({ fr: 'à tester', ar: 'للتجربة' });
                });
                const failures = [];
                for (let i = 0; i < cards.length; i++) {
                    const card = cards[i];
                    const api = mounted.find(a => a && a._card === card);
                    const spec = api && api._validatorSpec;
                    const type = (card.querySelector('.activity-kind') || {}).textContent || '?';
                    testBtn.textContent = '⏳ ' + (i + 1) + '/' + cards.length + '…';

                    // Teaching / open-exploration widgets are not expected to
                    // signal mastery; mark them and move on.
                    if (isNonGraded(spec)) {
                        const v = api && api._validator;
                        if (v) {
                            v.badge.className = 'activity-validate-badge teaching';
                            v.badge.textContent = '◐ ' + pick({ fr: 'enseignement', ar: 'تعليمي' });
                        }
                        paintSummary();
                        continue;
                    }

                    const slow = type === 'quiz' || type === 'tables';
                    const stepMs = slow ? 850 : 80;
                    let lastSig = '';
                    let stalls = 0;
                    for (let pass = 0; pass < 30; pass++) {
                        const v = (mounted.find(a => a && a._card === card) || {})._validator;
                        if (v && v.completed) break;           // passed — done
                        try { solveActivity(card); } catch (e) { break; }
                        await new Promise(r => setTimeout(r, stepMs));
                        // Use a DOM signature to detect progress, because some
                        // widgets only fire their callback on the final step.
                        const sig = (card.querySelector('.activity-stage') || card).innerHTML.length +
                            '|' + (card.querySelector('.act-feedback') || {}).textContent +
                            '|' + ((card.querySelector('.quiz-head span') || {}).textContent || '');
                        if (sig === lastSig) { stalls++; if (stalls >= 2) break; }
                        else stalls = 0;
                        lastSig = sig;
                    }
                    const b = card.querySelector('.activity-validate-badge');
                    if (!b || !/pass/.test(b.className)) failures.push(type);
                    paintSummary();
                }
                testBtn.disabled = false;
                testBtn.textContent = failures.length
                    ? '⚠ ' + failures.length + ' à revoir'
                    : '✓ ' + pick({ fr: 'tous validés', ar: 'الكل صحيح' });
                setTimeout(() => { testBtn.textContent = original; }, 2600);
            });
        }

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
                mounted.forEach(api => {
                    if (!api) return;
                    if (api.reset) api.reset();
                    const v = api._validator;
                    if (v) {
                        v.completed = 0; v.wrong = 0;
                        v.badge.className = 'activity-validate-badge idle';
                        v.badge.textContent = '● ' + pick({ fr: 'à tester', ar: 'للتجربة' });
                        v.count.textContent = '';
                    }
                });
                paintSummary();
            });
        }

        if (typeof applyI18n === 'function') applyI18n();
    }

    return { mount, renderAll };
})();
