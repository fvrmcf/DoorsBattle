/**
 * UI.JS
 * Общие вспомогательные функции интерфейса: тосты, табы, баланс.
 */

const UI = {
    elements: {
        balance: document.querySelector('[data-balance]'),
        toast: document.querySelector('[data-toast]'),
        tabButtons: document.querySelectorAll('[data-tab]'),
        tabContents: document.querySelectorAll('[data-tab-content]')
    },

    updateBalance(value) {
        this.elements.balance.textContent = value.toLocaleString('ru-RU');
    },

    showToast(message, duration = 2500) {
        const toast = this.elements.toast;
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
    },

    initTabs(onTabChange) {
        this.elements.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;

                this.elements.tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.elements.tabContents.forEach(c => {
                    c.classList.toggle('active', c.dataset.tabContent === tab);
                });

                if (onTabChange) onTabChange(tab);
            });
        });
    },

    openModal(name) {
        document.querySelector(`[data-modal="${name}"]`).classList.add('active');
    },

    closeModal(name) {
        document.querySelector(`[data-modal="${name}"]`).classList.remove('active');
    },

    rarityLabel(rarity) {
        return RARITY_LABELS[rarity] || rarity;
    }
};
