let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(type) {
    try {
        initAudio();
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'coin') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(1350, now + 0.08);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(450, now);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);       
            osc.frequency.setValueAtTime(659.25, now + 0.1);  
            osc.frequency.setValueAtTime(783.99, now + 0.2); 
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.setValueAtTime(90, now + 0.15);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    } catch (e) {
        console.log("Áudio bloqueado ou não suportado pelo navegador.");
    }
}

const afd = {
    'S0':    { 'c': 'S5',  'd': 'S10', 'v': 'S25' },
    'S5':    { 'c': 'S10', 'd': 'S15', 'v': 'S30', 'C': 'S0' },
    'S10':   { 'c': 'S15', 'd': 'S20', 'v': 'S30', 'C': 'S0' },
    'S15':   { 'c': 'S20', 'd': 'S25', 'v': 'S30', 'C': 'S0' },
    'S20':   { 'c': 'S25', 'd': 'S30', 'v': 'S30', 'C': 'S0' },
    'S25':   { 'c': 'S30', 'd': 'S30', 'v': 'S30', 'C': 'S0' },
    'S30':   { 'c': 'S30', 'd': 'S30', 'v': 'S30', 'a': 'ScatA', 'b': 'ScatB', 'C': 'S0' },
    'ScatA': { 'p': 'Sfinal', 'q': 'Sfinal', 'C': 'S0' },
    'ScatB': { 'p': 'Sfinal', 'q': 'Sfinal', 'C': 'S0' },
    'Sfinal':{ '~': 'S0' }
};

let currentState = 'S0';
let totalInserted = 0; 

const display = document.getElementById('display');
const stateBadge = document.getElementById('current-state-badge');
const logContainer = document.getElementById('log-container');
const productDrop = document.getElementById('product-drop');
const coinReturn = document.getElementById('coin-return');

function sendInput(input) {
    if (input === 'c') { totalInserted += 5; playSound('coin'); }
    else if (input === 'd') { totalInserted += 10; playSound('coin'); }
    else if (input === 'v') { totalInserted += 25; playSound('coin'); }
    else if (input === 'C') { 
        totalInserted = 0; 
        playSound('click'); 
    } else { 
        playSound('click'); 
    }

    const currentStateObj = afd[currentState];

    if (!currentStateObj || !currentStateObj[input]) {
        playSound('error');
        display.innerText = "REJEITADO";
        setTimeout(() => updateUI_DisplayOnly(), 1000);
        return;
    }

    const nextState = currentStateObj[input];
    const previousState = currentState;
    currentState = nextState;

    addLog(previousState, input, currentState);
    updateUI_DisplayOnly();

    if (currentState === 'Sfinal') {
        playSound('success');
        setTimeout(() => {
            triggerPurchaseEffects();
            const finalTrans = afd['Sfinal']['~'];
            currentState = finalTrans;
            totalInserted = 0;
            updateUI_DisplayOnly();
        }, 1800);
    } else if (input === 'C') {
        triggerResetEffects();
    }
}

function updateUI_DisplayOnly() {
    stateBadge.innerText = currentState;

    if (currentState.startsWith('S') && currentState !== 'Sfinal') {
        display.innerText = `SALDO: ${totalInserted}¢`;
    } else if (currentState === 'ScatA') {
        display.innerText = "CAT. A - ESCOLHA";
    } else if (currentState === 'ScatB') {
        display.innerText = "CAT. B - ESCOLHA";
    } else if (currentState === 'Sfinal') {
        display.innerText = "MUITO OBRIGADO!";
    } else {
        display.innerText = "SALDO: 0¢";
    }
}

function addLog(fromState, input, toState) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `&delta;(<b>${fromState}</b>, '${input}') &rarr; <b>${toState}</b>`;
    
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function triggerPurchaseEffects() {
    let change = totalInserted - 30;
    if (change < 0) change = 0;

    productDrop.innerHTML = `PRODUTO ENTREGUE!`;
    productDrop.classList.add('highlight');

    coinReturn.innerHTML = `🪙 Troco: <strong>${change}¢</strong>`;
    coinReturn.classList.add('highlight');

    setTimeout(() => {
        productDrop.innerHTML = "Retirada";
        productDrop.classList.remove('highlight');
        coinReturn.innerHTML = `🪙 Troco: <span>0¢</span>`;
        coinReturn.classList.remove('highlight');
    }, 3000);
}

function triggerResetEffects() {
    coinReturn.innerHTML = `Resetado (Zerado)`;
    coinReturn.classList.add('highlight');
    setTimeout(() => {
        coinReturn.innerHTML = `🪙 Troco: <span>0¢</span>`;
        coinReturn.classList.remove('highlight');
    }, 2000);
}