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
const resultsMessage = document.getElementById('resultsMessage');
const modalTryAgainBtn = document.getElementById('modalTryAgainBtn');
const cursor = document.getElementById('cursor');

// Auth State
let currentUser = JSON.parse(localStorage.getItem('user'));
let authToken = localStorage.getItem('token');

// Auth Elements
const authButtons = document.getElementById('authButtons');
const userProfile = document.getElementById('userProfile');
const userEmail = document.getElementById('userEmail');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authModalTitle = document.getElementById('authModalTitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authError = document.getElementById('authError');
const closeAuthModal = document.getElementById('closeAuthModal');
const profileTrigger = document.getElementById('profileTrigger');
const viewScoresBtn = document.getElementById('viewScoresBtn');
const scoresModal = document.getElementById('scoresModal');
const scoresList = document.getElementById('scoresList');
const closeScoresModal = document.getElementById('closeScoresModal');

let authMode = 'login'; // 'login' or 'signup'
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
    textContent.parentElement.scrollTop = 0;
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
    
    const wpm = parseInt(wpmDisplay.textContent);
    const accuracy = parseInt(accuracyDisplay.textContent);
    
    finalWpm.textContent = wpm;
    finalAccuracy.textContent = accuracy;
    finalCharacters.textContent = charactersDisplay.textContent;
    
    let message = "";
    if (wpm > 80) {
        message = accuracy > 95 ? "Incredible! You're a typing god!" : "So fast! Work on that accuracy to be unstoppable.";
    } else if (wpm > 50) {
        message = accuracy > 90 ? "Great job! You have solid typing skills." : "Good speed, but try to focus more on accuracy.";
    } else if (wpm > 30) {
        message = "Keep practicing! You're getting there.";
    } else {
        message = "Don't give up! Every practice session makes you better.";
    }
    
    resultsMessage.textContent = message;
    resultsModal.classList.add('active');

    if (currentUser) {
        saveScore(wpm, accuracy);
    }
}
function updateCursor() {
    const currentWord = textContent.querySelector('.word.current');
    const currentLetter = textContent.querySelector('.letter.current');
    const container = textContent.parentElement;
    
    if (currentLetter) {
        const rect = currentLetter.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        cursor.style.top = `${rect.top - containerRect.top + container.scrollTop}px`;
        cursor.style.left = `${rect.left - containerRect.left}px`;
        cursor.style.height = `${rect.height}px`;
        cursor.style.display = 'block';
    } else if (currentWord) {
        const rect = currentWord.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        cursor.style.top = `${rect.top - containerRect.top + container.scrollTop}px`;
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

        const container = textContent.parentElement;
        const nextWordOffsetTop = nextWord.offsetTop;

        if (nextWordOffsetTop > container.offsetHeight / 2) {
            container.scrollTo({
                top: nextWordOffsetTop - container.offsetHeight / 2,
                behavior: 'smooth'
            });
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

// Auth Functions
function updateAuthUI() {
    if (currentUser) {
        authButtons.classList.add('hidden');
        userProfile.classList.remove('hidden');
        profileTrigger.classList.remove('hidden');
        userEmail.textContent = currentUser.email;
    } else {
        authButtons.classList.remove('hidden');
        userProfile.classList.add('hidden');
        profileTrigger.classList.add('hidden');
    }
}

function openAuth(mode) {
    authMode = mode;
    authModalTitle.textContent = mode === 'login' ? 'Login' : 'Sign Up';
    authSubmitBtn.textContent = mode === 'login' ? 'Login' : 'Sign Up';
    authError.classList.add('hidden');
    authModal.classList.add('active');
}

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    authError.classList.add('hidden');
    authSubmitBtn.disabled = true;

    try {
        const response = await fetch(`/.netlify/functions/${authMode}`, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            if (authMode === 'signup') {
                authMode = 'login';
                authModalTitle.textContent = 'Login';
                authSubmitBtn.textContent = 'Login';
                authError.textContent = 'Account created! Please login.';
                authError.classList.remove('hidden');
                authError.style.color = '#22c55e';
            } else {
                currentUser = data.user;
                authToken = data.token;
                localStorage.setItem('user', JSON.stringify(currentUser));
                localStorage.setItem('token', authToken);
                updateAuthUI();
                authModal.classList.remove('active');
            }
        } else {
            authError.textContent = data.error || 'Authentication failed';
            authError.classList.remove('hidden');
            authError.style.color = '#ef4444';
        }
    } catch (error) {
        authError.textContent = 'An error occurred. Please try again.';
        authError.classList.remove('hidden');
    } finally {
        authSubmitBtn.disabled = false;
    }
}

async function saveScore(wpm, accuracy) {
    try {
        await fetch('/.netlify/functions/save-score', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ wpm, accuracy })
        });
    } catch (error) {
        console.error('Failed to save score:', error);
    }
}

async function loadScores() {
    scoresList.innerHTML = '<div class="progress-text">Loading scores...</div>';
    scoresModal.classList.add('active');

    try {
        const response = await fetch('/.netlify/functions/get-scores', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const scores = await response.json();

        if (scores.length === 0) {
            scoresList.innerHTML = '<div class="progress-text">No scores yet. Keep typing!</div>';
            return;
        }

        scoresList.innerHTML = scores.map(score => `
            <div class="score-item">
                <div class="score-date">${new Date(score.created_at).toLocaleDateString()}</div>
                <div class="score-stats">
                    <span class="score-wpm">${score.wpm} WPM</span>
                    <span class="score-acc">${score.accuracy}% ACC</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        scoresList.innerHTML = '<div class="error-message">Failed to load scores.</div>';
    }
}

// Event Listeners for Auth
loginBtn.addEventListener('click', () => openAuth('login'));
signupBtn.addEventListener('click', () => openAuth('signup'));
closeAuthModal.addEventListener('click', () => authModal.classList.remove('active'));
authForm.addEventListener('submit', handleAuth);
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    updateAuthUI();
});
viewScoresBtn.addEventListener('click', loadScores);
closeScoresModal.addEventListener('click', () => scoresModal.classList.remove('active'));

updateAuthUI();