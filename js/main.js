/**
 * MAIN.JS
 * Точка входа. Инициализация всех модулей + модуль достижений/статистики.
 */

const AchievementsModule = {
    render() {
        const stats = Storage.getStats();
        const unlocked = Storage.getUnlockedAchievements();
        const statsGrid = document.querySelector('[data-stats-grid]');

        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-card__value">${stats.casesOpened}</div>
                <div class="stat-card__label">Кейсов открыто</div>
            </div>
            <div class="stat-card">
                <div class="stat-card__value">${stats.totalSpent.toLocaleString('ru-RU')}</div>
                <div class="stat-card__label">Монет потрачено</div>
            </div>
            <div class="stat-card">
                <div class="stat-card__value">${stats.legendaryCount + stats.mythicCount}</div>
                <div class="stat-card__label">Редких дропов</div>
            </div>
            <div class="stat-card">
                <div class="stat-card__value">${stats.upgradesWon}/${stats.upgradesAttempted}</div>
                <div class="stat-card__label">Успешных апгрейдов</div>
            </div>
        `;

        const achievementsHtml = ACHIEVEMENTS.map(a => {
            const isUnlocked = unlocked.includes(a.id);
            return `
                <div class="achievement ${isUnlocked ? 'achievement--unlocked' : ''}">
                    <div class="achievement__icon">${isUnlocked ? '🏆' : '🔒'}</div>
                    <div class="achievement__name">${a.name}</div>
                    <div class="achievement__desc">${a.desc}</div>
                </div>
            `;
        }).join('');

        statsGrid.innerHTML += `<div class="achievements-list">${achievementsHtml}</div>`;
    },

    checkAll(stats) {
        const unlocked = Storage.getUnlockedAchievements();
        let hasNew = false;

        ACHIEVEMENTS.forEach(a => {
            if (!unlocked.includes(a.id) && a.check(stats)) {
                unlocked.push(a.id);
                hasNew = true;
                UI.showToast(`🏆 Достижение: ${a.name}`);
            }
        });

        if (hasNew) Storage.setUnlockedAchievements(unlocked);
    }
};

function checkDailyBonus() {
    const lastBonus = Storage.getLastBonus();
    const today = new Date().toDateString();

    if (lastBonus !== today) {
        const balance = Storage.getBalance() + 500;
        Storage.setBalance(balance);
        UI.updateBalance(balance);
        Storage.setLastBonus(today);
        setTimeout(() => UI.showToast('🎁 Ежедневный бонус: +500 монет!'), 500);
    }
}

function init() {
    UI.updateBalance(Storage.getBalance());

    CasesModule.init();
    UpgradeModule.init();
    InventoryModule.init();

    InventoryModule.render();
    AchievementsModule.render();

    UI.initTabs((tab) => {
        if (tab === 'upgrade') UpgradeModule.render();
        if (tab === 'inventory') InventoryModule.render();
        if (tab === 'stats') AchievementsModule.render();
    });

    checkDailyBonus();
}

document.addEventListener('DOMContentLoaded', init);