let timeLeft;
let timerId = null;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');
const modeButtons = document.querySelectorAll('.mode-btn');

function updateDisplay(minutes, seconds) {
    minutesDisplay.textContent = String(minutes).padStart(2, '0');
    secondsDisplay.textContent = String(seconds).padStart(2, '0');
    
    // Update the tab title with the remaining time
    const mode = document.querySelector('.mode-btn.active').dataset.mode;
    const modeText = mode.charAt(0).toUpperCase() + mode.slice(1);
    document.title = `(${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}) ${modeText} - Pomodoro Timer`;
}

function setTimer(minutes) {
    timeLeft = minutes * 60;
    updateDisplay(minutes, 0);
}

function switchMode(mode) {
    modeButtons.forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
            setTimer(parseInt(btn.dataset.time));
        } else {
            btn.classList.remove('active');
        }
    });
}

function startTimer() {
    if (timerId !== null) return;
    
    timerId = setInterval(() => {
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timerId);
            timerId = null;
            
            const currentMode = document.querySelector('.mode-btn.active').dataset.mode;
            if (currentMode === 'work') {
                switchMode('rest');
            } else {
                switchMode('work');
            }
            
            // Play notification sound (if you want to add this feature)
            try {
                new Audio('notification.mp3').play();
            } catch (e) {
                console.log('Notification sound not available');
            }
            return;
        }
        
        updateDisplay(Math.floor(timeLeft / 60), timeLeft % 60);
    }, 1000);
}

function pauseTimer() {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
}

function resetTimer() {
    pauseTimer();
    const activeButton = document.querySelector('.mode-btn.active');
    setTimer(parseInt(activeButton.dataset.time));
}

// Event Listeners
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (timerId) {
            // If timer is running, pause it before switching modes
            pauseTimer();
        }
        switchMode(button.dataset.mode);
    });
});

// Initialize timer with work mode
setTimer(25); 