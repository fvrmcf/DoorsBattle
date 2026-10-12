/**
 * INVENTORY.JS
 * Управление инвентарём: добавление, удаление, продажа предметов.
 */

const InventoryModule = {
    grid: document.querySelector('[data-inventory-grid]'),
    countEl: document.querySelector('[data-inventory-count]'),

    init() {
        document.querySelector('[data-sell-all]').addEventListener('click', () => {
            SoundModule.click();
            this.sellJunk();
        });
    },

    addItem(item) {
        const inventory = Storage.getInventory();
        item.uid = item.uid || (Date.now() + Math.random());
        inventory.push(item);
        Storage.setInventory(inventory);
    },

    removeItemByUid(uid) {
        const inventory = Storage.getInventory().filter(i => i.uid !== uid);
        Storage.setInventory(inventory);
    },

    sellSpecificItem(item) {
        this.removeItemByUid(item.uid);
        const balance = Storage.getBalance() + item.value;
        Storage.setBalance(balance);
        UI.updateBalance(balance);

        const stats = Storage.getStats();
        stats.itemsSold += 1;
        Storage.setStats(stats);

        SoundModule.click();
        UI.showToast(`Продано за 🪙 ${item.value}`);
        this.render();
    },

    sellJunk() {
        const inventory = Storage.getInventory();
        const junk = inventory.filter(i => i.rarity === 'common' || i.rarity === 'uncommon');

        if (junk.length === 0) {
            UI.showToast('Нет предметов для продажи');
            return;
        }

        const totalValue = junk.reduce((sum, i) => sum + i.value, 0);
        const remaining = inventory.filter(i => i.rarity !== 'common' && i.rarity !== 'uncommon');

        Storage.setInventory(remaining);

        const balance = Storage.getBalance() + totalValue;
        Storage.setBalance(balance);
        UI.updateBalance(balance);

        const stats = Storage.getStats();
        stats.itemsSold += junk.length;
        Storage.setStats(stats);

        UI.showToast(`Продано ${junk.length} предметов за 🪙 ${totalValue}`);
        this.render();
    },

    render() {
        const inventory = Storage.getInventory();
        this.countEl.textContent = `${inventory.length} предметов`;
        this.grid.innerHTML = '';

        if (inventory.length === 0) {
            this.grid.innerHTML = '<div class="empty-hint">Инвентарь пуст. Откройте кейс!</div>';
            return;
        }

        [...inventory].reverse().forEach(item => {
            const el = document.createElement('div');
            el.className = `inventory-item rarity-${item.rarity}`;
            el.innerHTML = `
                <div class="inventory-item__icon">${item.icon}</div>
                <div class="inventory-item__name">${item.name}</div>
                <div class="inventory-item__value">🪙 ${item.value}</div>
                <button class="inventory-item__sell" data-sell-uid="${item.uid}">Продать</button>
            `;
            this.grid.appendChild(el);
        });

        this.grid.querySelectorAll('[data-sell-uid]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const uid = parseFloat(e.target.dataset.sellUid);
                const item = Storage.getInventory().find(i => i.uid === uid);
                if (item) this.sellSpecificItem(item);
            });
        });
    }
};
