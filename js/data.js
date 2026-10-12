/**
 * DATA.JS
 * Все игровые данные: предметы, кейсы, редкости, конфиг апгрейда.
 */

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

const RARITY_LABELS = {
    common: 'Обычный',
    uncommon: 'Необычный',
    rare: 'Редкий',
    epic: 'Эпический',
    legendary: 'Легендарный',
    mythic: 'Мифический'
};

const ITEMS_POOL = {
    common: [
        { id: 'c1', name: 'Обычная дверь', icon: '🚪', value: 20 },
        { id: 'c2', name: 'Ключ', icon: '🔑', value: 15 },
        { id: 'c3', name: 'Фонарик', icon: '🔦', value: 25 },
        { id: 'c4', name: 'Свеча', icon: '🕯️', value: 10 },
    ],
    uncommon: [
        { id: 'u1', name: 'Аптечка', icon: '🩹', value: 60 },
        { id: 'u2', name: 'Батарейка', icon: '🔋', value: 50 },
        { id: 'u3', name: 'Записка', icon: '📝', value: 45 },
    ],
    rare: [
        { id: 'r1', name: 'Фигура', icon: '👤', value: 150 },
        { id: 'r2', name: 'Печенье', icon: '🍪', value: 130 },
        { id: 'r3', name: 'Книга тайн', icon: '📖', value: 170 },
        { id: 'r4', name: 'Старый замок', icon: '🔒', value: 160 },
    ],
    epic: [
        { id: 'e1', name: 'Хальт', icon: '👹', value: 400 },
        { id: 'e2', name: 'Призрак', icon: '👻', value: 380 },
        { id: 'e3', name: 'Скример', icon: '😱', value: 420 },
        { id: 'e4', name: 'Темная сущность', icon: '🌑', value: 450 },
    ],
    legendary: [
        { id: 'l1', name: 'Seek', icon: '🌊', value: 900 },
        { id: 'l2', name: 'A-60', icon: '⚡', value: 950 },
        { id: 'l3', name: 'Jack', icon: '🃏', value: 850 },
    ],
    mythic: [
        { id: 'm1', name: 'Figure (Босс)', icon: '💀', value: 2500 },
        { id: 'm2', name: 'The Knocker', icon: '🚬', value: 3000 },
    ]
};

const CASES = [
    {
        id: 1,
        name: 'Стартовый кейс',
        icon: '📦',
        price: 100,
        rarityClass: 'common',
        chances: { common: 65, uncommon: 22, rare: 10, epic: 2.5, legendary: 0.5, mythic: 0 }
    },
    {
        id: 2,
        name: 'Редкий кейс',
        icon: '🎁',
        price: 300,
        rarityClass: 'rare',
        chances: { common: 35, uncommon: 30, rare: 25, epic: 8, legendary: 1.8, mythic: 0.2 }
    },
    {
        id: 3,
        name: 'Эпический кейс',
        icon: '💎',
        price: 600,
        rarityClass: 'epic',
        chances: { common: 15, uncommon: 25, rare: 30, epic: 22, legendary: 6, mythic: 2 }
    },
    {
        id: 4,
        name: 'Легендарный кейс',
        icon: '👑',
        price: 1200,
        rarityClass: 'legendary',
        chances: { common: 5, uncommon: 15, rare: 25, epic: 35, legendary: 15, mythic: 5 }
    }
];

const UPGRADE_CONFIG = {
    houseEdge: 0.92,
    maxMultiplier: 8,
    minChance: 2,
    maxChance: 95
};

const ACHIEVEMENTS = [
    { id: 'first_case', name: 'Первый кейс', desc: 'Откройте свой первый кейс', check: s => s.casesOpened >= 1 },
    { id: 'ten_cases', name: 'Коллекционер', desc: 'Откройте 10 кейсов', check: s => s.casesOpened >= 10 },
    { id: 'fifty_cases', name: 'Ветеран', desc: 'Откройте 50 кейсов', check: s => s.casesOpened >= 50 },
    { id: 'first_legendary', name: 'Повезло!', desc: 'Получите легендарный предмет', check: s => s.legendaryCount >= 1 },
    { id: 'first_mythic', name: 'Джекпот', desc: 'Получите мифический предмет', check: s => s.mythicCount >= 1 },
    { id: 'first_upgrade', name: 'Рискнул', desc: 'Совершите первый апгрейд', check: s => s.upgradesAttempted >= 1 },
    { id: 'ten_upgrades_win', name: 'Мастер апгрейда', desc: 'Выиграйте 10 апгрейдов', check: s => s.upgradesWon >= 10 },
];
