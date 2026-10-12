/**
 * UPGRADE.JS
 * Система апгрейда предметов: ставишь дешёвый предмет, пытаешься получить дорогой.
 * Шанс успеха = (value_source / value_target) * houseEdge, ограничен min/max.
 */

const UpgradeModule = {
    sourceItem: null,
    targetItem: null,
    isRolling: false,

    sourceSlot: document.querySelector('[data-slot="source"]'),
    targetSlot: document.querySelector('[data-slot="target"]'),
    sourceList: document.querySelector('[data-upgrade-source-list]'),
    targetList: document.querySelector('[data-upgrade-target-list]'),
    fillEl: document.querySelector('[data-upgrade-fill]'),
    chanceEl: document.querySelector('[data-upgrade-chance]'),
    multiplierEl: document.querySelector('[data-upgrade-multiplier]'),
    upgradeBtn: document.querySelector('[data-upgrade-btn]'),

    init() {
        this.upgradeBtn.addEventListener('click', () => this.attemptUpgrade());
    },

    // Вызывается при переходе на вкладку "Апгрейд"
    render() {
        this.renderSourceList();
        this.renderTargetList();
        this.updateWheel();
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
                this.sourceItem = item;
                this.renderSlot('source', item);
                this.renderTargetList(); // обновляем доступные цели
                this.updateWheel();
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

        // Собираем все возможные предметы из пула дороже source, но не более maxMultiplier раз
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
            this.targetList.innerHTML = '<p class="empty-hint">Нет доступных целей для апгрейда</p>';
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
                this.targetItem = item;
                this.renderSlot('target', item);
                this.updateWheel();
            });
            this.targetList.appendChild(el);
        });
    },

    renderSlot(type, item) {
        const slot = type === 'source' ? this.sourceSlot : this.targetSlot;
        slot.className = `upgrade-slot rarity-${item.rarity}`;
        slot.innerHTML = `
            <span class="upgrade-slot__icon">${item.icon}</span>
            <span class="upgrade-slot__name">${item.name}</span>
            <span class="upgrade-slot__value">🪙 ${item.value}</span>
        `;
    },

    calculateChance() {
        if (!this.sourceItem || !this.targetItem) return 0;

        const rawChance = (this.sourceItem.value / this.targetItem.value) * 100;
        const adjustedChance = rawChance * UPGRADE_CONFIG.houseEdge;

        return Math.min(
            UPGRADE_CONFIG.maxChance,
            Math.max(UPGRADE_CONFIG.minChance, adjustedChance)
        );
    },

    updateWheel() {
        const chance = this.calculateChance();
        this.fillEl.style.width = `${chance}%`;
        this.chanceEl.textContent = `${chance.toFixed(1)}%`;

        if (this.targetItem && this.sourceItem) {
            const multiplier = this.targetItem.value / this.sourceItem.value;
            this.multiplierEl.textContent = `x${multiplier.toFixed(2)}`;
        } else {
            this.multiplierEl.textContent = 'x0.00';
        }

        this.upgradeBtn.disabled = !(this.sourceItem && this.targetItem) || this.isRolling;
    },

    attemptUpgrade() {
        if (this.isRolling || !this.sourceItem || !this.targetItem) return;

        this.isRolling = true;
        this.upgradeBtn.disabled = true;

        const chance = this.calculateChance();
        const roll = Math.random() * 100;
        const success = roll <= chance;

        const stats = Storage.getStats();
        stats.upgradesAttempted += 1;

        // Анимация стрелки/заливки (псевдо-вращение)
        this.animatePointer(() => {
            // Удаляем исходный предмет из инвентаря в любом случае
            InventoryModule.removeItemByUid(this.sourceItem.uid);

            if (success) {
                const wonItem = { ...this.targetItem, uid: Date.now() + Math.random() };
                InventoryModule.addItem(wonItem);
                stats.upgradesWon += 1;
                stats[`${wonItem.rarity}Count`] = (stats[`${wonItem.rarity}Count`] || 0) + 1;
                UI.showToast(`✅ Успех! Вы получили: ${wonItem.name}`);
            } else {
                stats.upgradesLost += 1;
                UI.showToast(`❌ Неудача! Предмет потерян.`);
            }

            Storage.setStats(stats);
            AchievementsModule.checkAll(stats);

            this.sourceItem = null;
            this.targetItem = null;
            this.sourceSlot.innerHTML = '<span class="upgrade-slot__placeholder">Выберите предмет</span>';
            this.targetSlot.innerHTML = '<span class="upgrade-slot__placeholder">Выберите предмет</span>';
            this.sourceSlot.className = 'upgrade-slot';
            this.targetSlot.className = 'upgrade-slot';

            this.isRolling = false;
            this.render();
        });
    },

    // Простая анимация — "дрожание" стрелки перед результатом
    animatePointer(callback) {
        const pointer = document.querySelector('.upgrade-wheel__pointer');
        pointer.classList.add('spinning');
        setTimeout(() => {
            pointer.classList.remove('spinning');
            callback();
        }, 1500);
    }
};