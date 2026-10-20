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
    // child can see exactly where the paper would be folded.
    const markAxis = () => {
        const mid = size / 2;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = cellAt(r, c);
                cell.classList.remove('axis-left', 'axis-right', 'axis-top', 'axis-bottom');
                if (axis === 'vertical') {
                    if (c === mid - 1) cell.classList.add('axis-right');
                    if (c === mid) cell.classList.add('axis-left');
                } else {
                    if (r === mid - 1) cell.classList.add('axis-bottom');
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
    sort: buildSort
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
