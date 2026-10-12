// ===== ДАННЫЕ =====

// Предметы по редкости
const itemsPool = {
    common: [
        { name: "Обычная дверь", icon: "🚪" },
        { name: "Ключ", icon: "🔑" },
        { name: "Фонарик", icon: "🔦" },
        { name: "Свеча", icon: "🕯️" },
    ],
    rare: [
        { name: "Фигура", icon: "👤" },
        { name: "Печенье", icon: "🍪" },
        { name: "Книга тайн", icon: "📖" },
        { name: "Старый замок", icon: "🔒" },
    ],
    epic: [
        { name: "Хальт", icon: "👹" },
        { name: "Призрак", icon: "👻" },
        { name: "Скример", icon: "😱" },
        { name: "Темная сущность", icon: "🌑" },
    ],
    legendary: [
        { name: "Figure (Босс)", icon: "💀" },
        { name: "Seek", icon: "🌊" },
        { name: "A-60", icon: "⚡" },
        { name: "Jack (Редкий)", icon: "🃏" },
    ]
};

// Шансы выпадения (в сумме 100)
const rarityChances = {
    common: 60,
    rare: 25,
    epic: 12,
    legendary: 3
};

// Кейсы
const cases = [
    {
        id: 1,
        name: "Стартовый кейс",
        icon: "📦",
        price: 100,
        class: "common",
        chances: { common: 70, rare: 22, epic: 7, legendary: 1 }
    },
    {
        id: 2,
        name: "Редкий кейс",
        icon: "🎁",
        price: 300,
        class: "rare",
        chances: { common: 45, rare: 35, epic: 15, legendary: 5 }
    },
    {
        id: 3,
        name: "Эпический кейс",
        icon: "💎",
        price: 600,
        class: "epic",
        chances: { common: 25, rare: 35, epic: 30, legendary: 10 }
    },
    {
        id: 4,
        name: "Легендарный кейс",
        icon: "👑",
        price: 1000,
        class: "legendary",
        chances: { common: 10, rare: 25, epic: 40, legendary: 25 }
    }
];

// ===== СОСТОЯНИЕ =====
let balance = parseInt(localStorage.getItem('doors_balance')) || 1000;
let inventory = JSON.parse(localStorage.getItem('doors_inventory')) || [];
let currentCase = null;
let isSpinning = false;

// ===== DOM =====
const balanceEl = document.getElementById('balance');
const casesGrid = document.getElementById('casesGrid');
const inventoryEl = document.getElementById('inventory');
const modalOverlay = document.getElementById('modalOverlay');
const resultOverlay = document.getElementById('resultOverlay');
const roulette = document.getElementById('roulette');
const openBtn = document.getElementById('openBtn');
const toast = document.getElementById('toast');

// ===== ИНИЦИАЛИЗАЦИЯ =====
function init() {
    updateBalance();
    renderCases();
    renderInventory();
    setupEvents();
}

function updateBalance() {
    balanceEl.textContent = balance;
    localStorage.setItem('doors_balance', balance);
}

function renderCases() {
    casesGrid.innerHTML = '';
    cases.forEach(c => {
        const card = document.createElement('div');
        card.className = `case-card ${c.class}`;
        card.innerHTML = `
            <div class="case-icon">${c.icon}</div>
            <div class="case-name">${c.name}</div>
            <div class="case-price">🪙 ${c.price}</div>
        `;
        card.addEventListener('click', () => openCaseModal(c));
        casesGrid.appendChild(card);
    });
}

function renderInventory() {
    inventoryEl.innerHTML = '';
    if (inventory.length === 0) {
        inventoryEl.innerHTML = '<div class="empty-inv">Инвентарь пуст. Открой кейс!</div>';
        return;
    }
    // Показываем последние предметы первыми
    [...inventory].reverse().forEach(item => {
        const div = document.createElement('div');
        div.className = `inv-item rarity-${item.rarity}`;
        div.innerHTML = `
            <div class="icon">${item.icon}</div>
            <div class="name">${item.name}</div>
        `;
        inventoryEl.appendChild(div);
    });
}

// ===== ЛОГИКА КЕЙСОВ =====
function getRandomItem(chances) {
    const rand = Math.random() * 100;
    let acc = 0;
    let selectedRarity = 'common';
    
    for (const [rarity, chance] of Object.entries(chances)) {
        acc += chance;
        if (rand <= acc) {
            selectedRarity = rarity;
            break;
        }
    }
    
    const pool = itemsPool[selectedRarity];
    const item = pool[Math.floor(Math.random() * pool.length)];
    return { ...item, rarity: selectedRarity };
}

function openCaseModal(caseData) {
    currentCase = caseData;
    document.getElementById('modalCaseName').textContent = caseData.name;
    document.getElementById('openPrice').textContent = caseData.price;
    modalOverlay.classList.add('active');
    buildRouletteItems(null);
}

function buildRouletteItems(winningItem) {
    roulette.innerHTML = '';
    roulette.style.transform = 'translateX(0)';
    roulette.style.transition = 'none';
    
    const itemWidth = 146; // width + margins
    const totalItems = 40;
    const winIndex = 32; // позиция выигрышного элемента
    
    for (let i = 0; i < totalItems; i++) {
        let itemData;
        if (i === winIndex && winningItem) {
            itemData = winningItem;
        } else {
            itemData = getRandomItem(currentCase.chances);
        }
        
        const div = document.createElement('div');
        div.className = `roulette-item rarity-${itemData.rarity}`;
        div.innerHTML = `
            <div class="icon">${itemData.icon}</div>
            <div class="name">${itemData.name}</div>
        `;
        roulette.appendChild(div);
    }
    
    return { itemWidth, winIndex };
}

function spinRoulette() {
    if (isSpinning) return;
    
    if (balance < currentCase.price) {
        showToast('Недостаточно монет!');
        return;
    }
    
    isSpinning = true;
    openBtn.disabled = true;
    
    balance -= currentCase.price;
    updateBalance();
    
    const winningItem = 
