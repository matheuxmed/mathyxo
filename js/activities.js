// ===== Primary-school activity engine =====
// Pure vanilla JS widget renderers. Each builder takes a spec object and a
// host element, wires up its own state, and returns a small API:
//   { el, reset(), check() }
// Specs are language-neutral: text fields are given as { fr, ar } and resolved
// through pick(), so the same spec serves both language versions.

// ---------- helpers ----------

// Resolve a localized field: pick({fr:'..',ar:'..'}) or a plain string.
function pick(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    const lang = (typeof I18N !== 'undefined' && I18N.currentLanguage) || 'fr';
    return value[lang] || value.fr || value.ar || '';
}

function actEl(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
}

function actShuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

function actNumber(n) {
    return (typeof nt === 'function') ? nt(n) : String(n);
}

// Press-and-hold-free pointer drag: works with mouse *and* touch.
// Calls back with (kind, payload) where kind is 'start' | 'move' | 'drop'.
function makeDraggable(handle, payload, onEvent) {
    let dragging = false;
    let ghost = null;
    let origin = null;

    const pointOf = (ev) => {
        const t = (ev.touches && ev.touches[0]) || ev;
        return { x: t.clientX, y: t.clientY };
    };

    const onDown = (ev) => {
        if (handle.classList.contains('matched') || handle.classList.contains('used')) return;
        if (ev.type === 'mousedown' && ev.button !== 0) return;
        ev.preventDefault();

        dragging = true;
        origin = pointOf(ev);
        handle.classList.add('act-dragging');

        ghost = handle.cloneNode(true);
        ghost.classList.add('act-drag-ghost');
        Object.assign(ghost.style, {
            position: 'fixed',
            left: origin.x + 'px',
            top: origin.y + 'px',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: '9999',
            opacity: '0.9'
        });
        document.body.appendChild(ghost);

        document.addEventListener('mousemove', onMove, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchend', onUp);
        onEvent('start', payload, origin);
    };

    const onMove = (ev) => {
        if (!dragging) return;
        ev.preventDefault();
        const p = pointOf(ev);
        if (ghost) {
            ghost.style.left = p.x + 'px';
            ghost.style.top = p.y + 'px';
        }
        onEvent('move', payload, p);
    };

    const onUp = (ev) => {
        if (!dragging) return;
        dragging = false;
        handle.classList.remove('act-dragging');

        const t = (ev.changedTouches && ev.changedTouches[0]) || ev;
        const p = { x: t.clientX, y: t.clientY };
        if (ghost) { ghost.remove(); ghost = null; }

        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchend', onUp);
        onEvent('drop', payload, p);
    };

    handle.addEventListener('mousedown', onDown);
    handle.addEventListener('touchstart', onDown, { passive: false });

    return handle;
}

// Find the drop target under a screen point that carries a data-drop-id.
function dropTargetAt(x, y) {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest('[data-drop-id]') : null;
}

// ---------- 1. Count & tap manipulatives ----------
// spec: { items:[emoji], count:n, mode:'tap'|'drag' }
function buildCountTap(spec, host) {
    const total = spec.items.length;
    const board = actEl('div', 'count-board');
    const value = actEl('div', 'count-value');
    const feedback = actEl('div', 'act-feedback');
    let counted = 0;
    let progress = null;

    const update = () => {
        value.innerHTML = '<span dir="ltr">' + counted + '</span>';
        if (progress) progress(counted, total);
    };

    spec.items.forEach((emoji, i) => {
        const token = actEl('button', 'count-token', emoji);
        token.type = 'button';
        token.setAttribute('aria-label', emoji);
        token.dataset.index = String(i);
        token.addEventListener('click', () => {
            if (token.classList.contains('counted')) return;
            token.classList.add('counted');
            counted++;
            update();
            if (counted === total) {
                feedback.className = 'act-feedback good';
                feedback.textContent = pick(spec.success) || '✓';
                if (spec.onComplete) spec.onComplete();
            }
        });
        board.appendChild(token);
    });

    host.appendChild(board);
    host.appendChild(value);
    host.appendChild(feedback);
    if (spec.target) value.insertAdjacentHTML('afterend',
        '<div class="activity-prompt" style="text-align:center;margin:8px 0 0">' +
        pick(spec.target) + '</div>');

    update();
    return {
        el: host,
        reset() {
            counted = 0;
            board.querySelectorAll('.count-token').forEach(t => t.classList.remove('counted'));
            feedback.textContent = '';
            feedback.className = 'act-feedback';
            update();
        },
        onProgress(fn) { progress = fn; }
    };
}

// ---------- 2. Matching (drag & drop or tap-to-pair) ----------
// spec: { pairs:[{left:{fr,ar}|string, right:...}] }
function buildMatching(spec, host) {
    const wrap = actEl('div', 'match-wrap');
    const leftCol = actEl('div', 'match-col');
    const rightCol = actEl('div', 'match-col');
    const feedback = actEl('div', 'act-feedback');
    let selectedLeft = null;
    let matched = 0;

    const rights = actShuffle(spec.pairs.map((p, i) => ({ i, text: pick(p.right) })));

    const tryMatch = (leftIdx, rightNode) => {
        const rightIdx = Number(rightNode.dataset.pair);
        if (leftIdx === rightIdx) {
            const leftNode = leftCol.querySelector('[data-pair="' + leftIdx + '"]');
            leftNode.classList.add('matched');
            leftNode.classList.remove('selected');
            rightNode.classList.add('matched');
            selectedLeft = null;
            matched++;
            feedback.className = 'act-feedback good';
            feedback.textContent = pick(spec.pairCorrect) || '✓';
            if (matched === spec.pairs.length && spec.onComplete) spec.onComplete();
        } else {
            rightNode.classList.add('wrong');
            setTimeout(() => rightNode.classList.remove('wrong'), 420);
            feedback.className = 'act-feedback bad';
            feedback.textContent = pick(spec.pairWrong) || '✗';
            if (spec.onWrong) spec.onWrong();
        }
    };

    spec.pairs.forEach((pair, i) => {
        const node = actEl('button', 'match-item', pick(pair.left));
        node.type = 'button';
        node.dataset.pair = String(i);
        node.addEventListener('click', () => {
            if (node.classList.contains('matched')) return;
            leftCol.querySelectorAll('.selected').forEach(n => n.classList.remove('selected'));
            node.classList.add('selected');
            selectedLeft = i;
        });
        makeDraggable(node, i, (kind, idx, pt) => {
            if (kind === 'drop') {
                const target = dropTargetAt(pt.x, pt.y);
                if (target && target.classList.contains('match-item') &&
                    target.parentElement === rightCol) {
                    tryMatch(idx, target);
                }
            }
        });
        leftCol.appendChild(node);
    });

    const order = rights.map(r => r.i);
    order.forEach((rightIdx, position) => {
        const item = spec.pairs[rightIdx];
        const node = actEl('button', 'match-item', rights[position].text);
        node.type = 'button';
        node.dataset.pair = String(rightIdx);
        node.addEventListener('click', () => {
            if (node.classList.contains('matched') || selectedLeft == null) return;
            tryMatch(selectedLeft, node);
        });
        node.dataset.dropId = 'match-' + rightIdx;
        rightCol.appendChild(node);
    });

    wrap.appendChild(leftCol);
    wrap.appendChild(rightCol);
    host.appendChild(wrap);
    host.appendChild(feedback);

    return {
        el: host,
        reset() {
            matched = 0; selectedLeft = null;
            host.querySelectorAll('.match-item').forEach(n => {
                n.classList.remove('matched', 'selected', 'wrong');
            });
            feedback.textContent = '';
            feedback.className = 'act-feedback';
        }
    };
}

// ---------- 3. Number line / ordering ----------
// spec: { min, max, slots:[n...] }  (slots are the positions to fill, in order)
function buildNumberLine(spec, host) {
    const min = spec.min, max = spec.max;
    const needs = spec.slots.slice();
    const line = actEl('div', 'numline');
    const axis = actEl('div', 'numline-axis');
    const feedback = actEl('div', 'act-feedback');
    const pool = actEl('div', 'numline-pool');

    const ticks = Math.min(11, max - min + 1);
    for (let i = 0; i < ticks; i++) {
        const t = actEl('span', 'numline-tick');
        t.style.left = (i / (ticks - 1)) * 100 + '%';
        axis.appendChild(t);
    }

    const step = (max - min) / (ticks - 1);
    needs.forEach((val, i) => {
        const slot = actEl('button', 'numline-slot');
        slot.type = 'button';
        slot.dataset.dropId = 'numline-' + i;
        slot.dataset.answer = String(val);
        slot.style.left = ((val - min) / step) / (ticks - 1) * 100 + '%';
        slot.setAttribute('aria-label', '?');
        slot.addEventListener('click', () => {
            if (!slot.dataset.filled) return;
            // Tap a filled slot to return its chip to the pool.
            const chip = pool.querySelector('[data-value="' + slot.dataset.filled + '"]');
            if (chip) chip.classList.remove('used');
            slot.textContent = '';
            delete slot.dataset.filled;
            slot.classList.remove('filled');
        });
        axis.appendChild(slot);
    });

    line.appendChild(axis);

    actShuffle(needs).forEach(val => {
        const chip = actEl('button', 'numline-chip', actNumber(val));
        chip.type = 'button';
        chip.dataset.value = String(val);
        chip.addEventListener('click', () => {
            if (chip.classList.contains('used')) return;
            const empty = axis.querySelector('.numline-slot:not([data-filled])');
            if (!empty) return;
            placeChip(chip, empty);
        });
        makeDraggable(chip, val, (kind, v, pt) => {
            if (kind === 'drop') {
                const target = dropTargetAt(pt.x, pt.y);
                if (target && target.classList.contains('numline-slot') && !target.dataset.filled) {
                    const chipEl = pool.querySelector('[data-value="' + v + '"]');
                    if (chipEl) placeChip(chipEl, target);
                }
            }
        });
        pool.appendChild(chip);
    });

    function placeChip(chip, slot) {
        slot.textContent = chip.textContent;
        slot.dataset.filled = chip.dataset.value;
        slot.classList.add('filled');
        chip.classList.add('used');
        const allFilled = axis.querySelectorAll('.numline-slot[data-filled]').length === needs.length;
        if (allFilled) {
            const good = Array.from(axis.querySelectorAll('.numline-slot'))
                .every(s => s.dataset.filled === s.dataset.answer);
            axis.querySelectorAll('.numline-slot').forEach(s => {
                s.classList.add(s.dataset.filled === s.dataset.answer ? 'correct' : 'incorrect');
            });
            feedback.className = 'act-feedback ' + (good ? 'good' : 'bad');
            feedback.textContent = good
                ? (pick(spec.success) || '✓')
                : (pick(spec.retry) || '✗');
            if (good && spec.onComplete) spec.onComplete();
            if (!good && spec.onWrong) spec.onWrong();
        }
    }

    host.appendChild(line);
    host.appendChild(pool);
    host.appendChild(feedback);

    return {
        el: host,
        reset() {
            axis.querySelectorAll('.numline-slot').forEach(s => {
                s.textContent = '';
                s.classList.remove('filled', 'correct', 'incorrect');
                delete s.dataset.filled;
            });
            pool.querySelectorAll('.numline-chip').forEach(c => c.classList.remove('used'));
            feedback.textContent = '';
            feedback.className = 'act-feedback';
        }
    };
}

// ---------- 4. Shape & geometry explorer ----------
// spec: { shapes:[{id,name:{fr,ar},svg:'...'}] , target:id }
const SHAPE_SVGS = {
    carre: '<svg viewBox="0 0 100 100"><rect x="14" y="14" width="72" height="72" rx="4" fill="#2b7fff"/></svg>',
    rectangle: '<svg viewBox="0 0 100 100"><rect x="6" y="26" width="88" height="48" rx="4" fill="#22a06b"/></svg>',
    triangle: '<svg viewBox="0 0 100 100"><polygon points="50,12 90,86 10,86" fill="#f5a524"/></svg>',
    cercle: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="#8b5cf6"/></svg>',
    losange: '<svg viewBox="0 0 100 100"><polygon points="50,10 88,50 50,90 12,50" fill="#e5484d"/></svg>',
    disque: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="#0ea5e9"/></svg>',
    cube: '<svg viewBox="0 0 100 100"><polygon points="30,28 70,28 70,68 30,68" fill="#2b7fff"/><polygon points="30,28 44,14 84,14 70,28" fill="#7db2ff"/><polygon points="70,28 84,14 84,54 70,68" fill="#1c5dbd"/></svg>',
    pave: '<svg viewBox="0 0 100 100"><polygon points="22,38 66,38 66,74 22,74" fill="#22a06b"/><polygon points="22,38 34,26 78,26 66,38" fill="#68c79b"/><polygon points="66,38 78,26 78,62 66,74" fill="#177f52"/></svg>',
    boule: '<svg viewBox="0 0 100 100"><circle cx="50" cy="52" r="34" fill="#8b5cf6"/><ellipse cx="50" cy="52" rx="34" ry="12" fill="none" stroke="#c9b4fb" stroke-width="2"/></svg>',
    cylindre: '<svg viewBox="0 0 100 100"><rect x="28" y="28" width="44" height="44" fill="#f5a524"/><ellipse cx="50" cy="28" rx="22" ry="9" fill="#ffd280"/><ellipse cx="50" cy="72" rx="22" ry="9" fill="#c9820f"/></svg>'
};

function buildShapeExplorer(spec, host) {
    const grid = actEl('div', 'shape-grid');
    const feedback = actEl('div', 'act-feedback');
    const nameOut = actEl('div', 'activity-prompt');
    nameOut.style.textAlign = 'center';

    spec.shapes.forEach(shape => {
        const card = actEl('button', 'shape-card');
        card.type = 'button';
        card.dataset.shape = shape.id;
        card.innerHTML = '<span class="shape-svg">' + (shape.svg || SHAPE_SVGS[shape.id] || '') + '</span>' +
            '<span>' + pick(shape.name) + '</span>';
        card.addEventListener('click', () => {
            grid.querySelectorAll('.shape-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            if (spec.target) {
                const ok = shape.id === spec.target;
                card.classList.toggle('matched', ok);
                feedback.className = 'act-feedback ' + (ok ? 'good' : 'bad');
                feedback.textContent = ok
                    ? (pick(spec.success) || '✓')
                    : (pick(spec.retry) || '✗');
                if (ok && spec.onComplete) spec.onComplete();
                if (!ok && spec.onWrong) spec.onWrong();
            } else {
                nameOut.innerHTML = '<strong>' + pick(shape.name) + '</strong>' +
                    (shape.note ? ' — ' + pick(shape.note) : '');
            }
        });
        grid.appendChild(card);
    });

    host.appendChild(grid);
    if (spec.target) host.appendChild(feedback);
    else host.appendChild(nameOut);

    return { el: host, reset() {
        grid.querySelectorAll('.shape-card').forEach(c => c.classList.remove('selected', 'matched'));
        feedback.textContent = '';
        feedback.className = 'act-feedback';
        nameOut.innerHTML = '';
    }};
}

// ---------- 4b. Symmetry mirror pad ----------
// spec: { size:8, axis:'vertical'|'horizontal' }
function buildSymmetry(spec, host) {
    const size = spec.size || 8;
    let axis = spec.axis || 'vertical';
    const wrap = actEl('div', 'symmetry-wrap');
    const left = actEl('div');
    const right = actEl('div', 'activity-prompt');
    const picker = actEl('div', 'axis-picker');
    const grid = actEl('div', 'sym-grid');
    grid.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';
    grid.style.maxWidth = '320px';

    const state = Array.from({ length: size }, () => Array(size).fill(false));
    const mirror = Array.from({ length: size }, () => Array(size).fill(false));
    let painting = false;
    let paintValue = true;

    const cellAt = (r, c) => grid.children[r * size + c];

    const mirrorIndex = (r, c) => axis === 'vertical'
        ? [r, size - 1 - c]
        : [size - 1 - r, c];

    const paint = (r, c, on) => {
        state[r][c] = on;
        const [mr, mc] = mirrorIndex(r, c);
        if (on) mirror[mr][mc] = true;
        else if (!state[mr][mc] && mirror[r][c]) mirror[mr][mc] = false;
        cellAt(r, c).classList.toggle('on', on);
        refreshMirror();
    };

    // Mirror shading is derived, never stored per-cell: a cell shows the pale
    // reflection when its mirror partner is painted but it is not painted itself.
    const refreshMirror = () => {
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const [mr, mc] = mirrorIndex(r, c);
                const reflected = state[mr][mc];
                cellAt(r, c).classList.toggle('mirror-on', reflected && !state[r][c]);
            }
        }
    };

    // Draw the fold line as a visible red edge on the cells beside it, so the
    // child can see exactly where the paper would be folded. For an even-sized
    // grid the axis sits in the seam *between* two columns, so we mark only the
    // right half's leading edge to keep it a single line.
    const markAxis = () => {
        const mid = size / 2;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = cellAt(r, c);
                cell.classList.remove('axis-left', 'axis-right', 'axis-top', 'axis-bottom');
                if (axis === 'vertical') {
                    if (c === mid) cell.classList.add('axis-left');
                } else {
                    if (r === mid) cell.classList.add('axis-top');
                }
            }
        }
    };

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = actEl('div', 'sym-cell');
            cell.dataset.r = String(r);
            cell.dataset.c = String(c);
            let handledByPointer = false;
            cell.addEventListener('pointerdown', (e) => {
                handledByPointer = true;
                painting = true;
                paintValue = !state[r][c];
                paint(r, c, paintValue);
                e.preventDefault();
            });
            // Fallback for keyboard / assistive activation, where no pointerdown fires.
            cell.addEventListener('click', () => {
                if (handledByPointer) { handledByPointer = false; return; }
                paint(r, c, !state[r][c]);
            });
            cell.addEventListener('pointerenter', () => { if (painting) paint(r, c, paintValue); });
            grid.appendChild(cell);
        }
    }

    grid.addEventListener('pointerup', () => { painting = false; });
    window.addEventListener('pointerup', () => { painting = false; });

    const setAxis = (next) => {
        axis = next;
        picker.querySelectorAll('button').forEach(b =>
            b.classList.toggle('selected', b.dataset.axis === next));
        markAxis();
        refreshMirror();
    };

    [['vertical', spec.verticalLabel], ['horizontal', spec.horizontalLabel]].forEach(([a, label]) => {
        const b = actEl('button', 'act-btn ghost', label ? pick(label) : a);
        b.type = 'button';
        b.dataset.axis = a;
        b.addEventListener('click', () => setAxis(a));
        picker.appendChild(b);
    });

    const clear = actEl('button', 'act-btn ghost', pick(spec.clear) || 'Effacer');
    clear.type = 'button';
    clear.addEventListener('click', () => {
        for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
            state[r][c] = false; mirror[r][c] = false;
            cellAt(r, c).className = 'sym-cell';
        }
    });
    picker.appendChild(clear);

    left.appendChild(picker);
    left.appendChild(grid);
    right.innerHTML = '<div class="placeholder-note">' + (pick(spec.hint) || '') + '</div>';
    wrap.appendChild(left);
    wrap.appendChild(right);
    host.appendChild(wrap);
    setAxis(axis);

    return { el: host, reset() { clear.click(); } };
}

// ---------- 5. Animated step-by-step explainer ----------
// spec: { steps:[{render:(host)=>void, caption:{fr,ar}}] }
function buildExplainer(spec, host) {
    const box = actEl('div', 'explainer');
    const stage = actEl('div', 'explainer-stage');
    const caption = actEl('div', 'explainer-caption');
    const nav = actEl('div', 'explainer-nav');
    const dots = actEl('div', 'explainer-dots');
    let index = 0;

    const prev = actEl('button', 'act-btn secondary', pick(spec.prev) || '‹');
    const next = actEl('button', 'act-btn', pick(spec.next) || '›');
    const replay = actEl('button', 'act-btn ghost', pick(spec.replay) || '↻');
    prev.type = next.type = replay.type = 'button';

    spec.steps.forEach((_, i) => dots.appendChild(actEl('i', i === 0 ? 'active' : '')));

    const render = () => {
        const step = spec.steps[index];
        stage.innerHTML = '';
        if (typeof step.render === 'function') step.render(stage);
        else stage.innerHTML = step.html || '';
        caption.textContent = pick(step.caption);
        Array.from(dots.children).forEach((d, i) => d.classList.toggle('active', i === index));
        prev.disabled = index === 0;
        next.disabled = index === spec.steps.length - 1;
        if (spec.onStep) spec.onStep(index, spec.steps.length);
    };

    prev.addEventListener('click', () => { if (index > 0) { index--; render(); } });
    next.addEventListener('click', () => { if (index < spec.steps.length - 1) { index++; render(); } });
    replay.addEventListener('click', () => { index = 0; render(); });

    nav.appendChild(prev);
    nav.appendChild(replay);
    nav.appendChild(next);

    box.appendChild(stage);
    box.appendChild(caption);
    box.appendChild(nav);
    box.appendChild(dots);
    host.appendChild(box);
    render();

    return {
        el: host,
        reset() { index = 0; render(); },
        goTo(i) { index = Math.max(0, Math.min(spec.steps.length - 1, i)); render(); }
    };
}

// ---------- 6. Ten-frame / place value builder ----------
// spec: { frames:n, target:{tens,units} }
function buildTenFrame(spec, host) {
    const frames = spec.frames || 2;
    const row = actEl('div', 'tenframe-row');
    const feedback = actEl('div', 'act-feedback');
    const total = actEl('div', 'count-value');
    const frameEls = [];

    for (let f = 0; f < frames; f++) {
        const frame = actEl('div', 'tenframe');
        for (let i = 0; i < 10; i++) {
            const slot = actEl('div', 'slot');
            slot.addEventListener('click', () => {
                slot.classList.toggle('on');
                slot.textContent = slot.classList.contains('on') ? '⚫' : '';
                updateTotal();
            });
            frame.appendChild(slot);
        }
        frameEls.push(frame);
        row.appendChild(frame);
    }

    // Total = every filled slot across all frames. Simple, honest, and matches
    // what a child sees on screen (no hidden "tens" arithmetic).
    const readTotal = () => {
        let n = 0;
        frameEls.forEach(frame => { n += frame.querySelectorAll('.slot.on').length; });
        return n;
    };

    function updateTotal() {
        const v = readTotal();
        total.innerHTML = actNumber(v);
        if (spec.target) {
            const ok = v === spec.target;
            feedback.className = 'act-feedback ' + (ok ? 'good' : 'info');
            feedback.textContent = ok ? (pick(spec.success) || '✓') : '';
            if (ok && spec.onComplete) spec.onComplete();
            // The board is full but the total is wrong: that attempt failed.
            if (!ok && v === frames * 10 && spec.onWrong) spec.onWrong();
            return ok;
        }
    }

    host.appendChild(row);
    host.appendChild(total);
    if (spec.target) host.appendChild(feedback);
    updateTotal();

    return {
        el: host,
        value: readTotal,
        reset() {
            frameEls.forEach(f => f.querySelectorAll('.slot').forEach(s => {
                s.classList.remove('on'); s.textContent = '';
            }));
            feedback.textContent = ''; feedback.className = 'act-feedback';
            updateTotal();
        }
    };
}

// ---------- 7. Quiz / boss challenge with XP ----------
// spec: { questions:[{prompt:{fr,ar}, options:[{fr,ar}], answer:i, explain?}], boss:bool }
function buildQuiz(spec, host) {
    const head = actEl('div', 'quiz-head');
    const progressWrap = actEl('div', 'act-progress');
    const bar = actEl('span');
    progressWrap.appendChild(bar);
    const body = actEl('div', 'quiz-body');
    const xpOut = actEl('span', 'quiz-xp', '⭐ <span>0</span> XP');
    const starsOut = actEl('span', 'quiz-stars');
    const counter = actEl('span');
    head.appendChild(counter);
    head.appendChild(starsOut);
    head.appendChild(xpOut);

    let index = 0, score = 0, xp = 0;

    const render = () => {
        body.innerHTML = '';
        if (index >= spec.questions.length) {
            const pct = Math.round((score / spec.questions.length) * 100);
            const done = actEl('div', 'quiz-done');
            done.innerHTML =
                '<div class="score">' + score + ' / ' + spec.questions.length + '</div>' +
                '<p>' + (pct >= 80 ? pick(spec.win) : pick(spec.tryAgain)) + '</p>';
            const again = actEl('button', 'act-btn', pick(spec.restart) || '↻');
            again.type = 'button';
            again.addEventListener('click', () => {
                index = 0; score = 0; xp = 0; updateHead(); render();
            });
            done.appendChild(again);
            body.appendChild(done);
            if (spec.onComplete) spec.onComplete(score, spec.questions.length);
            return;
        }

        const q = spec.questions[index];
        const prompt = actEl('div', 'quiz-question', pick(q.prompt));
        const opts = actEl('div', 'quiz-options');
        q.options.forEach((opt, i) => {
            const b = actEl('button', 'quiz-option', pick(opt));
            b.type = 'button';
            b.addEventListener('click', () => {
                opts.querySelectorAll('.quiz-option').forEach(x => x.disabled = true);
                const ok = i === q.answer;
                b.classList.add(ok ? 'correct' : 'wrong');
                if (ok) {
                    score++; xp += 10;
                    if (!opts.querySelector('.correct')) b.classList.add('correct');
                } else {
                    opts.children[q.answer].classList.add('correct');
                }
                starsOut.textContent = '⭐'.repeat(Math.min(5, Math.ceil(score / Math.max(1, spec.questions.length) * 5)));
                xpOut.querySelector('span').textContent = String(xp);
                const fb = actEl('div', 'act-feedback ' + (ok ? 'good' : 'bad'));
                fb.textContent = (ok ? (pick(spec.correct) || '✓') : (pick(spec.incorrect) || '✗')) +
                    (q.explain ? ' ' + pick(q.explain) : '');
                body.appendChild(fb);
                if (!ok && spec.onWrong) spec.onWrong({ index, question: q });
                setTimeout(() => { index++; updateHead(); render(); }, ok ? 700 : 1400);
            });
            opts.appendChild(b);
        });
        body.appendChild(prompt);
        body.appendChild(opts);
        updateHead();
    };

    const updateHead = () => {
        counter.textContent = Math.min(index + 1, spec.questions.length) + ' / ' + spec.questions.length;
        bar.style.width = (index / spec.questions.length) * 100 + '%';
    };

    host.appendChild(head);
    host.appendChild(progressWrap);
    host.appendChild(body);
    render();

    return {
        el: host,
        reset() { index = 0; score = 0; xp = 0; xpOut.querySelector('span').textContent = '0'; starsOut.textContent = ''; render(); }
    };
}

// ---------- 8. Multiplication tables game ----------
// spec: { tables:[2,3,4,5] }
function buildTableGame(spec, host) {
    const picker = actEl('div', 'table-picker');
    const question = actEl('div', 'table-question');
    const pad = actEl('div', 'table-pad');
    const streakOut = actEl('div', 'table-streak');
    const feedback = actEl('div', 'act-feedback');
    let table = spec.tables[0];
    let a = 1, b = table, streak = 0, best = 0, locked = false;

    const newQuestion = () => {
        locked = false;
        b = table;
        a = 1 + Math.floor(Math.random() * 10);
        question.innerHTML = '<span dir="ltr">' + a + ' × ' + b + ' = ?</span>';
        pad.innerHTML = '';
        feedback.textContent = ''; feedback.className = 'act-feedback';
        const correct = a * b;
        const pool = new Set([correct]);
        while (pool.size < 4) {
            const cand = (1 + Math.floor(Math.random() * 10)) * b;
            if (cand !== correct) pool.add(cand);
        }
        actShuffle(Array.from(pool)).forEach(v => {
            const btn = actEl('button', null, actNumber(v));
            btn.type = 'button';
            btn.addEventListener('click', () => {
                if (locked) return;
                locked = true;
                const ok = v === correct;
                btn.classList.add(ok ? 'correct' : 'wrong');
                if (ok) {
                    streak++;
                    best = Math.max(best, streak);
                    feedback.className = 'act-feedback good';
                    feedback.textContent = pick(spec.correct) || '✓';
                    streakOut.textContent = pick(spec.streakLabel) + ' ' + streak +
                        (best > streak ? '' : ' ' + (pick(spec.bestLabel) || ''));
                    if (spec.onCorrect) spec.onCorrect(streak);
                    setTimeout(newQuestion, 700);
                } else {
                    streak = 0;
                    feedback.className = 'act-feedback bad';
                    feedback.textContent = (pick(spec.wrong) || '✗') + ' ' + a + ' × ' + b + ' = ' + correct;
                    if (spec.onWrong) spec.onWrong({ a, b, correct });
                    pad.querySelectorAll('button').forEach(x => {
                        if (Number(x.textContent) === correct) x.classList.add('correct');
                    });
                    setTimeout(newQuestion, 1600);
                }
            });
            pad.appendChild(btn);
        });
    };

    spec.tables.forEach(t => {
        const b = actEl('button', null, actNumber(t));
        b.type = 'button';
        b.dataset.table = String(t);
        b.addEventListener('click', () => {
            table = t;
            picker.querySelectorAll('button').forEach(x => x.classList.toggle('selected', x === b));
            newQuestion();
        });
        picker.appendChild(b);
    });
    picker.firstChild.classList.add('selected');

    host.appendChild(picker);
    host.appendChild(question);
    host.appendChild(pad);
    host.appendChild(feedback);
    host.appendChild(streakOut);
    newQuestion();

    return { el: host, reset() { streak = 0; streakOut.textContent = ''; newQuestion(); } };
}

// ---------- 9. Sort into buckets ----------
// spec: { buckets:[{id,label:{fr,ar}}], items:[{label, emoji?, bucket}] }
function buildSort(spec, host) {
    const pool = actEl('div', 'sort-pool');
    const row = actEl('div', 'bucket-row');
    const feedback = actEl('div', 'act-feedback');
    let placed = 0;

    const tryPlace = (itemNode, bucketId) => {
        const item = spec.items[Number(itemNode.dataset.item)];
        if (item.bucket === bucketId) {
            const bucket = row.querySelector('[data-bucket="' + bucketId + '"] .items');
            bucket.appendChild(itemNode);
            itemNode.classList.remove('act-dragging');
            itemNode.classList.add('matched');
            itemNode.style.cursor = 'default';
            placed++;
            feedback.className = 'act-feedback good';
            feedback.textContent = pick(spec.correct) || '✓';
            if (placed === spec.items.length) {
                feedback.textContent = pick(spec.success) || '✓';
                if (spec.onComplete) spec.onComplete();
            }
        } else {
            itemNode.classList.add('wrong');
            setTimeout(() => itemNode.classList.remove('wrong'), 420);
            feedback.className = 'act-feedback bad';
            feedback.textContent = pick(spec.incorrect) || '✗';
        }
    };

    spec.buckets.forEach(b => {
        const bucket = actEl('div', 'bucket');
        bucket.dataset.dropId = 'bucket-' + b.id;
        bucket.dataset.bucket = b.id;
        bucket.innerHTML = '<h4>' + pick(b.label) + '</h4><div class="items"></div>';
        const h = bucket.querySelector('h4');
        h.dataset.dropId = 'bucket-' + b.id;
        bucket.addEventListener('click', () => {
            const sel = pool.querySelector('.match-item.selected');
            if (sel) tryPlace(sel, b.id);
        });
        row.appendChild(bucket);
    });

    spec.items.forEach((item, i) => {
        const node = actEl('button', 'match-item', (item.emoji || '') + ' ' + pick(item.label));
        node.type = 'button';
        node.dataset.item = String(i);
        node.addEventListener('click', () => {
            pool.querySelectorAll('.match-item').forEach(x => x.classList.remove('selected'));
            node.classList.add('selected');
        });
        makeDraggable(node, i, (kind, idx, pt) => {
            if (kind === 'drop') {
                const target = dropTargetAt(pt.x, pt.y);
                const bucket = target && target.closest('[data-bucket]');
                if (bucket) tryPlace(pool.querySelector('[data-item="' + idx + '"]'), bucket.dataset.bucket);
            }
        });
        pool.appendChild(node);
    });

    host.appendChild(pool);
    host.appendChild(row);
    host.appendChild(feedback);

    return { el: host, reset() { feedback.textContent = ''; feedback.className = 'act-feedback'; } };
}

// ---------- 10. Fraction builder (shade a bar or pie, then read/write it) ----------
// spec: {
//   shape:'bar'|'pie', parts:n, shaded:n,                 // round 1: recognise
//   mode:'shade'|'read', target:n,                        // 'shade': student shades target/parts
//   showLabel:bool, compare:[{a,b}]                       // optional comparison sub-task
// }
function buildFraction(spec, host) {
    const parts = spec.parts || 4;
    const shape = spec.shape || 'bar';
    const mode = spec.mode || 'shade';
    const target = spec.target != null ? spec.target : spec.shaded || 1;
    const wrap = actEl('div', 'frac-wrap');
    const drawn = actEl('div', 'frac-drawn');
    const value = actEl('div', 'frac-value');
    const feedback = actEl('div', 'act-feedback');
    let shaded = mode === 'read' ? (spec.shaded || 0) : 0;
    let solved = false;

    const renderFractionNumber = (num, den) => {
        // Stacked fraction: numerator over a rule over denominator.
        return '<span class="frac-num" dir="ltr">' + num + '</span>' +
               '<span class="frac-den" dir="ltr">' + den + '</span>';
    };

    const refresh = () => {
        value.innerHTML = '<span class="frac-display">' + renderFractionNumber(shaded, parts) + '</span>';
    };

    // --- bar shape ---
    if (shape === 'bar') {
        const bar = actEl('div', 'frac-bar');
        bar.style.gridTemplateColumns = 'repeat(' + parts + ', 1fr)';
        for (let i = 0; i < parts; i++) {
            const cell = actEl('button', 'frac-part');
            cell.type = 'button';
            cell.dataset.index = String(i);
            cell.setAttribute('aria-label', String(i + 1));
            const toggle = () => {
                if (mode !== 'shade' || solved) return;
                cell.classList.toggle('on');
                shaded = bar.querySelectorAll('.frac-part.on').length;
                refresh();
                if (shaded === target) {
                    solved = true;
                    feedback.className = 'act-feedback good';
                    feedback.textContent = pick(spec.success) || '✓';
                    if (spec.onComplete) spec.onComplete();
                } else if (shaded > target) {
                    feedback.className = 'act-feedback info';
                    feedback.textContent = pick(spec.tooMany) || '';
                }
            };
            cell.addEventListener('click', toggle);
            bar.appendChild(cell);
        }
        drawn.appendChild(bar);
    } else {
        // --- pie shape: draw `parts` equal wedges, shade the first `shaded` ---
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '-110 -110 220 220');
        svg.setAttribute('class', 'frac-pie');
        const R = 100;
        const wedge = (i) => {
            const start = (i / parts) * Math.PI * 2 - Math.PI / 2;
            const end = ((i + 1) / parts) * Math.PI * 2 - Math.PI / 2;
            const x1 = Math.cos(start) * R, y1 = Math.sin(start) * R;
            const x2 = Math.cos(end) * R, y2 = Math.sin(end) * R;
            const large = (end - start) > Math.PI ? 1 : 0;
            if (parts === 1) return 'M 0 0 L 0 ' + (-R) + ' A ' + R + ' ' + R + ' 0 1 1 0 ' + R + ' Z';
            return 'M 0 0 L ' + x1.toFixed(2) + ' ' + y1.toFixed(2) +
                   ' A ' + R + ' ' + R + ' 0 ' + large + ' 1 ' + x2.toFixed(2) + ' ' + y2.toFixed(2) + ' Z';
        };
        const pieRefresh = () => {
            Array.from(svg.querySelectorAll('path')).forEach((p, i) => {
                p.classList.toggle('on', i < shaded);
            });
        };
        for (let i = 0; i < parts; i++) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', wedge(i));
            path.setAttribute('class', 'frac-wedge');
            path.dataset.index = String(i);
            path.addEventListener('click', () => {
                if (mode !== 'shade' || solved) return;
                shaded = (shaded === i + 1) ? i : i + 1;
                pieRefresh();
                refresh();
                if (shaded === target) {
                    solved = true;
                    feedback.className = 'act-feedback good';
                    feedback.textContent = pick(spec.success) || '✓';
                    if (spec.onComplete) spec.onComplete();
                }
            });
            svg.appendChild(path);
        }
        drawn.appendChild(svg);
        // expose the refresh to the outer scope before first paint
        host._pieRefresh = pieRefresh;
    }

    if (mode === 'read') {
        // The student must say what fraction is shaded.
        const choices = actEl('div', 'frac-choices');
        const correct = target;
        const opts = [];
        const seen = new Set([correct + '/' + parts]);
        opts.push({ n: correct, d: parts });
        while (opts.length < 4 && opts.length < parts + 1) {
            const n = 1 + Math.floor(Math.random() * parts);
            const key = n + '/' + parts;
            if (!seen.has(key)) { seen.add(key); opts.push({ n, d: parts }); }
        }
        actShuffle(opts).forEach(o => {
            const b = actEl('button', 'frac-choice');
            b.type = 'button';
            b.innerHTML = '<span class="frac-mini">' + renderFractionNumber(o.n, o.d) + '</span>';
            b.addEventListener('click', () => {
                if (solved) return;
                const ok = (o.n === correct && o.d === parts);
                b.classList.add(ok ? 'correct' : 'wrong');
                if (ok) {
                    solved = true;
                    feedback.className = 'act-feedback good';
                    feedback.textContent = pick(spec.success) || '✓';
                    if (spec.onComplete) spec.onComplete();
                } else {
                    feedback.className = 'act-feedback bad';
                    feedback.textContent = pick(spec.retry) || '✗';
                    if (spec.onWrong) spec.onWrong();
                }
            });
            choices.appendChild(b);
        });
        drawn.appendChild(choices);
    }

    refresh();
    if (host._pieRefresh) host._pieRefresh();
    wrap.appendChild(drawn);
    wrap.appendChild(value);
    host.appendChild(wrap);
    host.appendChild(feedback);

    return {
        el: host,
        value: () => shaded,
        reset() {
            solved = false;
            shaded = mode === 'read' ? (spec.shaded || 0) : 0;
            host.querySelectorAll('.frac-part').forEach(c => c.classList.remove('on'));
            host.querySelectorAll('.frac-wedge').forEach(p => p.classList.remove('on'));
            host.querySelectorAll('.frac-choice').forEach(c => c.classList.remove('correct', 'wrong'));
            if (host._pieRefresh) host._pieRefresh();
            refresh();
            feedback.textContent = '';
            feedback.className = 'act-feedback';
        }
    };
}

// ---------- 11. Decimal place-value chart ----------
// spec: { places:['U','dixièmes','centièmes'], digits:{...} } or
// spec: { mode:'build', number:'3,45' }  -> student places digits
// spec: { mode:'compare', a:'3,45', b:'3,5' }
function buildPlaceValue(spec, host) {
    const labels = spec.places || ['U', 'dixièmes', 'centièmes'];
    const wrap = actEl('div', 'pv-wrap');
    const feedback = actEl('div', 'act-feedback');
    const mode = spec.mode || 'build';

    if (mode === 'compare') {
        const row = actEl('div', 'pv-compare');
        const readA = spec.a, readB = spec.b;
        const a = Number(readA.replace(',', '.'));
        const b = Number(readB.replace(',', '.'));
        const mk = (val, cls) => {
            const card = actEl('div', 'pv-card ' + cls);
            card.innerHTML = '<span dir="ltr">' + val + '</span>';
            return card;
        };
        row.appendChild(mk(readA, 'a'));
        const slot = actEl('div', 'pv-sign');
        slot.innerHTML = '?';
        row.appendChild(slot);
        row.appendChild(mk(readB, 'b'));
        const choices = actEl('div', 'pv-choices');
        ['&lt;', '&gt;', '='].forEach(sym => {
            const btn = actEl('button', 'act-btn ghost', sym);
            btn.type = 'button';
            btn.innerHTML = sym;
            btn.addEventListener('click', () => {
                const correct = a < b ? '<' : (a > b ? '>' : '=');
                const picked = btn.textContent.trim();
                const ok = picked === correct;
                slot.innerHTML = picked;
                slot.className = 'pv-sign ' + (ok ? 'correct' : 'wrong');
                if (ok) {
                    feedback.className = 'act-feedback good';
                    feedback.textContent = pick(spec.success) || '✓';
                    if (spec.onComplete) spec.onComplete();
                } else {
                    feedback.className = 'act-feedback bad';
                    feedback.textContent = pick(spec.retry) || '✗';
                    if (spec.onWrong) spec.onWrong();
                }
            });
            choices.appendChild(btn);
        });
        wrap.appendChild(row);
        wrap.appendChild(choices);
        host.appendChild(wrap);
        host.appendChild(feedback);
        return { el: host, reset() { slot.innerHTML = '?'; slot.className = 'pv-sign'; feedback.textContent = ''; feedback.className = 'act-feedback'; } };
    }

    // mode 'build': show a table; student taps the digit for each column.
    const number = spec.number || '3,45';
    const digits = number.replace(',', '.').split('');       // e.g. ['3','.','4','5']
    const intPart = number.split(',')[0] || '';
    const decPart = number.split(',')[1] || '';
    const table = actEl('div', 'pv-table');
    const header = actEl('div', 'pv-row pv-head');
    const bodyRow = actEl('div', 'pv-row pv-body');
    const tensRow = actEl('div', 'pv-row pv-parts');
    const allLabels = ['C', 'D', 'U'].slice(-Math.max(1, intPart.length)).concat(['dixièmes', 'centièmes'].slice(0, decPart.length));
    // Simpler: label columns for the digits we actually show.
    const cols = intPart.split('').map((_, i, arr) => ['C', 'D', 'U'][3 - arr.length + i] || 'U').concat(decPart.split('').map((_, i) => i === 0 ? 'dixièmes' : 'centièmes'));

    cols.forEach(lab => {
        header.appendChild(actEl('div', 'pv-cell pv-cell-head', pick({ fr: lab, ar: lab })));
    });
    const inputs = [];
    const allDigits = (intPart + decPart).split('');
    allDigits.forEach((d, i) => {
        const cell = actEl('button', 'pv-cell pv-input');
        cell.type = 'button';
        cell.dataset.index = String(i);
        let cursor = 0;
        cell.addEventListener('click', () => {
            cursor = (cursor + 1) % 10;
            cell.textContent = String(cursor);
            cell.dataset.value = String(cursor);
            const built = inputs.map(x => x.dataset.value || '0').join('');
            const ok = built === allDigits.join('');
            if (ok) {
                feedback.className = 'act-feedback good';
                feedback.textContent = pick(spec.success) || '✓';
                if (spec.onComplete) spec.onComplete();
            } else {
                feedback.className = 'act-feedback';
                feedback.textContent = '';
            }
        });
        inputs.push(cell);
        bodyRow.appendChild(cell);
    });
    table.appendChild(header);
    table.appendChild(bodyRow);
    tensRow.appendChild(actEl('div', 'pv-note', pick({ fr: 'Touche une case pour choisir le chiffre.', ar: 'المس مربعاً لاختيار الرقم.' })));
    wrap.appendChild(table);
    wrap.appendChild(tensRow);
    host.appendChild(wrap);
    host.appendChild(feedback);

    return {
        el: host,
        reset() {
            inputs.forEach(c => { c.textContent = ''; delete c.dataset.value; });
            feedback.textContent = ''; feedback.className = 'act-feedback';
        }
    };
}

// ---------- 12. Angle explorer (drag a ray, identify the angle) ----------
// spec: { target:45|90|120, mode:'make'|'identify' }
function buildAngle(spec, host) {
    const wrap = actEl('div', 'angle-wrap');
    const feedback = actEl('div', 'act-feedback');
    const readout = actEl('div', 'angle-readout');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '-20 -20 260 180');
    svg.setAttribute('class', 'angle-svg');
    const cx = 40, cy = 140;
    const armLen = 170;
    let degrees = spec.mode === 'identify' ? (spec.angle || 90) : 0;
    const mode = spec.mode || 'make';
    const target = spec.target || 90;

    // Fixed base ray (points right).
    const base = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    base.setAttribute('x1', cx); base.setAttribute('y1', cy);
    base.setAttribute('x2', cx + armLen); base.setAttribute('y2', cy);
    base.setAttribute('class', 'angle-arm angle-base');

    // Movable ray.
    const ray = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ray.setAttribute('class', 'angle-arm angle-move');

    // Arc between the arms.
    const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arc.setAttribute('class', 'angle-arc');

    // Right-angle marker for 90°.
    const corner = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    corner.setAttribute('class', 'angle-corner');

    svg.appendChild(base); svg.appendChild(arc); svg.appendChild(corner); svg.appendChild(ray);
    wrap.appendChild(svg);

    const toXY = (deg) => {
        const rad = deg * Math.PI / 180;
        return { x: cx + Math.cos(rad) * armLen, y: cy - Math.sin(rad) * armLen };
    };

    const paint = () => {
        const p = toXY(degrees);
        ray.setAttribute('x1', cx); ray.setAttribute('y1', cy);
        ray.setAttribute('x2', p.x); ray.setAttribute('y2', p.y);
        const r = 42;
        const s = toXY(0), e = toXY(degrees);
        const large = degrees > 180 ? 1 : 0;
        arc.setAttribute('d', 'M ' + (cx + r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 ' + large + ' 0 ' +
            (cx + Math.cos(degrees * Math.PI / 180) * r).toFixed(2) + ' ' +
            (cy - Math.sin(degrees * Math.PI / 180) * r).toFixed(2));
        corner.setAttribute('d', degrees === 90
            ? 'M ' + (cx + 22) + ' ' + cy + ' L ' + (cx + 22) + ' ' + (cy - 22) + ' L ' + cx + ' ' + (cy - 22)
            : '');
        readout.innerHTML = '<span dir="ltr">' + Math.round(degrees) + '°</span>';
        if (mode === 'make') {
            const ok = Math.abs(degrees - target) <= 4;
            if (ok) {
                feedback.className = 'act-feedback good';
                feedback.textContent = pick(spec.success) || '✓';
                if (spec.onComplete) spec.onComplete();
            } else {
                feedback.className = 'act-feedback';
                feedback.textContent = '';
            }
        }
    };

    // Dragging on the SVG changes the angle.
    let dragging = false;
    const setFromPoint = (clientX, clientY) => {
        const rect = svg.getBoundingClientRect();
        const scale = 260 / rect.width;
        const vx = (clientX - rect.left) * scale - 20;
        const vy = (clientY - rect.top) * scale - 20;
        const dx = vx + 20 - cx;
        const dy = -(vy + 20 - cy);
        let deg = Math.atan2(dy, dx) * 180 / Math.PI;
        if (deg < 0) deg += 360;
        degrees = deg;
        paint();
    };
    const down = (e) => { if (mode !== 'make') return; dragging = true; const t = (e.touches && e.touches[0]) || e; setFromPoint(t.clientX, t.clientY); e.preventDefault(); };
    const move = (e) => { if (!dragging) return; const t = (e.touches && e.touches[0]) || e; setFromPoint(t.clientX, t.clientY); e.preventDefault(); };
    const up = () => { dragging = false; };
    svg.addEventListener('pointerdown', down);
    svg.addEventListener('mousedown', down);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    svg.addEventListener('touchstart', down, { passive: false });
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', up);

    wrap.appendChild(readout);

    if (mode === 'identify') {
        // Show an angle, student names it.
        const kinds = ['droit', 'aigu', 'obtus'];
        const names = {
            droit: { fr: 'Angle droit (90°)', ar: 'زاوية قائمة (90°)' },
            aigu: { fr: 'Angle aigu (< 90°)', ar: 'زاوية حادة (< 90°)' },
            obtus: { fr: 'Angle obtus (> 90°)', ar: 'زاوية منفرجة (> 90°)' }
        };
        const correct = degrees === 90 ? 'droit' : (degrees < 90 ? 'aigu' : 'obtus');
        const choices = actEl('div', 'angle-choices');
        kinds.forEach(k => {
            const b = actEl('button', 'act-btn ghost', pick(names[k]));
            b.type = 'button';
            b.addEventListener('click', () => {
                const ok = k === correct;
                b.classList.add(ok ? 'correct' : 'wrong');
                if (ok) {
                    feedback.className = 'act-feedback good';
                    feedback.textContent = pick(spec.success) || '✓';
                    if (spec.onComplete) spec.onComplete();
                } else {
                    feedback.className = 'act-feedback bad';
                    feedback.textContent = pick(spec.retry) || '✗';
                    if (spec.onWrong) spec.onWrong();
                }
            });
            choices.appendChild(b);
        });
        wrap.appendChild(choices);
    }

    host.appendChild(wrap);
    host.appendChild(feedback);
    paint();

    return {
        el: host,
        value: () => degrees,
        reset() {
            degrees = mode === 'identify' ? (spec.angle || 90) : 0;
            host.querySelectorAll('.angle-choices .act-btn').forEach(b => b.classList.remove('correct', 'wrong'));
            paint();
            feedback.textContent = ''; feedback.className = 'act-feedback';
        }
    };
}

// ---------- 13. Column board: long multiplication and division ----------
// spec: { op:'add'|'sub'|'mul'|'div', a, b }
// Everything is laid out on an explicit column grid so digits always line up:
// each row is a flex line of fixed-width cells, with the operator in a leading
// column of its own so it never eats into the digits.
function buildColumnBoard(spec, host) {
    const op = spec.op || 'add';
    const wrap = actEl('div', 'colboard-wrap');
    const feedback = actEl('div', 'act-feedback');
    const board = actEl('div', 'colboard-grid');

    // A rule line spanning the leading operator column plus `w` digit columns.
    const ruleRow = (w) => {
        const rl = actEl('div', 'cb-row cb-rule');
        rl.appendChild(actEl('span', 'cb-cell'));
        for (let i = 0; i < w; i++) rl.appendChild(actEl('span'));
        return rl;
    };

    if (op === 'mul') {
        const a = spec.a, b = spec.b;
        const total = a * b;
        const width = String(total).length;
        const bDigits = String(b).split('').map(Number);
        // One partial product per digit of b, units digit first (conventional
        // long multiplication order); later digits shift one column left each.
        const partials = bDigits.slice().reverse().map((d, i) => ({ value: a * d, shift: i }));

        // Digit columns only for the product layout (no carry row needed here).
        const rowTop = actEl('div', 'cb-row');
        rowTop.appendChild(actEl('span', 'cb-cell'));
        String(a).padStart(width, ' ').split('').forEach(ch => rowTop.appendChild(actEl('span', 'cb-cell', ch === ' ' ? '' : ch)));
        board.appendChild(rowTop);

        const rowMul = actEl('div', 'cb-row');
        rowMul.appendChild(actEl('span', 'cb-cell op', '×'));
        String(b).padStart(width, ' ').split('').forEach(ch => rowMul.appendChild(actEl('span', 'cb-cell', ch === ' ' ? '' : ch)));
        board.appendChild(rowMul);

        board.appendChild(ruleRow(width));

        partials.forEach(p => {
            const row = actEl('div', 'cb-row');
            row.appendChild(actEl('span', 'cb-cell'));
            const chars = String(p.value);
            for (let i = 0; i < width; i++) {
                // column index i maps to digit index (i - shift) from the left
                const digitIdx = i - (width - chars.length - p.shift);
                row.appendChild(actEl('span', 'cb-cell', digitIdx >= 0 && digitIdx < chars.length ? chars[digitIdx] : ''));
            }
            board.appendChild(row);
        });

        board.appendChild(ruleRow(width));

        const rowAns = actEl('div', 'cb-row cb-answer');
        rowAns.appendChild(actEl('span', 'cb-cell'));
        String(total).padStart(width, ' ').split('').forEach(ch =>
            rowAns.appendChild(actEl('span', 'cb-cell' + (ch === ' ' ? '' : ' result'), ch === ' ' ? '' : ch)));
        board.appendChild(rowAns);

        const actions = actEl('div', 'colboard-actions');
        const btn = actEl('button', 'act-btn', pick({ fr: 'Vérifier ma réponse', ar: 'تحقق من جوابي' }));
        btn.type = 'button';
        btn.addEventListener('click', () => {
            feedback.className = 'act-feedback good';
            feedback.textContent = (pick(spec.success) || '✓') + ' ' + a + ' × ' + b + ' = ' + total;
            if (spec.onComplete) spec.onComplete();
        });
        actions.appendChild(btn);
        wrap.appendChild(actions);
    } else if (op === 'div') {
        const a = spec.a, b = spec.b;
        const q = Math.floor(a / b), r = a % b;
        const qDigits = String(q);
        const width = Math.max(String(a).length, qDigits.length);
        // Dividend row, with the divisor in the leading column.
        const rowA = actEl('div', 'cb-row');
        rowA.appendChild(actEl('span', 'cb-cell op', String(b)));
        String(a).padStart(width, ' ').split('').forEach(ch =>
            rowA.appendChild(actEl('span', 'cb-cell', ch === ' ' ? '' : ch)));
        board.appendChild(rowA);
        const rl = actEl('div', 'cb-row cb-rule');
        rl.appendChild(actEl('span', 'cb-cell'));
        for (let i = 0; i < width; i++) rl.appendChild(actEl('span'));
        board.appendChild(rl);
        // Quotient sits under the dividend; any remainder is shown in the note.
        const rowQ = actEl('div', 'cb-row cb-answer');
        rowQ.appendChild(actEl('span', 'cb-cell'));
        qDigits.padStart(width, ' ').split('').forEach(ch =>
            rowQ.appendChild(actEl('span', 'cb-cell' + (ch === ' ' ? '' : ' result'), ch === ' ' ? '' : ch)));
        board.appendChild(rowQ);
        const note = actEl('div', 'col-note',
            '<span dir="ltr">' + a + ' = ' + b + ' × ' + q + (r ? ' + ' + r : '') + '</span>');
        wrap.appendChild(note);

        const actions = actEl('div', 'colboard-actions');
        const btn = actEl('button', 'act-btn', pick({ fr: 'Vérifier ma réponse', ar: 'تحقق من جوابي' }));
        btn.type = 'button';
        btn.addEventListener('click', () => {
            feedback.className = 'act-feedback good';
            feedback.textContent = (pick(spec.success) || '✓') + ' ' + a + ' ÷ ' + b + ' = ' + q +
                (r ? ' (' + pick({ fr: 'reste', ar: 'الباقي' }) + ' ' + r + ')' : '');
            if (spec.onComplete) spec.onComplete();
        });
        actions.appendChild(btn);
        wrap.appendChild(actions);
    } else {
        // add / sub: a proper carry (or borrow) row above the operands, with the
        // operator in its own column to the left of the digits.
        const a = spec.a, b = spec.b;
        const isAdd = op === 'add';
        const sum = isAdd ? a + b : a - b;
        const digitsWidth = String(Math.max(a, b, Math.abs(sum))).length;

        // Compute carries / borrows per column (right to left).
        const aD = String(Math.abs(a)).padStart(digitsWidth, ' ').split('');
        const bD = String(Math.abs(b)).padStart(digitsWidth, ' ').split('');
        const carryMarks = new Array(digitsWidth).fill('');
        let carry = 0;
        for (let i = digitsWidth - 1; i >= 0; i--) {
            const av = aD[i] === ' ' ? 0 : Number(aD[i]);
            const bv = bD[i] === ' ' ? 0 : Number(bD[i]);
            if (isAdd) {
                const s = av + bv + carry;
                carry = s >= 10 ? 1 : 0;
                if (carry && i - 1 >= 0) carryMarks[i - 1] = '1';
            } else {
                const diff = av - bv - carry;
                carry = diff < 0 ? 1 : 0;
                if (carry && i - 1 >= 0) carryMarks[i - 1] = '1';
            }
        }

        // A leading operator column, then the digit columns.
        const opRow = actEl('div', 'cb-row cb-carryrow');
        opRow.appendChild(actEl('span', 'cb-cell'));
        carryMarks.forEach(mark => opRow.appendChild(actEl('span', 'cb-cell' + (mark ? ' cb-carry' : ''), mark)));
        board.appendChild(opRow);

        const opLabel = isAdd ? '+' : '−';
        const rowA = actEl('div', 'cb-row');
        rowA.appendChild(actEl('span', 'cb-cell'));
        String(Math.abs(a)).padStart(digitsWidth, ' ').split('').forEach(ch =>
            rowA.appendChild(actEl('span', 'cb-cell', ch === ' ' ? '' : ch)));
        board.appendChild(rowA);

        const rowB = actEl('div', 'cb-row');
        rowB.appendChild(actEl('span', 'cb-cell op', opLabel));
        String(Math.abs(b)).padStart(digitsWidth, ' ').split('').forEach(ch =>
            rowB.appendChild(actEl('span', 'cb-cell', ch === ' ' ? '' : ch)));
        board.appendChild(rowB);

        const rl = actEl('div', 'cb-row cb-rule');
        rl.appendChild(actEl('span', 'cb-cell'));
        for (let i = 0; i < digitsWidth; i++) rl.appendChild(actEl('span'));
        board.appendChild(rl);

        const rowR = actEl('div', 'cb-row cb-answer');
        rowR.appendChild(actEl('span', 'cb-cell'));
        String(Math.abs(sum)).padStart(digitsWidth, ' ').split('').forEach(ch =>
            rowR.appendChild(actEl('span', 'cb-cell' + (ch === ' ' ? '' : ' result'), ch === ' ' ? '' : ch)));
        board.appendChild(rowR);

        const actions = actEl('div', 'colboard-actions');
        const btn = actEl('button', 'act-btn', pick({ fr: 'Vérifier ma réponse', ar: 'تحقق من جوابي' }));
        btn.type = 'button';
        btn.addEventListener('click', () => {
            feedback.className = 'act-feedback good';
            feedback.textContent = (pick(spec.success) || '✓') + ' ' + a + ' ' + (isAdd ? '+' : '−') + ' ' + b + ' = ' + sum;
            if (spec.onComplete) spec.onComplete();
        });
        actions.appendChild(btn);
        wrap.appendChild(actions);
    }

    wrap.insertBefore(board, wrap.firstChild);
    host.appendChild(wrap);
    host.appendChild(feedback);
    return { el: host, reset() { feedback.textContent = ''; feedback.className = 'act-feedback'; } };
}

// ---------- 14. Chart reader: bar chart / frequency table / mean ----------
// spec: { labels:[..], values:[..], questions:[{kind, ...}] }
function buildChart(spec, host) {
    const labels = spec.labels || [];
    const values = spec.values || [];
    const max = Math.max.apply(null, values.concat([1]));
    const wrap = actEl('div', 'chart-wrap');
    const chart = actEl('div', 'chart-bars');
    const feedback = actEl('div', 'act-feedback');

    labels.forEach((lab, i) => {
        const col = actEl('div', 'chart-col');
        const v = values[i];
        const bar = actEl('div', 'chart-bar');
        bar.style.height = Math.round((v / max) * 140) + 'px';
        bar.dataset.value = String(v);
        bar.title = String(v);
        const cap = actEl('span', 'chart-cap', pick(lab));
        col.appendChild(bar);
        col.appendChild(cap);
        chart.appendChild(col);
    });
    wrap.appendChild(chart);

    const mode = spec.mode || 'read';
    if (mode === 'mean') {
        const target = spec.target || Math.round(values.reduce((s, v) => s + v, 0) / values.length * 100) / 100;
        const choices = actEl('div', 'chart-choices');
        const correct = Math.round(target * 100) / 100;
        const opts = new Set([correct]);
        while (opts.size < 4) {
            const cand = Math.max(0, correct + Math.floor(Math.random() * 9) - 4);
            opts.add(cand);
        }
        actShuffle(Array.from(opts)).forEach(v => {
            const b = actEl('button', 'act-btn ghost', '<span dir="ltr">' + v + '</span>');
            b.type = 'button';
            b.addEventListener('click', () => {
                const ok = Number(v) === correct;
                b.classList.add(ok ? 'correct' : 'wrong');
                if (ok) {
                    feedback.className = 'act-feedback good';
                    feedback.textContent = pick(spec.success) || '✓';
                    if (spec.onComplete) spec.onComplete();
                } else {
                    feedback.className = 'act-feedback bad';
                    feedback.textContent = pick(spec.retry) || '✗';
                    if (spec.onWrong) spec.onWrong();
                }
            });
            choices.appendChild(b);
        });
        wrap.appendChild(choices);
    } else if (mode === 'build') {
        // Student taps a column to set its value to match a target list.
        const targets = spec.targets || values;
        const current = labels.map(() => 0);
        const cols = chart.querySelectorAll('.chart-col');
        cols.forEach((col, i) => {
            const bar = col.querySelector('.chart-bar');
            const valOut = actEl('span', 'chart-val', '0');
            col.insertBefore(valOut, bar);
            col.style.cursor = 'pointer';
            col.addEventListener('click', () => {
                current[i] = (current[i] + 1) % (max + 1);
                bar.style.height = Math.round((current[i] / max) * 140) + 'px';
                valOut.textContent = String(current[i]);
                const ok = current.every((v, k) => v === targets[k]);
                if (ok) {
                    feedback.className = 'act-feedback good';
                    feedback.textContent = pick(spec.success) || '✓';
                    if (spec.onComplete) spec.onComplete();
                } else {
                    feedback.className = 'act-feedback';
                    feedback.textContent = '';
                }
            });
        });
    } else {
        const q = spec.question || {};
        const correct = q.answer != null ? q.answer : values.indexOf(max);
        const choices = actEl('div', 'chart-choices');
        labels.forEach((lab, i) => {
            const b = actEl('button', 'act-btn ghost', pick(lab));
            b.type = 'button';
            b.addEventListener('click', () => {
                const ok = i === correct;
                b.classList.add(ok ? 'correct' : 'wrong');
                if (ok) {
                    feedback.className = 'act-feedback good';
                    feedback.textContent = pick(spec.success) || '✓';
                    if (spec.onComplete) spec.onComplete();
                } else {
                    feedback.className = 'act-feedback bad';
                    feedback.textContent = pick(spec.retry) || '✗';
                    if (spec.onWrong) spec.onWrong();
                }
            });
            choices.appendChild(b);
        });
        wrap.appendChild(choices);
    }

    host.appendChild(wrap);
    host.appendChild(feedback);
    return { el: host, reset() { feedback.textContent = ''; feedback.className = 'act-feedback'; } };
}

// ---------- 15. Measurement ruler (drag an object, read its length) ----------
// spec: { target:cm, tolerance:0.5 }
function buildMeasure(spec, host) {
    const wrap = actEl('div', 'measure-wrap');
    const feedback = actEl('div', 'act-feedback');
    const target = spec.target || 5;
    const tol = spec.tolerance != null ? spec.tolerance : 0.4;
    const maxCm = spec.maxCm || 10;
    let cm = spec.start != null ? spec.start : 1;

    const ruler = actEl('div', 'ruler');
    ruler.style.width = (maxCm * 34) + 'px';
    for (let i = 0; i <= maxCm; i++) {
        const tick = actEl('span', 'ruler-tick' + (i % 5 === 0 ? ' major' : ''));
        tick.style.left = (i * 34) + 'px';
        if (i % 5 === 0) tick.textContent = String(i);
        ruler.appendChild(tick);
    }
    const object = actEl('div', 'ruler-object');
    const readout = actEl('div', 'measure-readout');
    const apply = () => {
        object.style.width = (cm * 34) + 'px';
        readout.innerHTML = '<span dir="ltr">' + cm.toFixed(1) + ' cm</span>';
        const ok = Math.abs(cm - target) <= tol;
        if (ok) {
            feedback.className = 'act-feedback good';
            feedback.textContent = pick(spec.success) || '✓';
            if (spec.onComplete) spec.onComplete();
        } else {
            feedback.className = 'act-feedback';
            feedback.textContent = '';
        }
    };

    // Drag the right edge of the object.
    let dragging = false;
    const handle = actEl('span', 'ruler-handle');
    object.appendChild(handle);
    const setFromX = (clientX) => {
        const rect = ruler.getBoundingClientRect();
        const px = clientX - rect.left;
        cm = Math.max(0.5, Math.min(maxCm, Math.round((px / 34) * 2) / 2));
        apply();
    };
    const down = (e) => { dragging = true; const t = (e.touches && e.touches[0]) || e; setFromX(t.clientX); e.preventDefault(); };
    const move = (e) => { if (!dragging) return; const t = (e.touches && e.touches[0]) || e; setFromX(t.clientX); e.preventDefault(); };
    const up = () => { dragging = false; };
    handle.addEventListener('mousedown', down);
    handle.addEventListener('touchstart', down, { passive: false });
    document.addEventListener('mousemove', move);
    document.addEventListener('touchend', up);
    document.addEventListener('mouseup', up);

    wrap.appendChild(ruler);
    wrap.appendChild(object);
    wrap.appendChild(readout);
    host.appendChild(wrap);
    host.appendChild(feedback);
    apply();

    return { el: host, value: () => cm, reset() { cm = 1; apply(); feedback.textContent = ''; feedback.className = 'act-feedback'; } };
}

// ---------- 16. Pattern / sequence builder ----------
// spec: { start:n, step:n, length:n, choices:bool }
function buildPattern(spec, host) {
    const start = spec.start || 0;
    const step = spec.step || 1;
    const length = spec.length || 6;
    const seq = [];
    for (let i = 0; i < length; i++) seq.push(start + i * step);
    const missingIndex = spec.missing != null ? spec.missing : length - 1;
    const wrap = actEl('div', 'pattern-wrap');
    const row = actEl('div', 'pattern-row');
    const feedback = actEl('div', 'act-feedback');

    seq.forEach((v, i) => {
        if (i === missingIndex) {
            const slot = actEl('div', 'pattern-slot', '?');
            slot.dataset.answer = String(v);
            slot.dataset.index = String(i);
            row.appendChild(slot);
        } else {
            row.appendChild(actEl('div', 'pattern-num', actNumber(v)));
        }
    });
    wrap.appendChild(row);

    const correct = seq[missingIndex];
    const opts = new Set([correct]);
    let guard = 0;
    while (opts.size < 4 && guard++ < 40) {
        const cand = correct + (Math.floor(Math.random() * 11) - 5) * step;
        if (cand !== correct && cand >= 0) opts.add(cand);
    }
    const choices = actEl('div', 'pattern-choices');
    actShuffle(Array.from(opts)).forEach(v => {
        const b = actEl('button', 'act-btn ghost', actNumber(v));
        b.type = 'button';
        b.dataset.value = String(v);
        b.addEventListener('click', () => {
            const ok = Number(v) === correct;
            const slot = row.querySelector('.pattern-slot');
            slot.textContent = String(v);
            slot.className = 'pattern-slot ' + (ok ? 'correct' : 'wrong');
            if (ok) {
                feedback.className = 'act-feedback good';
                feedback.textContent = pick(spec.success) || '✓';
                if (spec.onComplete) spec.onComplete();
            } else {
                feedback.className = 'act-feedback bad';
                feedback.textContent = pick(spec.retry) || '✗';
                if (spec.onWrong) spec.onWrong();
            }
        });
        choices.appendChild(b);
    });
    wrap.appendChild(choices);
    host.appendChild(wrap);
    host.appendChild(feedback);

    return {
        el: host,
        reset() {
            const slot = row.querySelector('.pattern-slot');
            slot.textContent = '?'; slot.className = 'pattern-slot';
            host.querySelectorAll('.pattern-choices .act-btn').forEach(b => b.classList.remove('correct', 'wrong'));
            feedback.textContent = ''; feedback.className = 'act-feedback';
        }
    };
}

// ---------- registry ----------
const ACTIVITIES = {
    'count-tap': buildCountTap,
    matching: buildMatching,
    'number-line': buildNumberLine,
    shapes: buildShapeExplorer,
    symmetry: buildSymmetry,
    explainer: buildExplainer,
    tenframe: buildTenFrame,
    quiz: buildQuiz,
    tables: buildTableGame,
    sort: buildSort,
    fraction: buildFraction,
    'place-value': buildPlaceValue,
    angle: buildAngle,
    column: buildColumnBoard,
    chart: buildChart,
    measure: buildMeasure,
    pattern: buildPattern
};

// Render one activity spec into a host element, wrapped in the standard card.
function renderActivity(spec, container) {
    const card = actEl('div', 'activity');
    const builder = ACTIVITIES[spec.type];
    if (!builder) {
        card.textContent = 'Unknown activity type: ' + spec.type;
        container.appendChild(card);
        return null;
    }

    const head = actEl('div', 'activity-head');
    head.appendChild(actEl('h3', 'activity-title', pick(spec.title)));
    head.appendChild(actEl('span', 'activity-kind', spec.type));
    card.appendChild(head);
    if (spec.prompt) card.appendChild(actEl('p', 'activity-prompt', pick(spec.prompt)));

    const stage = actEl('div', 'activity-stage');
    card.appendChild(stage);

    if (spec.why) {
        const why = actEl('details');
        why.innerHTML = '<summary>' + pick({ fr: 'Pourquoi ?', ar: 'لماذا؟' }) + '</summary>' +
            '<p style="margin:8px 0 0">' + pick(spec.why) + '</p>';
        card.appendChild(why);
    }

    container.appendChild(card);
    const api = builder(spec, stage);

    if (spec.replay !== false) {
        const actions = actEl('div', 'activity-actions');
        const again = actEl('button', 'act-btn ghost', '↻ ' + pick({ fr: 'Recommencer', ar: 'إعادة' }));
        again.type = 'button';
        again.addEventListener('click', () => api && api.reset && api.reset());
        actions.appendChild(again);
        card.appendChild(actions);
    }

    return api;
}

// Render a list of specs.
function renderActivities(specs, container) {
    container.innerHTML = '';
    return specs.map(spec => renderActivity(spec, container)).filter(Boolean);
}

