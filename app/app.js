const wordsString = 'the quick brown fox jumps over the lazy dog coding typing game challenge keyboard player accuracy speed practice words letters test typing skills computer software develop engineering project logic application interface style design simple clean efficient performant browser script interaction event listener interval timer results modal progress bar characters minute average score competition improve habit focus concentration rhythm flow typing speed increase knowledge technology internet web development frontend backend fullstack engineer developer architect system structure quality code maintainable scalable reliable robust feature implementation bug fix solution resolve issue problem challenge success achievement milestone goal target objective plan execution result outcome analysis observation research study learning growth development improvement progress change evolution transformation innovation creativity inspiration motivation passion dedication hard work commitment persistence resilience adaptability flexibility agility versatility diversity inclusion equality respect collaboration teamwork communication leadership management organization coordination strategy vision mission value principle ethics integrity honesty transparency accountability responsibility empowerment ownership initiative proactivity self-discipline focus determination drive ambition energy enthusiasm positivity optimism confidence courage bravery strength power resilience endurance stamina patience tolerance understanding empathy compassion kindness generosity gratitude humility respect integrity wisdom knowledge intelligence curiosity wonder exploration discovery adventure journey path way direction purpose meaning life happiness joy fulfillment peace harmony balance stability security safety health well-being nature environment sustainability planet future generation world society humanity community connection relationship family friend love care support unity solidarity diversity';
const wordsArray = wordsString.split(' ');
const gameDuration = 60 * 1000;
let timer = null;
let startTime = null;
let currentWordIndex = 0;
let totalCharacters = 0;
let correctCharacters = 0;
let errors = 0;
let isGameRunning = false;
const textContent = document.getElementById('textContent');
const typingInput = document.getElementById('typingInput');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const timerDisplay = document.getElementById('timer').querySelector('span');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const charactersDisplay = document.getElementById('characters');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultsModal = document.getElementById('resultsModal');
const finalWpm = document.getElementById('finalWpm');
const finalAccuracy = document.getElementById('finalAccuracy');
const finalCharacters = document.getElementById('finalCharacters');
const modalTryAgainBtn = document.getElementById('modalTryAgainBtn');
const cursor = document.getElementById('cursor');
function initGame() {
    textContent.innerHTML = '';
    const shuffledWords = [...wordsArray].sort(() => Math.random() - 0.5).slice(0, 100);
    shuffledWords.forEach((word, index) => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';
        if (index === 0) wordDiv.classList.add('current');
        word.split('').forEach((char, charIndex) => {
            const span = document.createElement('span');
            span.className = 'letter';
            if (index === 0 && charIndex === 0) span.classList.add('current');
            span.textContent = char;
            wordDiv.appendChild(span);
        });
        textContent.appendChild(wordDiv);
    });
    currentWordIndex = 0;
    totalCharacters = 0;
    correctCharacters = 0;
    errors = 0;
    isGameRunning = false;
    timer = null;
    startTime = null;
    typingInput.value = '';
    typingInput.disabled = true;
    startBtn.disabled = false;
    timerDisplay.textContent = '60';
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100';
    charactersDisplay.textContent = '0';
    progressFill.style.width = '0%';
    progressText.textContent = 'Ready to start';
    updateCursor();
}
function startGame() {
    isGameRunning = true;
    typingInput.disabled = false;
    typingInput.focus();
    startBtn.disabled = true;
    startTime = Date.now();
    progressText.textContent = 'Typing...';
    timer = setInterval(updateTimer, 100);
}
function updateTimer() {
    const timePassed = Date.now() - startTime;
    const timeLeft = Math.max(0, (gameDuration - timePassed) / 1000);
    timerDisplay.textContent = Math.ceil(timeLeft);
    const progress = (timePassed / gameDuration) * 100;
    progressFill.style.width = `${Math.min(100, progress)}%`;
    if (timeLeft <= 0) {
        endGame();
    }
    updateStats();
}
function updateStats() {
    if (!startTime) return;
    const timePassedMinutes = (Date.now() - startTime) / 60000;
    const wpm = timePassedMinutes > 0 ? Math.round((correctCharacters / 5) / timePassedMinutes) : 0;
    const accuracy = totalCharacters > 0 ? Math.round((correctCharacters / totalCharacters) * 100) : 100;
    wpmDisplay.textContent = wpm;
    accuracyDisplay.textContent = accuracy;
    charactersDisplay.textContent = correctCharacters;
}
function endGame() {
    clearInterval(timer);
    isGameRunning = false;
    typingInput.disabled = true;
    finalWpm.textContent = wpmDisplay.textContent;
    finalAccuracy.textContent = accuracyDisplay.textContent;
    finalCharacters.textContent = charactersDisplay.textContent;
    resultsModal.classList.add('active');
}
function updateCursor() {
    const currentWord = textContent.querySelector('.word.current');
    const currentLetter = textContent.querySelector('.letter.current');
    const container = textContent.parentElement;
    
    if (currentLetter) {
        const rect = currentLetter.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        cursor.style.top = `${rect.top - containerRect.top}px`;
        cursor.style.left = `${rect.left - containerRect.left}px`;
        cursor.style.height = `${rect.height}px`;
        cursor.style.display = 'block';
    } else if (currentWord) {
        const rect = currentWord.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        cursor.style.top = `${rect.top - containerRect.top}px`;
        cursor.style.left = `${rect.right - containerRect.left}px`;
        cursor.style.height = `${rect.height}px`;
        cursor.style.display = 'block';
    } else {
        cursor.style.display = 'none';
    }
}
typingInput.addEventListener('input', (e) => {
    if (!isGameRunning) return;
    const typedValue = typingInput.value;
    const currentWord = textContent.querySelector('.word.current');
    if (!currentWord) return;
    const letters = currentWord.querySelectorAll('.letter');
    const wordText = Array.from(letters).map(l => l.textContent).join('');
    if (typedValue.endsWith(' ')) {
        const typedWord = typedValue.trim();
        totalCharacters += typedWord.length + 1;
        if (typedWord === wordText) {
            correctCharacters += wordText.length + 1;
            currentWord.classList.add('correct');
        } else {
            currentWord.classList.add('incorrect');
            errors++;
        }
        currentWord.classList.remove('current');
        const nextWord = currentWord.nextElementSibling;
        if (nextWord) {
            nextWord.classList.add('current');
            const currentLetter = currentWord.querySelector('.letter.current');
            if (currentLetter) currentLetter.classList.remove('current');
            nextWord.querySelector('.letter').classList.add('current');
            typingInput.value = '';
            if (nextWord.offsetTop > textContent.offsetHeight / 2) {
                textContent.scrollTop = nextWord.offsetTop - textContent.offsetHeight / 2;
            }
        } else {
            endGame();
        }
    } else {
        letters.forEach((letter, index) => {
            letter.classList.remove('correct', 'incorrect', 'current');
            if (index < typedValue.length) {
                if (typedValue[index] === letter.textContent) {
                    letter.classList.add('correct');
                } else {
                    letter.classList.add('incorrect');
                }
            }
            if (index === typedValue.length) {
                letter.classList.add('current');
            }
        });
    }
    updateCursor();
    updateStats();
});
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', () => {
    clearInterval(timer);
    initGame();
});
modalTryAgainBtn.addEventListener('click', () => {
    resultsModal.classList.remove('active');
    initGame();
});
initGame();
window.addEventListener('resize', updateCursor);