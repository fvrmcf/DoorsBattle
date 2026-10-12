/**
 * UPGRADE.JS
 * Система апгрейда с круговым колесом фортуны.
 */

const UpgradeModule = {
    sourceItem: null,
    targetItem: null,
    isRolling: false,
    wheelRotation: 0,

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

    updateWheelVisual() {
        const chance = this.calculateChance();
        this.chanceEl.textContent = `${chance.toFixed(1)}%`;

        this.wheel.style.background = `conic-gradient(
            from 0deg,
            #00ff88 0%,
            #00ff88 ${chance}%,
            #ff3344 ${chance}%,
            #ff3344 100%
        )`;

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
        const success = Math.random() * 100 <= chance;

        this.spinWheel(chance, success, () => {
            this.resolveUpgrade(success);
        });
    },

    spinWheel(chance, success, onComplete) {
        SoundModule.upgradeSpin();

        let theta;
        if (success) {
            theta = Math.random() * (chance * 3.6);
        } else {
            theta = chance * 3.6 + Math.random() * ((100 - chance) * 3.6);
        }

        const extraSpins = 5 + Math.floor(Math.random() * 3);
        const targetRotation = this.wheelRotation + extraSpins * 360 + (360 - theta);

        this.wheelRotation = targetRotation;

        this.wheel.style.transition = 'transform 4s cubic-bezier(0.15, 0.8, 0.2, 1)';
        this.wheel.style.transform = `rotate(${targetRotation}deg)`;

        let tickDelay = 60;
        let elapsed = 0;
        const tickLoop = () => {
            if (elapsed >= 3800) return;
            SoundModule.tick();
            elapsed += tickDelay;
            tickDelay *= 1.1;
            setTimeout(tickLoop, tickDelay);
        };
        tickLoop();

        setTimeout(() => {
            onComplete();
        }, 4100);
    },

    resolveUpgrade(success) {
        InventoryModule.removeItemByUid(this.sourceItem.uid);

        const stats = Storage.getStats();
        stats.upgradesAttempted += 1;

        if (success) {
            const wonItem = { ...this.targetItem, uid: Date.now() + Math.random() };
            InventoryModule.addItem(wonItem);
            stats.upgradesWon += 1;
            stats[`${wonItem.rarity}Count`] = (stats[`${wonItem.rarity}Count`] || 0) + 1;

            SoundModule.upgradeWin();
            UI.showToast(`✅ Успех! Вы получили: ${wonItem.name}`);

            if (wonItem.rarity === 'legendary' || wonItem.rarity === 'mythic') {
                CasesModule.triggerLegendaryEffect(wonItem.rarity);
            }
        } else {
            stats.upgradesLost += 1;
            SoundModule.upgradeLose();
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
    }
};
