// --- DADOS DO JOGO ---

// Cartas Padrão (Modo Normal)
const DEFAULT_CARDS = [
    { l: 'Quente', r: 'Frio' }, { l: 'Herói', r: 'Vilão' }, { l: 'Fantasia', r: 'Realidade' },
    { l: 'Liso', r: 'Áspero' }, { l: 'Inútil', r: 'Útil' }, { l: 'Triste', r: 'Feliz' },
    { l: 'Redondo', r: 'Pontudo' }, { l: 'Barato', r: 'Caro' }, { l: 'Saboroso', r: 'Sem Gosto' },
    { l: 'Curto', r: 'Longo' }, { l: 'Gosto Ruim', r: 'Gosto Bom' }, { l: 'Aterrorizante', r: 'Fofo' },
    { l: 'Passado', r: 'Futuro' }, { l: 'Cheiro Bom', r: 'Cheiro Ruim' }, { l: 'Rápido', r: 'Devagar' },
    { l: 'Claro', r: 'Escuro' }, { l: 'Grande', r: 'Pequeno' }, { l: 'Forte', r: 'Fraco' },
    { l: 'Molhado', r: 'Seco' }, { l: 'Pesado', r: 'Leve' }, { l: 'Moderno', r: 'Antigo' },
    { l: 'Calmo', r: 'Agitado' }, { l: 'Natural', r: 'Artificial' }, { l: 'Silencioso', r: 'Barulhento' },
    { l: 'Simples', r: 'Complexo' }, { l: 'Organizado', r: 'Bagunçado' }, { l: 'Comum', r: 'Raro' },
    { l: 'Doce', r: 'Salgado' }, { l: 'Quente', r: 'Gelado' }, { l: 'Corajoso', r: 'Medroso' },
    { l: 'Educado', r: 'Grosseiro' }, { l: 'Lógico', r: 'Esquisito' }, { l: 'Rico', r: 'Pobre' },
    { l: 'Criativo', r: 'Sem Imaginação' }, { l: 'Macio', r: 'Duro' }, { l: 'Limpo', r: 'Sujo' },
    { l: 'Leve', r: 'Pesado' }, { l: 'Veloz', r: 'Lento' }, { l: 'Famoso', r: 'Desconhecido' }

];

const PLAYER_COLORS = [
    '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#06b6d4', 
    '#f97316', '#ef4444', '#eab308', '#6366f1', '#14b8a6'
];

// NOVA LISTA DE OPÇÕES DE EMOJI
const EMOJI_LIST = [
    '😎', '👽', '🤠', '🥳', '🤓', '🤖', '👻', '🦄', '🐯', '🐶', 
    '🦁', '🐸', '🍕', '🚀', '💀', '💩', '🤡', '👾', '🎃', '💍',
    '👑', '⚽', '🎮', '🐱', '🐻', '🦊', '🐼', '🐨', '🐔', '🐧'
];

let state = {
    players: [], playerEmojis: [], scores: [], totalRounds: 4, currentRound: 1, turnIndex: 0, 
    targetAngle: 90, guessAngle: 90, currentCard: {}, guessersQueue: [], roundGuesses: [],
    
    // LÓGICA DE NÃO REPETIÇÃO
    activeDeck: [],   // Baralho que vai diminuindo
    originalDeck: []  // Cópia de segurança para reiniciar se acabar
};

// --- FUNÇÕES DE NAVEGAÇÃO E SETUP ---

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Função para escolher o modo na Tela Inicial
function selectGameMode(mode) {
    if (mode === 'normal') {
        // MUDANÇA: Salva no original e no ativo
        state.originalDeck = [...DEFAULT_CARDS];
        state.activeDeck = [...DEFAULT_CARDS];
        
        updatePlayerInputs(); 
        showScreen('screen-setup-players');
    } else if (mode === 'custom') {
        const container = document.getElementById('custom-pairs-container');
        container.innerHTML = '';
        addCustomRow();
        addCustomRow();
        addCustomRow();
        showScreen('screen-custom-setup');
    }
}

function addCustomRow() {
    const container = document.getElementById('custom-pairs-container');
    const div = document.createElement('div');
    div.className = "flex items-center gap-2 mb-3 fade-in-up"; 
    
    div.innerHTML = `
        <input type="text" class="custom-word-l w-1/2 p-3 rounded-xl bg-white text-gray-800 font-bold placeholder-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Ex: Quente">
        <span class="text-white font-black text-xl">-</span>
        <input type="text" class="custom-word-r w-1/2 p-3 rounded-xl bg-white text-gray-800 font-bold placeholder-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Ex: Frio">
    `;
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function processCustomWords() {
    const leftInputs = document.querySelectorAll('.custom-word-l');
    const rightInputs = document.querySelectorAll('.custom-word-r');
    const customCards = [];

    for (let i = 0; i < leftInputs.length; i++) {
        const l = leftInputs[i].value.trim();
        const r = rightInputs[i].value.trim();

        if (l && r) {
            customCards.push({ l: l, r: r });
        }
    }

    if (customCards.length < 1) {
        alert("Preencha pelo menos 1 par de palavras completo!");
        return;
    }

    // MUDANÇA: Salva no original e no ativo
    state.originalDeck = [...customCards];
    state.activeDeck = [...customCards];
    
    updatePlayerInputs();
    showScreen('screen-setup-players');
}

// MUDANÇA PRINCIPAL: Geração do <select> de emojis
function updatePlayerInputs() {
    const val = document.getElementById('num-players').value;
    document.getElementById('display-players').innerText = val;
    const count = parseInt(val);
    const container = document.getElementById('players-inputs');
    container.innerHTML = '';

    for(let i=0; i<count; i++) {
        const playerColor = PLAYER_COLORS[i % PLAYER_COLORS.length];
        const delay = i * 0.05;
        
        // Gera as opções do <select> e pré-seleciona uma diferente para cada jogador
        let optionsHtml = '';
        EMOJI_LIST.forEach((emoji, idx) => {
            // Lógica para distribuir emojis diferentes inicialmente
            const isSelected = idx === (i % EMOJI_LIST.length) ? 'selected' : '';
            optionsHtml += `<option value="${emoji}" ${isSelected}>${emoji}</option>`;
        });

        container.innerHTML += `
        <div class="fade-in-up flex items-center bg-white p-2 pr-3 rounded-2xl shadow-sm border border-gray-100" style="animation-delay: ${delay}s">
            <div class="relative w-12 h-12 mr-3 shrink-0">
                <select id="p-emoji-${i}" 
                        class="w-full h-full text-2xl text-center appearance-none border-none bg-transparent cursor-pointer focus:outline-none"
                        style="background-color: ${playerColor}20; color: ${playerColor}; border-radius: 0.75rem;">
                    ${optionsHtml}
                </select>
                </div>

            <div class="flex-1">
                <input type="text" id="p-name-${i}" value="Player ${i+1}" 
                       class="w-full bg-transparent border-none p-0 text-gray-800 font-bold focus:ring-0 placeholder-gray-300 outline-none" 
                       style="color: ${playerColor}" placeholder="Nome">
            </div>
        </div>`;
    }
}

function goToSetupRounds() {
    const count = parseInt(document.getElementById('num-players').value);
    state.players = [];
    state.scores = [];
    for(let i=0; i<count; i++) {
        state.players.push(document.getElementById(`p-name-${i}`).value);
        state.scores.push(0);
    }
    showScreen('screen-setup-rounds');
}

function updateRoundDisplay() {
    document.getElementById('display-rounds').innerText = document.getElementById('range-rounds').value;
}

function startGame() {
    state.totalRounds = parseInt(document.getElementById('range-rounds').value);
    state.currentRound = 1;
    state.turnIndex = 0;
    startRound();
}

// --- LÓGICA DA RODADA ---

function startRound() {
    if (state.currentRound > state.totalRounds) { endGame(); return; }
    
    // Agora o alvo pode cair em qualquer lugar (0 a 180)
    state.targetAngle = Math.floor(Math.random() * 181);
    
    // --- LÓGICA DE NÃO REPETIÇÃO ---
    
    // 1. Se o baralho acabou, recarrega do original
    if (state.activeDeck.length === 0) {
        state.activeDeck = [...state.originalDeck];
        // Opcional: Avisar o usuário se quiser
        // alert("Todas as cartas foram usadas! Reembaralhando...");
    }

    // 2. Sorteia um índice baseado no tamanho ATUAL do baralho
    const randIdx = Math.floor(Math.random() * state.activeDeck.length);

    // 3. Pega a carta e REMOVE ela do baralho usando splice
    // splice retorna um array, pegamos o primeiro item [0]
    state.currentCard = state.activeDeck.splice(randIdx, 1)[0];

    // --------------------------------

    state.guessersQueue = [];
    state.roundGuesses = []; 
    
    for(let i=0; i < state.players.length; i++) {
        if(i !== state.turnIndex) {
            state.guessersQueue.push(i);
        }
    }

    const txt = `RODADA ${state.currentRound} / ${state.totalRounds}`;
    ['1','2','3'].forEach(i => document.getElementById(`round-indicator-${i}`).innerText = txt);
    
    const giverEl = document.getElementById('clue-giver-name');
    giverEl.innerText = state.players[state.turnIndex];
    giverEl.style.color = PLAYER_COLORS[state.turnIndex % PLAYER_COLORS.length];
    giverEl.style.textShadow = `0 2px 10px ${PLAYER_COLORS[state.turnIndex % PLAYER_COLORS.length]}`;

    document.getElementById('card-display-1').innerHTML = `${state.currentCard.l} <span class="text-gray-300 mx-2">/</span> ${state.currentCard.r}`;
    
    showScreen('screen-clue-start');
}

function showTargetScreen() {
    drawTargetZones(state.targetAngle, 'target-zones-group');
    document.getElementById('word-left-1').innerText = state.currentCard.l;
    document.getElementById('word-right-1').innerText = state.currentCard.r;
    showScreen('screen-see-target');
}

function goToPassDevice() { 
    const nextPlayerIndex = state.guessersQueue[0]; 
    const nextName = state.players[nextPlayerIndex];
    const color = PLAYER_COLORS[nextPlayerIndex % PLAYER_COLORS.length];
    
    const el = document.getElementById('pass-instruction');
    el.innerText = nextName;
    el.style.color = color;
    el.style.textShadow = "0 0 20px rgba(0,0,0,0.5)"; 

    showScreen('screen-pass'); 
}

function goToGuess() {
    const currentGuesserIndex = state.guessersQueue[0];
    const guesserName = state.players[currentGuesserIndex];
    const color = PLAYER_COLORS[currentGuesserIndex % PLAYER_COLORS.length];

    state.guessAngle = 90; 

    const nameEl = document.getElementById('guesser-name');
    nameEl.innerText = guesserName;
    nameEl.style.color = color;

    document.getElementById('word-left-2').innerText = state.currentCard.l;
    document.getElementById('word-right-2').innerText = state.currentCard.r;
    
    updateNeedleVisual(state.guessAngle, 'needle-group');

    const btn = document.getElementById('btn-submit-guess');
    if (state.guessersQueue.length > 1) {
        btn.innerText = "Confirmar e Passar ➔";
    } else {
        btn.innerText = "Confirmar e Revelar ✨";
    }

    showScreen('screen-guess');
}

function handleGuessAction() {
    const currentPlayerIdx = state.guessersQueue[0];
    state.roundGuesses.push({
        playerIdx: currentPlayerIdx,
        angle: state.guessAngle
    });

    state.guessersQueue.shift();

    if (state.guessersQueue.length > 0) {
        goToPassDevice();
    } else {
        revealResult();
    }
}

function revealResult() {
    drawTargetZones(state.targetAngle, 'target-zones-result');
    
    const needleGroup = document.getElementById('needle-result');
    needleGroup.innerHTML = ''; 

    let pointsText = "";
    let totalPoints = 0;

    state.roundGuesses.forEach((guess) => {
        const diff = Math.abs(state.targetAngle - guess.angle);
        let pts = 0;
        
        if (diff <= 4) pts = 4;        
        else if (diff <= 12) pts = 3;  
        else if (diff <= 20) pts = 2;  
        else pts = 0;

        state.scores[guess.playerIdx] += pts;
        
        const color = PLAYER_COLORS[guess.playerIdx % PLAYER_COLORS.length];

        createNeedleInResult(needleGroup, guess.angle, state.players[guess.playerIdx], color);

        pointsText += `
        <div class="flex items-center justify-between bg-white/10 p-2 rounded-lg mb-2 border border-white/10">
             <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" style="background-color:${color}"></div>
                <span class="font-bold text-sm text-white">${state.players[guess.playerIdx]}</span>
             </div>
             <span class="font-black text-xl text-white">+${pts}</span>
        </div>`;
        totalPoints += pts;
    });

    const card = document.getElementById('score-card');
    
    document.getElementById('result-text').innerText = totalPoints > 0 ? "PONTUAÇÃO" : "ZERO";
    document.getElementById('result-player-name').innerText = "";
    document.getElementById('result-points').innerHTML = `<div class="mt-4 text-left">${pointsText}</div>`;
    
    showScreen('screen-result');
}

function createNeedleInResult(parentGroup, angle, playerName, color) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.style.transformOrigin = "bottom center";
    g.style.transformBox = "fill-box"; 
    g.style.transform = `rotate(${angle - 90}deg)`;
    g.style.transition = "transform 1s ease-out";

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "100");
    line.setAttribute("y1", "100");
    line.setAttribute("x2", "100");
    line.setAttribute("y2", "10");
    line.setAttribute("stroke", color); 
    line.setAttribute("stroke-width", "2"); 
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("opacity", "0.9"); 
    
    g.appendChild(line);
    parentGroup.appendChild(g);

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "100");
    circle.setAttribute("cy", "100");
    circle.setAttribute("r", "3");
    circle.setAttribute("fill", color); 
    circle.setAttribute("stroke", "white");
    circle.setAttribute("stroke-width", "1");
    parentGroup.appendChild(circle);
}

function nextRound() {
    state.currentRound++;
    state.turnIndex = (state.turnIndex + 1) % state.players.length;
    startRound();
}

function endGame() {
    const c = document.getElementById('final-scores');
    c.innerHTML = '';
    
    const sortedIndices = state.players.map((_, i) => i).sort((a, b) => state.scores[b] - state.scores[a]);

    sortedIndices.forEach((idx, rank) => {
        const p = state.players[idx];
        const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
        const icon = rank === 0 ? '👑' : `${rank + 1}.`;

        c.innerHTML += `
        <div class="glass-card p-4 flex justify-between items-center mb-2 relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-2" style="background-color: ${color}"></div>
            <div class="flex items-center gap-3 pl-2">
                <span class="text-2xl">${icon}</span> 
                <span class="font-bold text-lg text-gray-800">${p}</span>
            </div>
            <span class="text-3xl font-black" style="color: ${color}">${state.scores[idx]}</span>
        </div>`;
    });
    showScreen('screen-end');
}

// --- LÓGICA GRÁFICA (SVG) ---

function polarToCartesian(cx, cy, r, deg) {
    const rad = (deg + 180) * Math.PI / 180.0;
    return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
}

function drawTargetZones(centerDeg, groupId) {
    const group = document.getElementById(groupId);
    group.innerHTML = '';

    const w4 = 8; const w3 = 8; const w2 = 8;  
    
    drawWedge(group, centerDeg, w4, '#ef4444', '4'); 
    drawWedge(group, centerDeg + (w4/2 + w3/2), w3, '#f97316', '3'); 
    drawWedge(group, centerDeg - (w4/2 + w3/2), w3, '#f97316', '3'); 
    drawWedge(group, centerDeg + (w4/2 + w3 + w2/2), w2, '#eab308', '2'); 
    drawWedge(group, centerDeg - (w4/2 + w3 + w2/2), w2, '#eab308', '2'); 
}

function drawWedge(parent, angle, width, color, label) {
    const rOut = 90;
    const start = polarToCartesian(100, 100, rOut, angle - width/2);
    const end = polarToCartesian(100, 100, rOut, angle + width/2);

    const d = ["M", 100, 100, "L", start.x, start.y, "A", rOut, rOut, 0, 0, 1, end.x, end.y, "Z"].join(" ");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", color);
    parent.appendChild(path);

    if (label) {
        const txtPos = polarToCartesian(100, 100, 78, angle); 
        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", txtPos.x);
        txt.setAttribute("y", txtPos.y);
        txt.textContent = label;
        txt.setAttribute("class", "score-label");
        parent.appendChild(txt);
    }
}

function updateNeedleVisual(deg, elId) {
    const el = document.getElementById(elId);
    if(el) el.style.transform = `rotate(${deg - 90}deg)`;
}

// --- INTERAÇÃO ---

const gc = document.getElementById('interactive-gauge');
let dragging = false;

function handleDrag(e) {
    if (!dragging) return;
    e.preventDefault();
    const rect = gc.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - (rect.width/2);
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top - rect.height;
    
    let deg = Math.atan2(y, x) * (180 / Math.PI) + 180;
    state.guessAngle = Math.max(0, Math.min(180, deg));
    updateNeedleVisual(state.guessAngle, 'needle-group');
}

gc.addEventListener('mousedown', (e) => { dragging = true; handleDrag(e); });
gc.addEventListener('touchstart', (e) => { dragging = true; handleDrag(e); });
window.addEventListener('mousemove', (e) => { if(dragging) handleDrag(e); });
window.addEventListener('touchmove', (e) => { if(dragging) handleDrag(e); }, {passive:false});
window.addEventListener('mouseup', () => dragging = false);
window.addEventListener('touchend', () => dragging = false);

// Inicialização: Se alguém der F5 no meio, garante inputs limpos ou volta pra home
showScreen('screen-home');