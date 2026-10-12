/**
 * UPGRADE.JS
 * Система апгрейда с круговым колесом фортуны (как рулетка со стрелкой).
 */

const UpgradeModule = {
    sourceItem: null,
    targetItem: null,
    isRolling: false,
    wheelRotation: 0, // накопленный угол поворота колеса

    sourceSlot: document.querySelector('[data-slot="source"]'),
    targetSlot: document.querySelector('[data-slot="target"]'),
    sourceList: document.querySelector('[data-upgrade-source-list]'),
    targetList: document.querySelector('[data-upgrade-target-list]'),
    wheel: document.querySelector('[data-upgrade-wheel-circle]'),
    chanceEl: document.querySelector('[data-upgrade-chance]'),
    multiplierEl: document.querySelector('[data-upgrade-multiplier]'),
    upgradeBtn: document.querySelector('[data-upgrade-btn]'),

    init() {
        this.upgradeBtn.addEventListener('click', () => this.attemptUpgrade());
    },

    render() {
        this.renderSourceList();
        this.renderTargetList();
        this.updateWheelVisual();
    },

    renderSourceList() {
        const inventory = Storage.getInventory();
        this.sourceList.innerHTML = '';

        if (inventory.length === 0) {
            this.sourceList.innerHTML = '<p class="empty-hint">Нет предметов для апгрейда</p>';
            return;
        }

        inventory.forEach(item => {
            const el = document.createElement('div');
            el.className = `upgrade-pick rarity-${item.rarity}`;
            el.innerHTML = `
                <span class="upgrade-pick__icon">${item.icon}</span>
                <span class="upgrade-pick__name">${item.name}</span>
                <span class="upgrade-pick__value">🪙 ${item.value}</span>
            `;
            el.addEventListener('click', () => {
                SoundModule.click();
                this.sourceItem = item;
                this.renderSlot('source', item);
                this.renderTargetList();
                this.updateWheelVisual();
            });
            this.sourceList.appendChild(el);
        });
    },

    renderTargetList() {
        this.targetList.innerHTML = '';

        if (!this.sourceItem) {
            this.targetList.innerHTML = '<p class="empty-hint">Сначала выберите свой предмет</p>';
            return;
        }

        const maxValue = this.sourceItem.value * UPGRADE_CONFIG.maxMultiplier;
        const candidates = [];

        Object.entries(ITEMS_POOL).forEach(([rarity, items]) => {
            items.forEach(item => {
                if (item.value > this.sourceItem.value && item.value <= maxValue) {
                    candidates.push({ ...item, rarity });
                }
            });
        });

        candidates.sort((a, b) => a.value - b.value);

        if (candidates.length === 0) {
            this.targetList.innerHTML = '<p class="empty-hint">Нет доступных целей</p>';
            return;
        }

        candidates.forEach(item => {
            const el = document.createElement('div');
            el.className = `upgrade-pick rarity-${item.rarity}`;
            el.innerHTML = `
                <span class="upgrade-pick__icon">${item.icon}</span>
                <span class="upgrade-pick__name">${item.name}</span>
                <span class="upgrade-pick__value">🪙 ${item.value}</span>
            `;
            el.addEventListener('click', () => {
                SoundModule.click();
                this.targetItem = item;
                this.renderSlot('target', item);
                this.updateWheelVisual();
            });
            this.targetList.appendChild(el);
        });
    },

    renderSlot(type, item) {
        const slot = 
