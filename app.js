/* =========================================================
   DOORS Case Simulator — логика (виртуальная валюта)
   ========================================================= */

const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"];
const RARITY_LABEL_RU = {
  Common: "Обычный", Uncommon: "Необычный", Rare: "Редкий",
  Epic: "Эпический", Legendary: "Легендарный", Mythic: "Мифический"
};

// ---------- Предметы ----------
const ITEMS = {
  flashlight:    { name: "Фонарик",           rarity: "Common",    img: "🔦", sell: 40 },
  lighter:       { name: "Зажигалка",         rarity: "Common",    img: "🔥", sell: 50 },
  lockpick:      { name: "Отмычка",           rarity: "Common",    img: "🗝️", sell: 60 },
  metal_detector:{ name: "Металлоискатель",   rarity: "Uncommon",  img: "📡", sell: 120 },
  silver_bullet: { name: "Серебряная пуля",   rarity: "Uncommon",  img: "🥈", sell: 150 },
  googie_eye:    { name: "Глаз Googie",       rarity: "Rare",      img: "👁️", sell: 350 },
  holy_water:    { name: "Святая вода",       rarity: "Rare",      img: "💧", sell: 400 },
  padlock:       { name: "Навесной замок",    rarity: "Rare",      img: "🔒", sell: 450 },
  crucifix:      { name: "Распятие",          rarity: "Epic",      img: "✝️", sell: 900 },
  gold_bar:      { name: "Слиток золота",     rarity: "Epic",      img: "🪙", sell: 1000 },
  void_vault:    { name: "Хранилище Пустоты", rarity: "Legendary", img: "🌀", sell: 2500 },
  skeleton_key:  { name: "Ключ Скелета",      rarity: "Legendary", img: "💀", sell: 3000 },
  stop_sign:     { name: "Знак СТОП",         rarity: "Legendary", img: "🛑", sell: 3200 },
  seek_figure:   { name: "Фигурка Seek",      rarity: "Mythic",    img: "🕷️", sell: 8000 },
  eyes:          { name: "Глазастый монстр",  rarity: "Mythic",    img: "👹", sell: 9500 },
  rush_piece:    { name: "Кусочек Rush",      rarity: "Mythic",    img: "⚡", sell: 12000 },
};

// ---------- Кейсы ----------
const CASES = [
  { id: "hotel", name: "Кейс «Отель»", art: "🏨", price: 250,
    desc: "Стартовый кейс. Всё, что нужно для первого этажа.",
    drops: { flashlight: 30, lighter: 25, lockpick: 20, metal_detector: 12, silver_bullet: 8, googie_eye: 3, holy_water: 2 } },
  { id: "library", name: "Кейс «Библиотека»", art: "📚", price: 600,
    desc: "Будь тихим... Здесь водится Screech.",
    drops: { lockpick: 22, metal_detector: 20, silver_bullet: 18, googie_eye: 15, holy_water: 12, padlock: 7, crucifix: 4, gold_bar: 2 } },
  { id: "coins", name: "Кейс «Монеты»", art: "💰", price: 1500, best: true,
    desc: "Добыча Левиана — много золота и не только.",
    drops: { silver_bullet: 20, googie_eye: 20, holy_water: 18, padlock: 15, crucifix: 12, gold_bar: 10, void_vault: 3, skeleton_key: 1.5, stop_sign: 0.5 } },
  { id: "seek", name: "Кейс «Seek»", art: "🕷️", price: 3500,
    desc: "Осторожно: внутри плывёт Seek. Двойной прыжок!",
    drops: { holy_water: 20, padlock: 18, crucifix: 16, gold_bar: 14, void_vault: 12, skeleton_key: 10, stop_sign: 6, seek_figure: 3, eyes: 0.8, rush_piece: 0.2 } },
  { id: "void", name: "Кейс «Пустота»", art: "🌌", price: 8000,
    desc: "Для тех, кто дошёл до конца. Только мифики и легенды.",
    drops: { crucifix: 20, void_vault: 22, skeleton_key: 20, stop_sign: 18, seek_figure: 10, eyes: 7, rush_piece: 3 } },
];

// ---------- Состояние / localStorage ----------
const SAVE_KEY = "doors_case_sim_save";
let state = loadState();

function defaultState() { return { balance: 2500, inventory: {}, lastDaily: null }; }
function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    return { balance: s.balance ?? 2500, inventory: s.inventory ?? {}, lastDaily: s.lastDaily ?? null };
  } catch { return defaultState(); }
}
function saveState() { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }

// ---------- Утилиты ----------
const $ = (id) => document.getElementById(id);
const fmt = (n) => n.toLocaleString("ru-RU");

function toast(msg, type = "") {
  const el = document.createElement("div");
  el.className = "toast " + type;
  el.textContent = msg;
  $("toastStack").appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function updateBalance(bump = false) {
  $("balanceValue").textContent = fmt(state.balance);
  if (bump) {
    const box = $("balanceBox");
    box.classList.remove("bump"); void box.offsetWidth; box.classList.add("bump");
  }
  saveState();
}

function rollDrop(caseData) {
  const entries = Object.entries(caseData.drops);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [id, w] of entries) { r -= w; if (r <= 0) return id; }
  return entries[0][0];
}

// ---------- Кейсы ----------
function renderCases() {
  const grid = $("casesGrid");
  grid.innerHTML = "";
  for (const c of CASES) {
    const card = document.createElement("div");
    card.className = "case-card";
    card.innerHTML = `
      ${c.best ? '<span class="case-best">🔥 хит</span>' : ""}
      <div class="case-art">${c.art}</div>
      <div class="case-name">${c.name}</div>
      <div class="case-desc">${c.desc}</div>
      <div class="case-price">🪙 ${fmt(c.price)}</div>`;
    card.addEventListener("click", () => openCaseModal(c));
    grid.appendChild(card);
  }
}

// ---------- Модалка и рулетка ----------
let currentCase = null, lastRollItemId = null, spinning = false;

function openCaseModal(c) {
  currentCase = c;
  $("modalCaseName").textContent = `${c.art} ${c.name}`;
  $("openBtn").textContent = `🎁 Открыть кейс за 🪙 ${fmt(c.price)}`;
  $("resultBox").classList.add("hidden");
  renderDropsList(c);
  resetRouletteTrack(c);
  $("caseModal").classList.remove("hidden");
}
function closeModal() { if (spinning) return; $("caseModal").classList.add("hidden"); }

function renderDropsList(c) {
  const list = $("dropsList");
  list.innerHTML = "";
  const sorted = Object.entries(c.drops).sort(
    (a, b) => RARITY_ORDER.indexOf(ITEMS[b[0]].rarity) - RARITY_ORDER.indexOf(ITEMS[a[0]].rarity));
  for (const [id, chance] of sorted) {
    const it = ITEMS[id];
    const row = document.createElement("div");
    row.className = "drop-row";
    row.innerHTML = `<span>${it.img}</span><span class="t-${it.rarity}">${it.name}</span><span class="chance">${chance}%</span>`;
    list.appendChild(row);
  }
}

const ITEM_W = 118;
function rouletteCardHTML(id) {
  const it = ITEMS[id];
  return `<div class="roulette-item r-${it.rarity}"><div class="item-img">${it.img}</div><div class="item-name">${it.name}</div></div>`;
}
function resetRouletteTrack(c) {
  const track = $("rouletteTrack");
  const ids = Object.keys(c.drops);
  let html = "";
  for (let i = 0; i < 20; i++) html += rouletteCardHTML(ids[Math.floor(Math.random() * ids.length)]);
  track.style.transition = "none";
  track.innerHTML = html;
  track.style.transform = "translateX(0)";
}
function buildRouletteTrack(c) {
  const track = $("rouletteTrack");
  const ids = Object.keys(c.drops);
  const winnerId = rollDrop(c);
  lastRollItemId = winnerId;
  const N = 50, WIN_POS = 44;
  let html = "";
  for (let i = 0; i < N; i++) {
    const id = i === WIN_POS ? winnerId : ids[Math.floor(Math.random() * ids.length)];
    html += rouletteCardHTML(id);
  }
  track.innerHTML = html;
  track.style.transition = "none";
  track.style.transform = "translateX(0)";
  void track.offsetWidth;
  const wrapW = track.parentElement.clientWidth;
  const jitter = (Math.random() * 0.6 - 0.3) * ITEM_W;
  const target = WIN_POS * ITEM_W + ITEM_W / 2 - wrapW / 2 + jitter;
  requestAnimationFrame(() => {
    track.style.transition = "transform 5.2s cubic-bezier(.12,.65,.15,1)";
    track.style.transform = `translateX(-${target}px)`;
  });
}
function showResult(itemId) {
  const it = ITEMS[itemId];
  $("resultImg").textContent = it.img;
  $("resultName").textContent = it.name;
  const rar = $("resultRarity");
  rar.textContent = RARITY_LABEL_RU[it.rarity] + " · " + it.rarity;
  rar.className = "result-rarity t-" + it.rarity;
  const card = $("resultCard");
  card.className = "result-card r-" + it.rarity;
  if (it.rarity === "Mythic") card.classList.add("mythic-flash");
  $("sellPrice").textContent = fmt(it.sell);
  $("resultBox").classList.remove("hidden");
  $("openAgainBtn").textContent = `Открыть ещё раз (🪙 ${fmt(currentCase.price)})`;
  if (it.rarity === "Legendary" || it.rarity === "Mythic")
    toast(`🎉 Реальный дроп: ${it.name} (${it.rarity})!`, "success");
}
function doOpen() {
  if (spinning || !currentCase) return;
  if (state.balance < currentCase.price) {
    toast("Недостаточно 🪙 пополни баланс в магазине ниже — он бесплатный!", "error");
    return;
  }
  spinning = true;
  state.balance -= currentCase.price;
  updateBalance(true);
  $("resultBox").classList.add("hidden");
  buildRouletteTrack(currentCase);
  setTimeout(() => {
    spinning = false;
    state.inventory[lastRollItemId] = (state.inventory[lastRollItemId] || 0) + 1;
    saveState();
    renderInventory();
    renderUpAll();
    showResult(lastRollItemId);
  }, 5400);
}

// ---------- Инвентарь ----------
function sellItem(id, count = 1) {
  const have = state.inventory[id] || 0;
  const n = Math.min(count, have);
  if (n <= 0) return;
  state.inventory[id] -= n;
  if (state.inventory[id] <= 0) delete state.inventory[id];
  const gain = ITEMS[id].sell * n;
  state.balance += gain;
  updateBalance(true);
  renderInventory();
  renderUpAll();
  toast(`Продано: ${ITEMS[id].name} ×${n} за 🪙 ${fmt(gain)}`, "success");
  return gain;
}
function renderInventory() {
  const grid = $("inventoryGrid");
  const sortMode = $("sortSelect").value;
  const ids = Object.keys(state.inventory);
  $("invCount").textContent = ids.reduce((s, id) => s + state.inventory[id], 0);
  grid.innerHTML = "";
  if (ids.length === 0) {
    grid.innerHTML = `<p class="empty-msg">Пока пусто — открой свой первый кейс! 🎁</p>`;
    return;
  }
  if (sortMode === "rarity") ids.sort((a, b) => RARITY_ORDER.indexOf(ITEMS[b].rarity) - RARITY_ORDER.indexOf(ITEMS[a].rarity));
  else ids.reverse();
  for (const id of ids) {
    const it = ITEMS[id], cnt = state.inventory[id];
    const el = document.createElement("div");
    el.className = "inv-item r-" + it.rarity;
    el.innerHTML = `
      ${cnt > 1 ? `<span class="dup-count">×${cnt}</span>` : ""}
      <div class="item-img">${it.img}</div>
      <div class="item-name">${it.name}</div>
      <div class="item-rarity t-${it.rarity}">${RARITY_LABEL_RU[it.rarity]}</div>
      <button class="sell-one">Продать 🪙${fmt(it.sell)}</button>`;
    el.querySelector(".sell-one").addEventListener("click", () => sellItem(id, 1));
    grid.appendChild(el);
  }
}
function sellDuplicates() {
  let gained = 0, sold = 0;
  for (const id of Object.keys(state.inventory)) {
    const extra = state.inventory[id] - 1;
    if (extra > 0) { gained += sellItem(id, extra); sold += extra; }
  }
  if (sold === 0) toast("Дубликатов нет — продавать нечего 🙂");
  else toast(`Продано ${sold} шт. повторов за 🪙 ${fmt(gained)}!`, "success");
}

// ---------- Ежедневная награда ----------
function claimDaily() {
  const today = new Date().toDateString();
  if (state.lastDaily === today) { toast("Ежедневная награда уже получена — приходи завтра! ⏳", "error"); return; }
  state.lastDaily = today;
  state.balance += 500;
  updateBalance(true);
  toast("Ежедневная награда: +500 🪙", "success");
}

/* =========================================================
   АПГРЕЙД ПРЕДМЕТОВ (механика как на upgrader-сайтах)
   ========================================================= */
const HOUSE_EDGE = 0.92; // честный потолок шанса ≈ цена_твоего / цена_цели * 92%

let yourItemId = null, targetItemId = null, upgrading = false;

function maxUpgradeChance(fromId, toId) {
  const from = ITEMS[fromId].sell, to = ITEMS[toId].sell;
  if (to <= from) return 1;
  let c = Math.floor((from / to) * HOUSE_EDGE * 100);
  return Math.max(1, Math.min(99, c));
}
function currentChance() {
  if (!yourItemId || !targetItemId) return 0;
  const cap = maxUpgradeChance(yourItemId, targetItemId);
  const slider = parseInt($("upChanceSlider").value, 10);
  return Math.min(slider, cap);
}
function slotItemHTML(id) {
  const it = ITEMS[id];
  return `<div class="up-item-img">${it.img}</div>
          <div class="up-item-name t-${it.rarity}">${it.name}</div>
          <div class="up-item-rarity t-${it.rarity}">${RARITY_LABEL_RU[it.rarity]} · 🪙${fmt(it.sell)}</div>`;
}
function renderUpSlots() {
  const yb = $("yourSlotBody"), tb = $("targetSlotBody");
  $("yourSlot").classList.toggle("filled", !!yourItemId);
  $("targetSlot").classList.toggle("filled", !!targetItemId);
  yb.innerHTML = yourItemId ? slotItemHTML(yourItemId) : '<span class="up-placeholder">🎒</span>';
  tb.innerHTML = targetItemId ? slotItemHTML(targetItemId) : '<span class="up-placeholder">🎯</span>';
  if (yourItemId && targetItemId) {
    const cap = maxUpgradeChance(yourItemId, targetItemId);
    const slider = $("upChanceSlider");
    slider.max = cap;
    if (parseInt(slider.value, 10) > cap) slider.value = cap;
    $("upChanceValue").textContent = currentChance() + "%";
    $("doUpgradeBtn").disabled = upgrading || cap < 1 || ITEMS[yourItemId].rarity === "Mythic";
  } else {
    $("upChanceValue").textContent = "—";
    $("doUpgradeBtn").disabled = true;
  }
}
function renderTargetGrid() {
  const grid = $("upTargetGrid");
  grid.innerHTML = "";
  const sortedIds = Object.keys(ITEMS).sort((a, b) => ITEMS[a].sell - ITEMS[b].sell);
  for (const id of sortedIds) {
    const it = ITEMS[id];
    const el = document.createElement("div");
    const tooCheap = yourItemId ? it.sell <= ITEMS[yourItemId].sell : false;
    el.className = "up-choice r-" + it.rarity +
      (targetItemId === id ? " selected" : "") + (tooCheap ? " disabled" : "");
    el.innerHTML = `<div class="item-img">${it.img}</div>
                    <div class="item-name">${it.name}</div>
                    <div class="item-price">🪙 ${fmt(it.sell)}</div>`;
    if (!tooCheap) el.addEventListener("click", () => { targetItemId = id; renderUpAll(); });
    grid.appendChild(el);
  }
}
function renderUpInvGrid() {
  const grid = $("upInvGrid");
  const ids = Object.keys(state.inventory);
  $("upInvCount").textContent = ids.reduce((s, id) => s + state.inventory[id], 0);
  grid.innerHTML = "";
  if (ids.length === 0) {
    grid.innerHTML = `<p class="empty-msg">Инвентарь пуст — сначала откройте кейс 🙂</p>`;
    return;
  }
  for (const id of ids) {
    const it = ITEMS[id], cnt = state.inventory[id];
    const el = document.createElement("div");
    el.className = "up-choice r-" + it.rarity + (yourItemId === id ? " selected" : "");
    el.innerHTML = `${cnt > 1 ? `<span class="dup-count">×${cnt}</span>` : ""}
                    <div class="item-img">${it.img}</div>
                    <div class="item-name">${it.name}</div>
                    <div class="item-price">🪙 ${fmt(it.sell)}</div>`;
    el.addEventListener("click", () => {
      yourItemId = id;
      if (targetItemId && ITEMS[targetItemId].sell <= ITEMS[yourItemId].sell) targetItemId = null;
      $("upChanceSlider").value = 50;
      renderUpAll();
    });
    grid.appendChild(el);
  }
}
function renderUpAll() { renderUpInvGrid(); renderTargetGrid(); renderUpSlots(); }

function doUpgrade() {
  if (upgrading || !yourItemId || !targetItemId) return;
  const chance = currentChance();
  if (chance < 1) { toast("Нельзя апгрейдить Мифик ещё выше 😄", "error"); return; }
  if ((state.inventory[yourItemId] || 0) < 1) { toast("Этого предмета нет в инвентаре.", "error"); return; }

  upgrading = true;
  $("doUpgradeBtn").disabled = true;
  $("yourSlot").classList.remove("burning", "won");
  $("targetSlot").classList.remove("burning", "won");

  let ticks = 0;
  const tick = setInterval(() => {
    $("upChanceValue").textContent = Math.floor(Math.random() * 100) + "%";
    if (++ticks > 14) { clearInterval(tick); finishUpgrade(chance); }
  }, 120);
}

function finishUpgrade(chance) {
  const won = Math.random() * 100 < chance;
  const stakedId = yourItemId;
  state.inventory[stakedId] -= 1;
  if (state.inventory[stakedId] <= 0) delete state.inventory[stakedId];

  if (won) {
    state.inventory[targetItemId] = (state.inventory[targetItemId] || 0) + 1;
    $("targetSlot").classList.add("won");
    toast(`✅ Апгрейд удался! Получен: ${ITEMS[targetItemId].name}`, "success");
  } else {
    $("yourSlot").classList.add("burning");
    toast(`🔥 Не повезло — ${ITEMS[stakedId].name} сгорел. Шанс был ${chance}%`, "error");
  }

  saveState();
  updateBalance();
  renderInventory();
  yourItemId = null; targetItemId = null;
  upgrading = false;
  setTimeout(() => {
    $("yourSlot").classList.remove("burning");
    $("targetSlot").classList.remove("won");
    renderUpAll();
  }, 1500);
}

// ---------- Инициализация (вся привязка событий — здесь!) ----------
function init() {
  renderCases();
  renderInventory();
  updateBalance();

  $("dailyBtn").addEventListener("click", claimDaily);
  $("balanceBox").addEventListener("click", claimDaily);

  $("resetBtn").addEventListener("click", () => {
    if (confirm("Сбросить весь прогресс (баланс и инвентарь)?")) {
      state = defaultState();
      saveState();
      updateBalance();
      renderInventory();
      renderUpAll();
      toast("Прогресс сброшен. Стартовые 2500 🪙 зачислены!");
    }
  });

  document.querySelectorAll(".coin-pack").forEach(btn => {
    btn.addEventListener("click", () => {
      const coins = parseInt(btn.dataset.coins, 10);
      state.balance += coins;
      updateBalance(true);
      toast(`+${fmt(coins)} 🪙 зачислено (бесплатно!)`, "success");
    });
  });

  $("sellAllBtn").addEventListener("click", sellDuplicates);
  $("clearInvBtn").addEventListener("click", () => {
    if (Object.keys(state.inventory).length === 0) return toast("Инвентарь уже пуст.");
    if (confirm("Удалить весь инвентарь безвозвратно?")) {
      state.inventory = {};
      saveState();
      renderInventory();
      renderUpAll();
      toast("Инвентарь очищен.", "error");
    }
  });
  $("sortSelect").addEventListener("change", renderInventory);

  $("modalClose").addEventListener("click", closeModal);
  $("modalBackdrop").addEventListener("click", closeModal);
  $("openBtn").addEventListener("click", doOpen);
  $("openAgainBtn").addEventListener("click", doOpen);
  $("sellItemBtn").addEventListener("click", () => {
    if (lastRollItemId) { sellItem(lastRollItemId, 1); $("resultBox").classList.add("hidden"); }
  });

  // --- события секции апгрейда ---
  $("upChanceSlider").addEventListener("input", renderUpSlots);
  $("doUpgradeBtn").addEventListener("click", doUpgrade);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
    if (e.key === "Enter" && !$("caseModal").classList.contains("hidden") && !spinning) doOpen();
  });

  renderUpAll();
}

window.addEventListener('DOMContentLoaded', init);
