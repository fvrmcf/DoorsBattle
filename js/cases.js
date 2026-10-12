/**
 * CASES.JS
 * Логика открытия кейсов: рендер списка, рулетка, выбор предмета по шансам.
 */

const CasesModule = {
    currentCase: null,
    isSpinning: false,

    grid: document.querySelector('[data-cases-grid]'),
    roulette: document.querySelector('[data-roulette]'),
    openBtn: document.querySelector('[data-open-btn]'),

    init() {
        this.renderCasesList();
        this.openBtn.addEventListener('click', () => this.spin());

        document.querySelector('[data-close-modal]').addEventListener('click', () => {
            if (!this.isSpinning) UI.closeModal('case');
        });

        document.querySelector('[data-continue-btn]').addEventListener('click', () => {
            UI.closeModal('result');
        });

        document.querySelector('[data-sell-result]').addEventListener('click', () => {
            if (this._pendingItem) {
                InventoryModule.sellSpecificItem(this._pendingItem);
                this._pendingItem = null;
            }
            UI.closeModal('result');
        });
    },

    renderCasesList() {
        this.grid.innerHTML = '';
        CASES.forEach(c => {
            const card = document.createElement('div');
            card.className = `case-card rarity-${c.rarityClass}`;
            card.dataset.caseId = c.id;
            card.innerHTML = `
                <div class="case-card__icon">${c.icon}</div>
                <div class="case-card__name">${c.name}</div>
                <div class="case-card__price">🪙 ${c.price}</div>
            `;
            card.addEventListener('click', () => this.openModal(c));
            this.grid.appendChild(card);
        });
    },

    openModal(caseData) {
        this.currentCase = caseData;
        document.querySelector('[data-modal-case-name]').textContent = caseData.name;
        document.querySelector('[data-open-price]').textContent = caseData.price;
        UI.openModal('case');
        this.buildRoulette(null);
    },

    // Выбор случайного предмета согласно таблице шансов
    rollItem(chances) {
        const rand = Math.random() * 100;
        let acc = 0;
        let chosenRarity = RARITY_ORDER[0];

        for (const rarity of RARITY_ORDER) {
            const chance = chances[rarity] || 0;
            acc += chance;
            if (rand <= acc) {
                chosenRarity = rarity;
                break;
            }
        }

        const pool = ITEMS_POOL[chosenRarity];
        const base = pool[Math.floor(Math.random() * pool.length)];
        return { ...base, rarity: chosenRarity, uid: Date.now() + Math.random() };
    },

    buildRoulette(winningItem) {
        this.roulette.innerHTML = '';
        this.roulette.style.transition = 'none';
        this.roulette.style.transform = 'translateX(0)';

        const totalItems = 40;
        const winIndex = 32;

        for (let i = 0; i < totalItems; i++) {
            const item = (i === winIndex && winningItem)
                ? winningItem
                : this.rollItem(this.currentCase.chances);

            const div = document.createElement('div');
            div.className = `roulette-item rarity-${item.rarity}`;
            div.innerHTML = `
                <div class="roulette-item__icon">${item.icon}</div>
                <div class="roulette-item__name">${item.name}</div>
            `;
            this.roulette.appendChild(div);
        }

        return { winIndex };
    },

    spin() {
        if (this.isSpinning) return;

        const balance = Storage.getBalance();
        if (balance < this.currentCase.price) {
            UI.showToast('Недостаточно монет!');
            return;
        }

        this.isSpinning = true;
        this.openBtn.disabled = true;

        const newBalance = balance - this.currentCase.price;
        Storage.setBalance(newBalance);
        UI.updateBalance(newBalance);

        const stats = Storage.getStats();
        stats.totalSpent += this.currentCase.price;
        Storage.setStats(stats);

        const winningItem = this.rollItem(this.currentCase.chances);
        const { winIndex } = this.buildRoulette(winningItem);

        const itemWidth = 146;

        setTimeout(() => {
            const containerWidth = this.roulette.parentElement.offsetWidth;
            const targetPos = (winIndex * itemWidth) - (containerWidth / 2) + (itemWidth / 2);
            const randomOffset = (Math.random() - 0.5) * 40;

            this.roulette.style.transition = `transform var(--spin-duration) cubic-bezier(0.1, 0.7, 0.3, 1)`;
            this.roulette.style.transform = `translateX(-${targetPos + randomOffset}px)`;

            setTimeout(() => this.finishSpin(winningItem), 5200);
        }, 50);
    },

    finishSpin(item) {
        this.isSpinning = false;
        this.openBtn.disabled = false;

        InventoryModule.addItem(item);
        this.updateStatsForItem(item);

        UI.closeModal('case');
        this.showResult(item);
    },

    updateStatsForItem(item) {
        const stats = Storage.getStats();
        stats.casesOpened += 1;
        stats[`${item.rarity}Count`] = (stats[`${item.rarity}Count`] || 0) + 1;
        Storage.setStats(stats);

        AchievementsModule.checkAll(stats);
    },

    showResult(item) {
        this._pendingItem = item;
        const resultItem = document.querySelector('[data-result-item]');
        resultItem.className = `result-item rarity-${item.rarity}`;
        resultItem.innerHTML = `
            <span class="result-item__icon">${item.icon}</span>
            <span class="result-item__name">${item.name}</span>
            <span class="result-item__rarity">${UI.rarityLabel(item.rarity)}</span>
            <span class="result-item__value">🪙 ${item.value}</span>
        `;
        UI.openModal('result');
    }
};