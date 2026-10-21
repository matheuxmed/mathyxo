// ===== Activity variant generators =====
// Each generator returns a FRESH spec for the same skill, so a student who
// answers wrong can retry with new numbers/items instead of memorising one
// question. A generator is a function (rng) -> spec fragment.
//
// rng is a small helper with: int(min,max), pick(array), shuffle(array).

function makeRng(seed) {
    let s = seed == null ? Math.floor(Math.random() * 1e9) : seed;
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
            'compare-blank', 'even-odd'];
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

    // spec: { type:'pattern', maxStep:n, maxStart:n, length:n }
    pattern(spec, rng) {
        const maxStep = spec.maxStep || 5;
        const maxStart = spec.maxStart || 10;
        const length = spec.length || 6;
        const start = rng.int(0, maxStart);
        const step = spec.step || rng.int(1, maxStep);
        return { start, step, length, missing: length - 1 };
    }
};

// Build a concrete spec from a chunk's static activity template, with fresh
// content for this attempt. Falls back to the template when no generator exists.
function buildVariant(template, attempt, seed) {
    const rng = makeRng(seed == null ? undefined : seed + attempt * 7919);
    const gen = VARIANTS[template.type];
    const overlap = gen ? gen(template, rng) : {};
    return Object.assign({}, template, overlap, { _attempt: attempt });
}
