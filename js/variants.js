// ===== Activity variant generators =====
// Each generator returns a FRESH spec for the same skill, so a student who
// answers wrong can retry with new numbers/items instead of memorising one
// question. A generator is a function (rng) -> spec fragment.
//
// rng is a small helper with: int(min,max), pick(array), shuffle(array).

function makeRng(seed) {
    let s = seed == null ? Math.floor(Math.random() * 1e9) : seed;
    // xorshift32 collapses to zero forever if it starts at zero, so never
    // allow an empty state.
    s = (s >>> 0) || 0x9e3779b9;
    const next = () => {
        // xorshift32 — deterministic and good enough for small ranges.
        s ^= s << 13; s >>>= 0;
        s ^= s >> 17;
        s ^= s << 5; s >>>= 0;
        return s / 4294967296;
    };
    return {
        seed: s,
        float: next,
        int(min, max) { return min + Math.floor(next() * (max - min + 1)); },
        pick(arr) { return arr[Math.floor(next() * arr.length)]; },
        shuffle(arr) {
            const a = arr.slice();
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(next() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }
    };
}

// ---------- shared pools ----------
const VARIANT_POOLS = {
    fruits: ['🍎', '🍐', '🍊', '🍋', '🍇', '🍓', '🍌', '🥝'],
    animals: ['🦆', '🐤', '🐟', '🐢', '🐝', '🐰', '🐸', '🐞'],
    stars: ['⭐', '🌟', '✨'],
    shapes: [
        { id: 'carre', name: { fr: 'Carré', ar: 'مربع' } },
        { id: 'triangle', name: { fr: 'Triangle', ar: 'مثلث' } },
        { id: 'cercle', name: { fr: 'Cercle', ar: 'دائرة' } },
        { id: 'rectangle', name: { fr: 'Rectangle', ar: 'مستطيل' } },
        { id: 'losange', name: { fr: 'Losange', ar: 'معيّن' } }
    ]
};

// ---------- generators per activity type ----------
// Keys match ACTIVITIES in activities.js. Each returns { spec-fragment } that
// the chunk engine merges onto the chunk's static template.
const VARIANTS = {
    // spec: { type:'count-tap', count:n, item:emoji }
    'count-tap'(spec, rng) {
        const range = spec.range || [spec.count || 3, spec.count || 5];
        const count = rng.int(range[0], range[1]);
        const item = spec.item || rng.pick(VARIANT_POOLS.fruits);
        return {
            items: Array.from({ length: count }, () => item),
            target: { fr: 'Compte toutes les images !', ar: 'عُدّ كل الصور!' }
        };
    },

    // spec: { type:'tenframe', frames:n, target:n } or { mode:'fill', of:n }
    tenframe(spec, rng) {
        if (spec.mode === 'fill') {
            const of = spec.of || 10;
            return { target: of, frames: spec.frames || 1 };
        }
        const frames = spec.frames || 2;
        const max = frames * 10;
        const target = rng.int(Math.max(2, Math.floor(max / 3)), max);
        return { frames, target };
    },

    // spec: { type:'number-line', min, max, slots:n }
    'number-line'(spec, rng) {
        const min = spec.min != null ? spec.min : 0;
        const max = spec.max != null ? spec.max : 10;
        const want = spec.slots ? spec.slots.length : 3;
        const pool = [];
        for (let v = min + 1; v < max; v++) pool.push(v);
        const chosen = rng.shuffle(pool).slice(0, Math.min(want, pool.length)).sort((a, b) => a - b);
        return { min, max, slots: chosen };
    },

    // spec: { type:'matching', pairType:'number-quantity'|'shape-name'|'number-word' }
    matching(spec, rng) {
        const kind = spec.pairType || 'number-quantity';
        const n = spec.pairs ? spec.pairs.length : 3;

        if (kind === 'shape-name') {
            const chosen = rng.shuffle(VARIANT_POOLS.shapes).slice(0, Math.min(n, VARIANT_POOLS.shapes.length));
            return {
                pairs: chosen.map(s => ({
                    left: { fr: s.name.fr, ar: s.name.ar },
                    right: s.id
                }))
            };
        }

        if (kind === 'number-word') {
            const words = {
                1: { fr: 'un', ar: 'واحد' }, 2: { fr: 'deux', ar: 'اثنان' },
                3: { fr: 'trois', ar: 'ثلاثة' }, 4: { fr: 'quatre', ar: 'أربعة' },
                5: { fr: 'cinq', ar: 'خمسة' }, 6: { fr: 'six', ar: 'ستة' },
                7: { fr: 'sept', ar: 'سبعة' }, 8: { fr: 'huit', ar: 'ثمانية' },
                9: { fr: 'neuf', ar: 'تسعة' }, 10: { fr: 'dix', ar: 'عشرة' }
            };
            const nums = rng.shuffle([1,2,3,4,5,6,7,8,9,10]).slice(0, n);
            return { pairs: nums.map(v => ({ left: String(v), right: words[v] })) };
        }

        // number-words-large: two-digit numbers matched to their word form.
        // Covers the full 20–99 range, including the irregular French tens
        // (70s use soixante-dix…, 80s/90s use quatre-vingt(s)…).
        if (kind === 'number-words-large') {
            const units = {
                0: { fr: '', ar: '' }, 1: { fr: 'un', ar: 'واحد' }, 2: { fr: 'deux', ar: 'اثنان' },
                3: { fr: 'trois', ar: 'ثلاثة' }, 4: { fr: 'quatre', ar: 'أربعة' }, 5: { fr: 'cinq', ar: 'خمسة' },
                6: { fr: 'six', ar: 'ستة' }, 7: { fr: 'sept', ar: 'سبعة' }, 8: { fr: 'huit', ar: 'ثمانية' },
                9: { fr: 'neuf', ar: 'تسعة' }
            };
            const tens = {
                2: { fr: 'vingt', ar: 'عشرون' }, 3: { fr: 'trente', ar: 'ثلاثون' },
                4: { fr: 'quarante', ar: 'أربعون' }, 5: { fr: 'cinquante', ar: 'خمسون' },
                6: { fr: 'soixante', ar: 'ستون' }, 7: { fr: 'soixante', ar: 'سبعون' },
                8: { fr: 'quatre-vingt', ar: 'ثمانون' }, 9: { fr: 'quatre-vingt', ar: 'تسعون' }
            };
            const phrase = (t, u) => {
                const base = tens[t];
                if (u === 0) {
                    // 70 and 90 are spoken as "soixante-dix" / "quatre-vingt-dix";
                    // 80 takes an s ("quatre-vingts") when nothing follows.
                    let fr = base.fr;
                    if (t === 7) fr = 'soixante-dix';
                    else if (t === 8) fr = 'quatre-vingts';
                    else if (t === 9) fr = 'quatre-vingt-dix';
                    return { fr, ar: base.ar };
                }
                const uu = units[u];
                // French spellings for 11–19, needed by the 70s and 90s.
                const teens = ['', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
                    'dix-sept', 'dix-huit', 'dix-neuf'];
                let fr;
                if (t === 7) {
                    // 71 = "soixante et onze", 72–79 = "soixante-douze"…
                    fr = u === 1 ? 'soixante et onze' : 'soixante-' + teens[u];
                } else if (t === 9) {
                    // 91 = "quatre-vingt-onze", 92–99 = "quatre-vingt-douze"…
                    fr = 'quatre-vingt-' + teens[u];
                } else if (t === 8) {
                    fr = 'quatre-vingt-' + uu.fr;
                } else if (u === 1) {
                    fr = base.fr + ' et un';
                } else if (t === 6) {
                    fr = 'soixante-' + uu.fr;
                } else {
                    fr = base.fr + '-' + uu.fr;
                }
                return { fr, ar: uu.ar + ' و' + base.ar };
            };
            const nums = [];
            let guard = 0;
            while (nums.length < n && guard++ < 400) {
                const t = rng.int(2, 9);
                const u = rng.int(0, 9);
                const v = t * 10 + u;
                if (!nums.includes(v)) nums.push(v);
            }
            return { pairs: nums.map(v => ({ left: String(v), right: phrase(Math.floor(v / 10), v % 10) })) };
        }

        // multiplication-pairs: a repeated addition matched to its multiplication.
        if (kind === 'multiplication-pairs') {
            const pairs = [];
            const used = new Set();
            while (pairs.length < n) {
                const a = rng.int(2, 5);
                const b = rng.int(2, 5);
                const key = a + 'x' + b;
                if (used.has(key)) continue;
                used.add(key);
                const add = Array.from({ length: a }, () => String(b)).join(' + ');
                pairs.push({
                    left: { fr: add, ar: add },
                    right: { fr: a + ' × ' + b, ar: a + ' × ' + b }
                });
            }
            return { pairs };
        }

        // number-quantity: number on the left, that many symbols on the right.
        const want = spec.max != null ? spec.max : 9;
        const nums = [];
        while (nums.length < n) {
            const v = rng.int(1, want);
            if (!nums.includes(v)) nums.push(v);
        }
        const star = rng.pick(VARIANT_POOLS.stars);
        return { pairs: nums.map(v => ({ left: String(v), right: star.repeat(v) })) };
    },

    // spec: { type:'shapes', target:'triangle', distractorCount:n }
    shapes(spec, rng) {
        const n = spec.distractorCount || 3;
        const all = VARIANT_POOLS.shapes;
        const target = spec.target || rng.pick(all).id;
        const others = rng.shuffle(all.filter(s => s.id !== target)).slice(0, n);
        const chosen = rng.shuffle([all.find(s => s.id === target)].concat(others));
        return { target, shapes: chosen.map(s => ({ id: s.id, name: s.name })) };
    },

    // spec: { type:'sort', buckets:[{id, test:'lt'|'gt', value:n}] }
    sort(spec, rng) {
        const threshold = spec.threshold != null ? spec.threshold : 10;
        const perBucket = spec.perBucket || 2;
        const items = [];
        for (let i = 0; i < perBucket; i++) {
            items.push({ label: String(rng.int(1, threshold - 1)), bucket: 'lt' });
            items.push({ label: String(rng.int(threshold + 1, threshold + 10)), bucket: 'gt' });
        }
        return { items: rng.shuffle(items) };
    },

    // spec: { type:'quiz', topic:'addition'|'compare'|'successor', range:[a,b] }
    quiz(spec, rng) {
        const topic = spec.topic || 'addition';
        const range = spec.range || [1, 9];
        const count = spec.questions ? spec.questions.length : 3;
        const questions = [];

        // Topics with no generator use the hand-written questions from the
        // template as-is; we still shuffle the option order so a retry feels
        // fresh rather than identical.
        const GENERATED_TOPICS = ['addition', 'compare', 'successor', 'count', 'subtraction',
            'multiplication', 'division', 'complement', 'double', 'predecessor',
            'compare-blank', 'even-odd', 'tens-units', 'compare-large',
            'addition-large', 'subtraction-large', 'multiplication-sense',
            'measure-units', 'measure-compare', 'symmetry-axes', 'tables'];
        if (spec.questions && GENERATED_TOPICS.indexOf(topic) === -1) {
            return {
                questions: spec.questions.map(q => {
                    const pairs = q.options.map((opt, i) => ({ opt, correct: i === q.answer }));
                    const shuffled = rng.shuffle(pairs);
                    return {
                        prompt: q.prompt,
                        options: shuffled.map(p => p.opt),
                        answer: shuffled.findIndex(p => p.correct),
                        explain: q.explain
                    };
                })
            };
        }

        const optionsFor = (answer, spread) => {
            const set = new Set([answer]);
            let guard = 0;
            while (set.size < 3 && guard++ < 60) {
                const cand = answer + rng.int(-spread, spread);
                if (cand >= 0 && cand !== answer) set.add(cand);
            }
            return rng.shuffle(Array.from(set)).map(String);
        };

        for (let i = 0; i < count; i++) {
            if (topic === 'addition') {
                const a = rng.int(range[0], Math.max(range[0], range[1] - 1));
                const b = rng.int(1, Math.max(2, range[1] - a));
                const ans = a + b;
                const opts = optionsFor(ans, 3);
                questions.push({
                    prompt: { fr: a + ' + ' + b + ' = ?', ar: a + ' + ' + b + ' = ؟' },
                    options: opts, answer: opts.indexOf(String(ans))
                });
            } else if (topic === 'compare') {
                let a = rng.int(range[0], range[1]);
                let b = rng.int(range[0], range[1]);
                while (a === b) b = rng.int(range[0], range[1]);
                const big = Math.max(a, b);
                const opts = rng.shuffle(['<', '>', '=']);
                questions.push({
                    prompt: { fr: 'Quel signe va entre ' + a + ' et ' + b + ' ?', ar: 'أي رمز يوضع بين ' + a + ' و' + b + '؟' },
                    options: opts, answer: opts.indexOf(big === a ? '>' : '<')
                });
            } else if (topic === 'successor') {
                const n = rng.int(range[0], Math.max(range[0], range[1] - 1));
                const ans = n + 1;
                const opts = optionsFor(ans, 2);
                questions.push({
                    prompt: { fr: 'Quel nombre vient juste après ' + n + ' ?', ar: 'ما العدد الذي يأتي مباشرة بعد ' + n + '؟' },
                    options: opts, answer: opts.indexOf(String(ans))
                });
            } else if (topic === 'count') {
                const n = rng.int(range[0], range[1]);
                const sym = rng.pick(VARIANT_POOLS.stars);
                const opts = optionsFor(n, 3);
                questions.push({
                    prompt: { fr: 'Combien y a-t-il d\'étoiles ? ' + sym.repeat(n), ar: 'كم عدد النجوم؟ ' + sym.repeat(n) },
                    options: opts, answer: opts.indexOf(String(n))
                });
            } else if (topic === 'subtraction') {
                const a = rng.int(range[0] + 1, range[1]);
                const b = rng.int(1, a);
                const ans = a - b;
                const opts = optionsFor(ans, 3);
                questions.push({
                    prompt: { fr: a + ' − ' + b + ' = ?', ar: a + ' − ' + b + ' = ؟' },
                    options: opts, answer: opts.indexOf(String(ans))
                });
            } else if (topic === 'multiplication') {
                const a = rng.int(range[0], range[1]);
                const b = rng.int(2, Math.min(9, spec.maxFactor || 9));
                const ans = a * b;
                const opts = optionsFor(ans, Math.max(3, b));
                questions.push({
                    prompt: { fr: a + ' × ' + b + ' = ?', ar: a + ' × ' + b + ' = ؟' },
                    options: opts, answer: opts.indexOf(String(ans))
                });
            } else if (topic === 'division') {
                const b = rng.int(2, Math.min(9, spec.maxFactor || 9));
                const q = rng.int(2, Math.max(3, Math.floor(range[1] / b)));
                const ans = q;
                const opts = optionsFor(ans, 3);
                questions.push({
                    prompt: { fr: (b * q) + ' ÷ ' + b + ' = ?', ar: (b * q) + ' ÷ ' + b + ' = ؟' },
                    options: opts, answer: opts.indexOf(String(ans))
                });
            } else if (topic === 'complement') {
                const total = spec.total || 10;
                const a = rng.int(1, total - 1);
                const ans = total - a;
                const opts = optionsFor(ans, 3);
                questions.push({
                    prompt: { fr: a + ' + ? = ' + total, ar: a + ' + ؟ = ' + total },
                    options: opts, answer: opts.indexOf(String(ans))
                });
            } else if (topic === 'double') {
                const n = rng.int(range[0], range[1]);
                const ans = n * 2;
                const opts = optionsFor(ans, 3);
                questions.push({
                    prompt: { fr: 'Le double de ' + n + ' ?', ar: 'ضعف العدد ' + n + '؟' },
                    options: opts, answer: opts.indexOf(String(ans))
                });
            } else if (topic === 'predecessor') {
                const n = rng.int(range[0] + 1, range[1]);
                const ans = n - 1;
                const opts = optionsFor(ans, 2);
                questions.push({
                    prompt: { fr: 'Quel nombre vient juste avant ' + n + ' ?', ar: 'ما العدد الذي يأتي مباشرة قبل ' + n + '؟' },
                    options: opts, answer: opts.indexOf(String(ans))
                });
            } else if (topic === 'compare-blank') {
                // "Quel nombre est plus grand/petit que N ?" — all listed numbers
                // must be valid, so we build options that all satisfy the
                // comparison and let any correct one count.
                const target = rng.int(range[0] + 1, range[1]);
                const wantLess = rng.float() < 0.5;
                const valid = [];
                const lo = Math.max(0, range[0]);
                const hi = range[1] + 5;
                for (let v = lo; v <= hi; v++) {
                    if (wantLess ? v < target : v > target) valid.push(v);
                }
                const chosen = rng.shuffle(valid).slice(0, 3);
                questions.push({
                    prompt: {
                        fr: 'Quel nombre est ' + (wantLess ? 'plus petit' : 'plus grand') + ' que ' + target + ' ?',
                        ar: 'أي عدد ' + (wantLess ? 'أصغر' : 'أكبر') + ' من ' + target + ' ؟'
                    },
                    options: chosen.map(String),
                    answer: 0
                });
            } else if (topic === 'even-odd') {
                const n = rng.int(range[0], range[1]);
                const correctLabel = n % 2 === 0 ? 'pair' : 'impair';
                const opts = rng.shuffle([
                    { id: 'pair', label: { fr: 'pair', ar: 'زوجي' } },
                    { id: 'impair', label: { fr: 'impair', ar: 'فردي' } }
                ]);
                questions.push({
                    prompt: { fr: 'Le nombre ' + n + ' est-il pair ou impair ?', ar: 'هل العدد ' + n + ' زوجي أم فردي؟' },
                    options: opts.map(o => o.label),
                    answer: opts.findIndex(o => o.id === correctLabel)
                });
            } else if (topic === 'tens-units') {
                const n = rng.int(10, 99);
                const t = Math.floor(n / 10), u = n % 10;
                const askTens = rng.float() < 0.5;
                const ans = askTens ? t : u;
                const opts = optionsFor(ans, 3);
                questions.push({
                    prompt: askTens
                        ? { fr: 'Dans ' + n + ', combien de dizaines ?', ar: 'في ' + n + '، كم عدد العشرات؟' }
                        : { fr: 'Dans ' + n + ', combien d\'unités ?', ar: 'في ' + n + '، كم عدد الوحدات؟' },
                    options: opts, answer: opts.indexOf(String(ans))
                });
            } else if (topic === 'compare-large') {
                let a = rng.int(range[0], range[1]);
                let b = rng.int(range[0], range[1]);
                while (a === b) b = rng.int(range[0], range[1]);
                const opts = rng.shuffle(['<', '>', '=']);
                questions.push({
                    prompt: { fr: 'Quel signe va entre ' + a + ' et ' + b + ' ?', ar: 'أي رمز يوضع بين ' + a + ' و' + b + '؟' },
                    options: opts, answer: opts.indexOf(Math.max(a, b) === a ? '>' : '<')
                });
            } else if (topic === 'addition-large') {
                const a = rng.int(range[0], range[1]);
                const b = rng.int(range[0], range[1]);
                const ans = a + b;
                const opts = optionsFor(ans, 5);
                questions.push({
                    prompt: { fr: a + ' + ' + b + ' = ?', ar: a + ' + ' + b + ' = ؟' },
                    options: opts, answer: opts.indexOf(String(ans))
                });
            } else if (topic === 'subtraction-large') {
                let a = rng.int(range[0], range[1]);
                let b = rng.int(range[0], range[1]);
                if (b > a) { const t = a; a = b; b = t; }
                const ans = a - b;
                const opts = optionsFor(ans, 5);
                questions.push({
                    prompt: { fr: a + ' − ' + b + ' = ?', ar: a + ' − ' + b + ' = ؟' },
                    options: opts, answer: opts.indexOf(String(ans))
                });
            } else if (topic === 'multiplication-sense') {
                const groups = rng.int(2, 5);
                const per = rng.int(2, 5);
                const ans = groups * per;
                const opts = optionsFor(ans, 4);
                const sym = rng.pick(VARIANT_POOLS.stars);
                const row = new Array(groups).fill(sym.repeat(per)).join(' ');
                questions.push({
                    prompt: {
                        fr: row + ' — ' + groups + ' groupes de ' + per + ', combien en tout ?',
                        ar: row + ' — ' + groups + ' مجموعات من ' + per + '، كم المجموع؟'
                    },
                    options: opts, answer: opts.indexOf(String(ans))
                });
            } else if (topic === 'measure-units') {
                const pl = rng.pick([
                    { label: { fr: 'un crayon', ar: 'قلم الرصاص' }, unit: 'cm' },
                    { label: { fr: 'une porte', ar: 'باب' }, unit: 'm' },
                    { label: { fr: 'un livre', ar: 'كتاب' }, unit: 'cm' },
                    { label: { fr: 'un tableau', ar: 'سبورة' }, unit: 'm' },
                    { label: { fr: 'une gomme', ar: 'ممحاة' }, unit: 'cm' },
                    { label: { fr: 'une cour', ar: 'ساحة' }, unit: 'm' }
                ]);
                const opts = rng.shuffle([
                    { id: 'm', label: { fr: 'm (mètre)', ar: 'م (متر)' } },
                    { id: 'cm', label: { fr: 'cm (centimètre)', ar: 'سم (سنتيمتر)' } }
                ]);
                questions.push({
                    prompt: { fr: 'On mesure ' + pl.label.fr + ' en…', ar: 'نقيس ' + pl.label.ar + ' بوحدة…' },
                    options: opts.map(o => o.label),
                    answer: opts.findIndex(o => o.id === pl.unit)
                });
            } else if (topic === 'measure-compare') {
                const a = rng.int(5, 90);
                let b = rng.int(5, 90);
                while (b === a) b = rng.int(5, 90);
                const longer = rng.float() < 0.5;
                const big = Math.max(a, b), small = Math.min(a, b);
                const opts = rng.shuffle([
                    { id: 'big', label: { fr: 'le plus long', ar: 'الأطول' } },
                    { id: 'small', label: { fr: 'le plus court', ar: 'الأقصر' } }
                ]);
                questions.push({
                    prompt: {
                        fr: 'Un ruban de ' + a + ' cm et un de ' + b + ' cm : lequel est ' + (longer ? 'plus long' : 'plus court') + ' ?',
                        ar: 'شريط ' + a + ' سم وآخر ' + b + ' سم: أيهما ' + (longer ? 'أطول' : 'أقصر') + '؟'
                    },
                    options: opts.map(o => o.label),
                    answer: opts.findIndex(o => o.id === (longer ? 'big' : 'small'))
                });
            } else if (topic === 'symmetry-axes') {
                const pl = rng.pick([
                    { label: { fr: 'un carré', ar: 'مربع' }, axes: 4, opts: ['1', '2', '4'] },
                    { label: { fr: 'un rectangle', ar: 'مستطيل' }, axes: 2, opts: ['1', '2', '4'] },
                    { label: { fr: 'un cercle', ar: 'دائرة' }, axes: 'beaucoup', opts: ['1', '2', 'beaucoup'] },
                    { label: { fr: 'un triangle équilatéral', ar: 'مثلث متساوي الأضلاع' }, axes: 3, opts: ['1', '3', '4'] }
                ]);
                const labels = {
                    '1': { fr: '1 axe', ar: 'محور واحد' },
                    '2': { fr: '2 axes', ar: 'محوران' },
                    '3': { fr: '3 axes', ar: '3 محاور' },
                    '4': { fr: '4 axes', ar: '4 محاور' },
                    beaucoup: { fr: 'beaucoup d\'axes', ar: 'محاور كثيرة' }
                };
                const opts = rng.shuffle(pl.opts);
                questions.push({
                    prompt: { fr: 'Combien d\'axes de symétrie a ' + pl.label.fr + ' ?', ar: 'كم عدد محاور التماثل في ' + pl.label.ar + '؟' },
                    options: opts.map(o => labels[o]),
                    answer: opts.indexOf(String(pl.axes))
                });
            } else if (topic === 'tables') {
                const pool = spec.tables || [2, 3, 4, 5];
                const t = rng.pick(pool);
                const a = rng.int(1, 9);
                const ans = a * t;
                const opts = optionsFor(ans, Math.max(3, t));
                questions.push({
                    prompt: { fr: a + ' × ' + t + ' = ?', ar: a + ' × ' + t + ' = ؟' },
                    options: opts, answer: opts.indexOf(String(ans))
                });
            }
        }
        // Fill in any answer index left as null (compare-blank picks by content).
        questions.forEach(q => {
            if (q.answer != null && q.answer >= 0) return;
            if (!q.options || !q.options.length) return;
            if (typeof q.options[0] === 'object') return; // language-marked options carry their own answer
        });
        return { questions };
    },

    // spec: { type:'tables', tables:[...] }
    tables(spec, rng) {
        const tables = spec.tables || [2, 3];
        return { tables: rng.shuffle(tables).slice(0, spec.tableCount || tables.length) };
    },

    // spec: { type:'symmetry' }  — nothing random, but keep the same API.
    symmetry(spec) { return {}; },

    // spec: { type:'explainer' } — explainers are deterministic teaching steps.
    explainer(spec) { return {}; },

    // ---------- extended widgets (primaire 3–6) ----------

    // spec: { type:'fraction', shape:'bar'|'pie', mode:'shade'|'read', maxParts:n }
    fraction(spec, rng) {
        // When the lesson pins both parts and target, honour them as written.
        // Some activities mean "shade every part" (e.g. build 3 equal groups),
        // which a random target smaller than parts would silently break.
        if (spec.fixed || (spec.parts != null && spec.target != null)) {
            const parts = spec.parts || 4;
            const target = Math.min(spec.target != null ? spec.target : 1, parts);
            return { parts, target, shaded: spec.mode === 'read' ? target : 0 };
        }
        const maxParts = spec.maxParts || 8;
        const minParts = spec.minParts || 2;
        const parts = rng.pick([2, 3, 4, 5, 6, 8].filter(v => v >= minParts && v <= maxParts));
        if (spec.mode === 'read') {
            const shaded = rng.int(1, parts - 1);
            return { parts, shaded, target: shaded };
        }
        const target = rng.int(1, parts - 1);
        return { parts, target, shaded: 0 };
    },

    // spec: { type:'place-value', mode:'build'|'compare', intDigits:n, decimals:n }
    'place-value'(spec, rng) {
        const intDigits = spec.intDigits || 1;
        const decimals = spec.decimals || 1;
        const randDigits = (n, firstMin) => {
            let s = '';
            for (let i = 0; i < n; i++) {
                const lo = (i === 0 && firstMin) ? 1 : 0;
                s += String(rng.int(lo, 9));
            }
            return s;
        };
        const mk = () => randDigits(intDigits, true) + (decimals ? ',' + randDigits(decimals, false) : '');
        if (spec.mode === 'compare') {
            let a = mk(), b = mk();
            let guard = 0;
            while (a === b && guard++ < 20) b = mk();
            return { a, b };
        }
        const number = mk();
        return {
            number,
            places: ['C', 'D', 'U'].slice(-intDigits).concat(['dixièmes', 'centièmes'].slice(0, decimals))
        };
    },

    // spec: { type:'angle', mode:'make'|'identify' }
    angle(spec, rng) {
        if (spec.mode === 'identify') {
            const buckets = ['acute', 'right', 'obtuse'];
            const kind = spec.angleKind || rng.pick(buckets);
            let deg;
            if (kind === 'right' || kind === 'droit') deg = 90;
            else if (kind === 'acute' || kind === 'aigu') deg = rng.int(20, 75);
            else deg = rng.int(105, 165);
            return { angle: deg };
        }
        const targets = spec.targets || [30, 45, 60, 90, 120, 135];
        return { target: rng.pick(targets) };
    },

    // spec: { type:'column', op:'add'|'sub'|'mul'|'div', digits:n, table:n }
    column(spec, rng) {
        const op = spec.op || 'add';
        const digits = spec.digits || 2;
        const lo = Math.pow(10, digits - 1);
        const hi = Math.pow(10, digits) - 1;
        if (op === 'mul') {
            const a = rng.int(lo, hi);
            const b = spec.table ? spec.table : rng.int(2, 9);
            return { op, a, b };
        }
        if (op === 'div') {
            const b = spec.table ? spec.table : rng.int(2, 9);
            const q = rng.int(Math.max(2, Math.floor(lo / b)), Math.max(3, Math.floor(hi / b)));
            return { op, a: b * q + rng.int(0, b - 1), b };
        }
        let a = rng.int(lo, hi);
        let b = rng.int(lo, hi);
        if (op === 'sub' && b > a) { const t = a; a = b; b = t; }
        return { op, a, b };
    },

    // spec: { type:'chart', labels:[..], max:n, mode:'read'|'mean'|'build' }
    chart(spec, rng) {
        const labels = spec.labels || [];
        const max = spec.max || 10;
        const values = labels.map(() => rng.int(1, max));
        if (spec.mode === 'mean') {
            const total = values.reduce((s, v) => s + v, 0);
            return { values, target: Math.round((total / labels.length) * 100) / 100 };
        }
        return { values };
    },

    // spec: { type:'measure', maxCm:n, step:n }
    measure(spec, rng) {
        const maxCm = spec.maxCm || 10;
        const step = spec.step || 1;
        const choices = [];
        for (let v = step; v <= maxCm; v += step) choices.push(v);
        return { target: rng.pick(choices), maxCm };
    },

    // spec: { type:'pattern', maxStep:n, maxStart:n, length:n, pinStart:bool }
    pattern(spec, rng) {
        const maxStep = spec.maxStep || 5;
        const maxStart = spec.maxStart || 10;
        const length = spec.length || 6;
        const step = spec.step || rng.int(1, maxStep);
        // When the lesson pins both the step and the start (e.g. "count by 2"
        // starting on an even number), keep them fixed so the sequence stays
        // valid; otherwise pick a fresh starting point for each attempt.
        const start = spec.pinStart ? (spec.start || 0) : rng.int(0, maxStart);
        return { start, step, length, missing: length - 1 };
    }
};

// Build a concrete spec from a chunk's static activity template, with fresh
// content for this attempt. Falls back to the template when no generator exists.
function buildVariant(template, attempt, seed) {
    // The seed may arrive as a string (e.g. a lesson id). Coerce it to a
    // 32-bit integer: a non-numeric seed would otherwise degenerate the
    // xorshift state to 0 and spin forever in generators that loop until
    // they have enough distinct values.
    let s = null;
    if (seed != null) {
        s = typeof seed === 'number' ? seed : hashSeed(String(seed));
    }
    const rng = makeRng(s == null ? undefined : s + attempt * 7919);
    const gen = VARIANTS[template.type];
    const overlap = gen ? gen(template, rng) : {};
    return Object.assign({}, template, overlap, { _attempt: attempt });
}

// Turn an arbitrary string into a non-zero 32-bit integer seed.
function hashSeed(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0) || 1;
}
