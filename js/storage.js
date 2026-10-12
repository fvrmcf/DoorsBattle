/**
 * STORAGE.JS
 * Вся работа с localStorage централизована здесь.
 */

const STORAGE_KEYS = {
    balance: 'doors_balance',
    inventory: 'doors_inventory',
    stats: 'doors_stats',
    lastBonus: 'doors_last_bonus',
    achievements: 'doors_achievements'
};

const Storage = {
    getBalance() {
        return parseInt(localStorage.getItem(STORAGE_KEYS.balance)) || 1000;
    },
    setBalance(value) {
        localStorage.setItem(STORAGE_KEYS.balance, value);
    },

    getInventory() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.inventory)) || [];
    },
    setInventory(inv) {
        localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inv));
    },

    getStats() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.stats)) || {
            casesOpened: 0,
            totalSpent: 0,
            commonCount: 0,
            uncommonCount: 0,
            rareCount: 0,
            epicCount: 0,
            legendaryCount: 0,
            mythicCount: 0,
            upgradesAttempted: 0,
            upgradesWon: 0,
            upgradesLost: 0,
            itemsSold: 0
        };
    },
    setStats(stats) {
        localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
    },

    getLastBonus() {
        return localStorage.getItem(STORAGE_KEYS.lastBonus);
    },
    setLastBonus(date) {
        localStorage.setItem(STORAGE_KEYS.lastBonus, date);
    },

    getUnlockedAchievements() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.achievements)) || [];
    },
    setUnlockedAchievements(list) {
        localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(list));
    },

    resetAll() {
        Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    }
};