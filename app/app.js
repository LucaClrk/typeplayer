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
const WORD_COUNT = 30;
const LAST_SCORE_KEY = 'typeplayer.lastScore';

const textEl = document.getElementById('text');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
document.getElementById('wordCount').textContent = WORD_COUNT;

let target, typed, keystrokes, mistakes, startedAt, finished, ticker;

function randomText() {
    const words = [];
    while (words.length < WORD_COUNT) {
        const word = WORDS[Math.floor(Math.random() * WORDS.length)];
        if (word !== words[words.length - 1]) words.push(word);
    }
    return words.join(' ');
}

function newTest() {
    clearInterval(ticker);
    target = randomText();
    typed = '';
    keystrokes = 0;
    mistakes = 0;
    startedAt = null;
    finished = false;
    resultsEl.hidden = true;
    statusEl.hidden = false;
    const last = loadLastScore();
    statusEl.textContent = (last ? `last run: ${last.wpm} wpm, ${last.accuracy}% accuracy. ` : '') +
        'start typing to begin. tab restarts.';
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
    const wordsDone = typed.split(' ').length - 1;
    statusEl.textContent = `${Math.floor(seconds)}s  ${wpm(correctChars(), seconds)} wpm  ${wordsDone}/${WORD_COUNT} words`;
}

// The last score lives in localStorage, so it survives reloads in this browser.
// Storage can be blocked (private windows, strict settings); the test still works without it.
function loadLastScore() {
    try {
        const score = JSON.parse(localStorage.getItem(LAST_SCORE_KEY));
        return Number.isFinite(score?.wpm) && Number.isFinite(score?.accuracy) ? score : null;
    } catch {
        return null;
    }
}

function saveLastScore(score) {
    try {
        localStorage.setItem(LAST_SCORE_KEY, JSON.stringify(score));
    } catch {
        // Not saved; nothing else depends on it.
    }
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
    const seconds = elapsedSeconds();
    const correct = correctChars();
    const speed = wpm(correct, seconds);
    const accuracy = Math.round(100 * (keystrokes - mistakes) / keystrokes);
    const last = loadLastScore();
    saveLastScore({ wpm: speed, accuracy });
    statusEl.hidden = true;
    resultsEl.innerHTML =
        `wpm       ${String(speed).padEnd(6)}${versusLast(speed, last?.wpm, '')}\n` +
        `raw       ${wpm(typed.length, seconds)}\n` +
        `accuracy  ${`${accuracy}%`.padEnd(6)}${versusLast(accuracy, last?.accuracy, '%')}\n` +
        `time      ${seconds.toFixed(1)}s\n` +
        `chars     ${correct} correct, ${typed.length - correct} wrong\n` +
        `typos     ${mistakes}\n` +
        `\n` +
        `<span class="dim">press enter or tab to go again.</span>\n` +
        `[guest@arch ~]$ <span class="cursor"> </span>`;
    resultsEl.hidden = false;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        newTest();
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
    }
    keystrokes++;
    if (e.key !== target[typed.length]) mistakes++;
    typed += e.key;
    render();
    if (typed.length === target.length) finish();
});

newTest();
