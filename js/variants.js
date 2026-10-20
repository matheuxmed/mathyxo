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
            }
        }
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
    explainer(spec) { return {}; }
};

// Build a concrete spec from a chunk's static activity template, with fresh
// content for this attempt. Falls back to the template when no generator exists.
function buildVariant(template, attempt, seed) {
    const rng = makeRng(seed == null ? undefined : seed + attempt * 7919);
    const gen = VARIANTS[template.type];
    const overlap = gen ? gen(template, rng) : {};
    return Object.assign({}, template, overlap, { _attempt: attempt });
}
