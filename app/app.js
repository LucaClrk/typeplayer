const WORDS = (
    'the be of and to in he have it that for they with as not on she at by this we you do but ' +
    'from or which one would all will there say who make when can more if no man out other so what ' +
    'time up go about than into could only new year some take come these know see use get like then ' +
    'first any work now may such give over think most even find day also after way many should well ' +
    'people down own just because good each those feel seem how high too place little world very still ' +
    'hand old life tell write become here show house both between need mean call under last right move ' +
    'thing school never same another begin while number part turn real leave might want point form off ' +
    'child few small since against ask late home large person end open follow during present without ' +
    'again hold around possible head word problem lead system set order eye plan run keep face fact ' +
    'group play stand early course change help line city light night water read music story party'
).split(' ');
const DURATIONS = [30, 60];
const DURATION_KEY = 'typeplayer.duration';

const textEl = document.getElementById('text');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const durationEl = document.getElementById('duration');
const durationButtons = document.querySelectorAll('[data-duration]');

let duration = Number(readStorage(DURATION_KEY));
if (!DURATIONS.includes(duration)) duration = DURATIONS[0];

let target, typed, keystrokes, mistakes, startedAt, finished, ticker, timeout;

// Scores and the chosen time live in localStorage, so they survive reloads in this browser.
// Storage can be blocked (private windows, strict settings); the test still works without it.
function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Not saved; nothing else depends on it.
    }
}

// A 60s score isn't comparable to a 30s one, so each time keeps its own last score.
function lastScoreKey() {
    return `typeplayer.lastScore.${duration}s`;
}

function loadLastScore() {
    try {
        const score = JSON.parse(readStorage(lastScoreKey()));
        return Number.isFinite(score?.wpm) && Number.isFinite(score?.accuracy) ? score : null;
    } catch {
        return null;
    }
}

function randomWords(count) {
    const words = [];
    while (words.length < count) {
        const word = WORDS[Math.floor(Math.random() * WORDS.length)];
        if (word !== words[words.length - 1]) words.push(word);
    }
    return words.join(' ');
}

function isRunning() {
    return startedAt !== null && !finished;
}

function chooseDuration(seconds) {
    if (isRunning()) return;
    duration = seconds;
    writeStorage(DURATION_KEY, duration);
    newTest();
}

function newTest() {
    clearInterval(ticker);
    clearTimeout(timeout);
    target = randomWords(60);
    typed = '';
    keystrokes = 0;
    mistakes = 0;
    startedAt = null;
    finished = false;

    durationEl.textContent = duration;
    for (const button of durationButtons) {
        const selected = Number(button.dataset.duration) === duration;
        button.textContent = selected ? `[${button.dataset.duration}s]` : ` ${button.dataset.duration}s `;
        button.setAttribute('aria-pressed', selected);
    }

    const last = loadLastScore();
    statusEl.textContent = (last ? `last ${duration}s run: ${last.wpm} wpm, ${last.accuracy}% accuracy.\n` : '') +
        'start typing to begin. ←/→ changes the time, tab restarts.';
    statusEl.hidden = false;
    resultsEl.hidden = true;
    render();
}

function render() {
    let html = '';
    for (let i = 0; i < target.length; i++) {
        const ch = target[i];
        let cls = 'todo';
        if (i < typed.length) cls = typed[i] === ch ? 'ok' : 'bad';
        if (ch === ' ') cls += ' space';
        if (i === typed.length) cls += ' cursor';
        html += `<span class="${cls}">${ch}</span>`;
    }
    textEl.innerHTML = html;

    // Keep the cursor on the second visible line, so finished lines scroll up like terminal output.
    const lineHeight = parseFloat(getComputedStyle(textEl).lineHeight);
    const cursorLine = Math.floor(textEl.querySelector('.cursor').offsetTop / lineHeight);
    textEl.scrollTop = Math.max(0, cursorLine - 1) * lineHeight;
}

function elapsedSeconds() {
    return (performance.now() - startedAt) / 1000;
}

function correctChars() {
    let count = 0;
    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === target[i]) count++;
    }
    return count;
}

// Standard definition: one "word" is five characters, spaces included.
function wpm(chars, seconds) {
    return Math.round(chars / 5 / (seconds / 60));
}

function updateStatus() {
    const seconds = elapsedSeconds();
    const left = Math.max(0, Math.ceil(duration - seconds));
    statusEl.textContent = `${left}s left  ${wpm(correctChars(), Math.max(seconds, 1))} wpm`;
}

function versusLast(now, before, unit) {
    if (before === undefined) return '';
    const diff = now - before;
    if (diff === 0) return `<span class="dim">same as last</span>`;
    const sign = diff > 0 ? '+' : '';
    return `<span class="${diff > 0 ? 'up' : 'bad'}">${sign}${diff}${unit}</span>` +
        ` <span class="dim">vs last (${before}${unit})</span>`;
}

function finish() {
    finished = true;
    clearInterval(ticker);
    textEl.querySelector('.cursor')?.classList.remove('cursor');
    const correct = correctChars();
    const speed = wpm(correct, duration);
    // Rounded down, so 100% only ever means no typos at all.
    const accuracy = Math.floor(100 * (keystrokes - mistakes) / keystrokes);
    const last = loadLastScore();
    writeStorage(lastScoreKey(), JSON.stringify({ wpm: speed, accuracy }));
    statusEl.hidden = true;
    resultsEl.innerHTML =
        `wpm       ${String(speed).padEnd(6)}${versusLast(speed, last?.wpm, '')}\n` +
        `raw       ${wpm(typed.length, duration)}\n` +
        `accuracy  ${`${accuracy}%`.padEnd(6)}${versusLast(accuracy, last?.accuracy, '%')}\n` +
        `time      ${duration}s\n` +
        `chars     ${correct} correct, ${typed.length - correct} wrong\n` +
        `typos     ${mistakes}\n` +
        `\n` +
        `<span class="dim">press enter or tab to go again, ←/→ to change the time.</span>\n` +
        `[guest@arch ~]$ <span class="cursor"> </span>`;
    resultsEl.hidden = false;
}

for (const button of durationButtons) {
    button.addEventListener('click', () => {
        chooseDuration(Number(button.dataset.duration));
        // Drop focus so Enter/Space keep going to the test instead of re-clicking the button.
        button.blur();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        newTest();
        return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const next = DURATIONS[DURATIONS.indexOf(duration) + (e.key === 'ArrowRight' ? 1 : -1)];
        if (next) chooseDuration(next);
        return;
    }
    if (finished) {
        if (e.key === 'Enter') {
            e.preventDefault();
            newTest();
        }
        return;
    }
    if (e.key === 'Backspace') {
        e.preventDefault();
        // Ctrl/Option+Backspace deletes the previous word, like in a shell.
        typed = e.ctrlKey || e.altKey ? typed.replace(/\S*\s*$/, '') : typed.slice(0, -1);
        render();
        return;
    }
    // Leave browser shortcuts (Cmd+R, Ctrl+L, ...) alone; only take printable characters.
    if (e.metaKey || e.ctrlKey || e.key.length !== 1) return;
    e.preventDefault();

    if (startedAt === null) {
        startedAt = performance.now();
        ticker = setInterval(updateStatus, 250);
        timeout = setTimeout(finish, duration * 1000);
    }
    keystrokes++;
    if (e.key !== target[typed.length]) mistakes++;
    typed += e.key;
    // Top up the text well before the end; nobody should run out of words.
    if (target.length - typed.length < 100) target += ' ' + randomWords(30);
    render();
});

newTest();
