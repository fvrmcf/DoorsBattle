/* ============================================================
   DOORS UPGRADER — script.js
   ============================================================ */
'use strict';

/* ============================================================
   1. ДАННЫЕ
   ============================================================ */

const RARITY = {
  common:    { name: 'Обычный',     color: '#9aa4b8' },
  uncommon:  { name: 'Необычный',   color: '#4ade80' },
  rare:      { name: 'Редкий',      color: '#38bdf8' },
  epic:      { name: 'Эпический',   color: '#a855f7' },
  legendary: { name: 'Легендарный', color: '#fbbf24' },
  mythical:  { name: 'Мифический',  color: '#ef4444' },
  secret:    { name: 'Секретный',   color: '#ff2fd0' }
};

const ITEMS = {
  /* ---- common ---- */
  coin:      { name: 'Монета',      icon: '🪙', rarity: 'common',    value: 10 },
  bandage:   { name: 'Бинт',        icon: '🩹', rarity: 'common',    value: 20 },
  battery:   { name: 'Батарейка',   icon: '🔋', rarity: 'common',    value: 25 },
  candle:    { name: 'Свеча',       icon: '🕯️', rarity: 'common',    value: 30 },
  lighter:   { name: 'Зажигалка',   icon: '🔥', rarity: 'common',    value: 40 },
  /* ---- uncommon ---- */
  lockpick:  { name: 'Отмычка',     icon: '🗝️', rarity: 'uncommon',  value: 70 },
  vitamins:  { name: 'Витамины',    icon: '💊', rarity: 'uncommon',  value: 85 },
  flashlight:{ name: 'Фонарик',     icon: '🔦', rarity: 'uncommon',  value: 100 },
  padlock:   { name: 'Замок',       icon: '🔒', rarity: 'uncommon',  value: 120 },
  /* ---- rare ---- */
  window:    { name: 'Окно',        icon: '🪟', rarity: 'rare',      value: 200 },
  timothy:   { name: 'Тимоти',      icon: '🕷️', rarity: 'rare',      value: 240 },
  screech:   { name: 'Скрежет',     icon: '👻', rarity: 'rare',      value: 280 },
  eyes:      { name: 'Глаза',       icon: '👁️', rarity: 'rare',      value: 320 },
  /* ---- epic ---- */
  hide:      { name: 'Хайд',        icon: '🚪', rarity: 'epic',      value: 600 },
  rush:      { name: 'Раш',         icon: '💨', rarity: 'epic',      value: 750 },
  ambush:    { name: 'Амбуш',       icon: '⚡', rarity: 'epic',      value: 900 },
  halt:      { name: 'Хальт',       icon: '🛑', rarity: 'epic',      value: 1100 },
  /* ---- legendary ---- */
  seek:      { name: 'Сек',         icon: '🖐️', rarity: 'legendary', value: 2000 },
  figure:    { name: 'Фигура',      icon: '🗿', rarity: 'legendary', value: 2600 },
  glitch:    { name: 'Глитч',       icon: '👾', rarity: 'legendary', value: 3200 },
  /* ---- mythical ---- */
  crucifix:  { name: 'Крусификс',   icon: '✝️', rarity: 'mythical',  value: 6000 },
  a90:       { name: 'A-90',        icon: '☠️', rarity: 'mythical',  value: 8000 },
  a120:      { name: 'A-120',       icon: '🌀', rarity: 'mythical',  value: 10000 },
  /* ---- secret ---- */
  jack:      { name: 'Джек',        icon: '🎃', rarity: 'secret',    value: 15000 },
  shadow:    { name: 'Тень',        icon: '🌑', rarity: 'secret',    value: 20000 },
  voidkey:   { name: 'Войд',        icon: '🕳️', rarity: 'secret',    value: 30000 }
};

const BY_RARITY = {};
Object.keys(ITEMS).forEach(function (k) {
  const r = ITEMS[k].rarity;
  if (!BY_RARITY[r]) BY_RARITY[r] = [];
  BY_RARITY[r].push(k);
});

const CASES = [
  { id: 'c1', name: 'Обычный кейс',     icon: '📦', price: 100,
    odds: { common: 70, uncommon: 25, rare: 4.5, epic: 0.5 } },
  { id: 'c2', name: 'Редкий кейс',      icon: '🎁', price: 500,
    odds: { common: 25, uncommon: 40, rare: 27, epic: 7, legendary: 1 } },
  { id: 'c3', name: 'Эпический кейс',   icon: '💼', price: 1500,
    odds: { uncommon: 30, rare: 42, epic: 23, legendary: 4.5, mythical: 0.5 } },
  { id: 'c4', name: 'Легендарный кейс', icon: '👑', price: 5000,
    odds: { rare: 28, epic: 46, legendary: 21, mythical: 4.5, secret: 0.5 } },
  { id: 'c5', name: 'Кейс Бездны',      icon: '🕳️', price: 20000,
    odds: { epic: 38, legendary: 42, mythical: 17, secret: 3 } }
];

/* ============================================================
   2. ЗВУК (Web Audio API — без внешних файлов)
   ============================================================ */

const Sound = (function () {
  let ac = null, master = null, enabled = true;

  function ctx() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = 0.42;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  function beep(freq, dur, type, vol, slideTo, delay) {
    if (!enabled) return;
    const c = ctx(); if (!c) return;
    const t = c.currentTime + (delay || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(dur, vol, filterFreq, delay) {
    if (!enabled) return;
    const c = ctx(); if (!c) return;
    const t = c.currentTime + (delay || 0);
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = filterFreq || 2200;
    f.Q.value = 1.1;
    const g = c.createGain();
    g.gain.setValueAtTime(vol || 0.14, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t);
  }

  return {
    get enabled() { return enabled; },
    setEnabled(v) { enabled = !!v; if (enabled) ctx(); },
    toggle() { enabled = !enabled; if (enabled) ctx(); return enabled; },
    unlock() { ctx(); },

    click()    { beep(540, 0.055, 'triangle', 0.10); },
    tick()     { noise(0.035, 0.09, 3000); },
    caseOpen() { beep(170, 0.45, 'sawtooth', 0.07, 430); noise(0.28, 0.07, 900); },
    coin()     { beep(900, 0.06, 'square', 0.09); beep(1350, 0.09, 'square', 0.07, null, 0.055); },
    win()      { [523, 659, 784, 1047].forEach(function (f, i) { beep(f, 0.22, 'triangle', 0.14, null, i * 0.085); }); },
    lose()     { beep(300, 0.32, 'sawtooth', 0.11, 120); beep(150, 0.5, 'sine', 0.09, 70, 0.1); },
    error()    { beep(165, 0.14, 'square', 0.09, 110); },
    spinUp()   { beep(190, 0.42, 'sine', 0.10, 700); },
    ding()     { beep(1180, 0.16, 'triangle', 0.13); beep(1570, 0.2, 'triangle', 0.10, null, 0.08); }
  };
})();

/* ============================================================
   3. СОСТОЯНИЕ + СОХРАНЕНИЕ
   ============================================================ */

const SAVE_KEY = 'doors-upgrader-save-v1';

const state = {
  coins: 1000,
  inventory: [],
  uid: 1,
  stats: { casesOpened: 0, upgradesWin: 0, upgradesLose: 0 }
};

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      coins: state.coins,
      inventory: state.inventory,
      uid: state.uid,
      stats: state.stats,
      sound: Sound.enabled
    }));
  } catch (e) { /* приватный режим */ }
}

function load() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { return; }
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    if (typeof d.coins === 'number' && isFinite(d.coins)) state.coins = Math.max(0, Math.floor(d.coins));
    if (Array.isArray(d.inventory)) {
      state.inventory = d.inventory.filter(function (x) {
        return x && typeof x.uid === 'number' && ITEMS[x.key];
      });
    }
    if (typeof d.uid === 'number' && d.uid > 0) state.uid = Math.floor(d.uid);
    if (d.stats && typeof d.stats === 'object') {
      state.stats = Object.assign(state.stats, d.stats);
    }
    if (typeof d.sound === 'boolean') Sound.setEnabled(d.sound);
  } catch (e) { /* повреждённое сохранение — игнорируем */ }
}

/* ============================================================
   4. УТИЛИТЫ
   ============================================================ */

const $ = function (id) { return document.getElementById(id); };
const fmt = function (n) { return Math.round(n).toLocaleString('ru-RU'); };

function weightedPick(odds) {
  let total = 0;
  for (const k in odds) total += odds[k];
  let r = Math.random() * total;
  for (const k in odds) { r -= odds[k]; if (r <= 0) return k; }
  return Object.keys(odds)[0];
}

function rollItem(c) {
  const rar = weightedPick(c.odds);
  const pool = BY_RARITY[rar];
  return pool[Math.floor(Math.random() * pool.length)];
}

let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove('is-show'); }, 2100);
}

/* ============================================================
   5. DOM
   ============================================================ */

const els = {
  coins:      $('coins'),
  soundBtn:   $('soundBtn'),
  resetBtn:   $('resetBtn'),
  caseGrid:   $('caseGrid'),
  reelWrap:   $('reelWrap'),
  reel:       $('reel'),
  invCases:   $('invCases'),
  invUpgrade: $('invUpgrade'),
  invTargets: $('invTargets'),
  sellAllBtn: $('sellAllBtn'),
  wheel:      $('wheel'),
  canvas:     $('wheelCanvas'),
  needle:     $('needle'),
  wheelPct:   $('wheelPct'),
  wheelLabel: $('wheelLabel'),
  slotFrom:   $('slotFrom'),
  slotTo:     $('slotTo'),
  spinBtn:    $('spinBtn'),
  modal:      $('modal'),
  modalTitle: $('modalTitle'),
  modalItem:  $('modalItem'),
  modalOk:    $('modalOk'),
  modalSell:  $('modalSell')
};

/* ============================================================
   6. ОБЩИЙ РЕНДЕР
   ============================================================ */

function updateBalance() {
  els.coins.textContent = fmt(state.coins);
}

function renderCases() {
  els.caseGrid.innerHTML = '';
  const frag = document.createDocumentFragment();

  CASES.forEach(function (c) {
    const poor = state.coins < c.price;
    const card = document.createElement('div');
    card.className = 'case-card' + (poor ? ' is-disabled' : '');
    card.dataset.caseId = c.id;

    let topRar = Object.keys(c.odds)[0];
    Object.keys(c.odds).forEach(function (r) {
      if (Object.keys(RARITY).indexOf(r) > Object.keys(RARITY).indexOf(topRar)) topRar = r;
    });

    card.innerHTML =
      '<div class="case-icon">' + c.icon + '</div>' +
      '<div class="case-name">' + c.name + '</div>' +
      '<div class="case-price' + (poor ? ' is-poor' : '') + '">🪙 ' + fmt(c.price) + '</div>' +
      '<div class="case-best">Лучший дроп: <b style="color:' + RARITY[topRar].color + '">' +
        RARITY[topRar].name + '</b></div>';

    card.addEventListener('click', function () { openCase(c); });
    frag.appendChild(card);
  });

  els.caseGrid.appendChild(frag);
}

function sortedInventory() {
  return state.inventory.slice().sort(function (a, b) {
    return ITEMS[b.key].value - ITEMS[a.key].value;
  });
}

function makeItemCard(inv, mode) {
  const it = ITEMS[inv.key];
  const r = RARITY[it.rarity];
  const card = document.createElement('div');
  card.className = 'item-card';
  card.style.setProperty('--c', r.color);

  let html =
    '<div class="ic-icon">' + it.icon + '</div>' +
    '<div class="ic-name">' + it.name + '</div>' +
    '<div class="ic-rar">' + r.name + '</div>' +
    '<div class="ic-val">🪙 ' + fmt(it.value) + '</div>';

  if (mode === 'target') {
    const sel = state.inventory.find(function (x) { return x.uid === selectedUid; });
    if (sel) {
      const ch = Math.min(0.95, ITEMS[sel.key].value / it.value);
      html += '<div class="ic-chance">🎯 ' + (ch * 100).toFixed(1) + '%</div>';
    }
  }

  card.innerHTML = html;

  if (mode === 'sell') {
    const b = document.createElement('button');
    b.className = 'sell-btn';
    b.type = 'button';
    b.textContent = 'Продать';
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      sellItem(inv.uid);
    });
    card.appendChild(b);
  } else if (mode === 'select') {
    if (inv.uid === selectedUid) card.classList.add('is-selected');
    card.addEventListener('click', function () { selectItem(inv.uid); });
  }

  return card;
}

function renderInventory(container, mode) {
  container.innerHTML = '';
  const list = sortedInventory();

  if (!list.length) {
    container.innerHTML = '<div class="empty">Пусто… открой кейс 📦</div>';
    return;
  }

  const frag = document.createDocumentFragment();
  list.forEach(function (inv) { frag.appendChild(makeItemCard(inv, mode)); });
  container.appendChild(frag);
}

function sellItem(uid) {
  // ЗАЩИТА: во время вращения колеса ничего продавать нельзя
  if (wheelSpinning) { toast('Колесо крутится…'); Sound.error(); return; }
  if (spinningCase)  { toast('Подожди…'); Sound.error(); return; }

  const i = state.inventory.findIndex(function (x) { return x.uid === uid; });
  if (i === -1) return;
  const val = ITEMS[state.inventory[i].key].value;
  state.inventory.splice(i, 1);
  state.coins += val;
  if (selectedUid === uid) { selectedUid = null; targetKey = null; }
  Sound.coin();
  toast('Продано за 🪙 ' + fmt(val));
  updateAll();
}

/* ============================================================
   7. КЕЙСЫ — РУЛЕТКА
   ============================================================ */

const REEL_STEP   = 134;   // 124px карточка + 10px отступ
const REEL_COUNT  = 54;
const REEL_WIN_IX = 46;

let spinningCase = false;

function makeReelItem(key) {
  const it = ITEMS[key];
  const r = RARITY[it.rarity];
  const d = document.createElement('div');
  d.className = 'reel-item';
  d.style.setProperty('--c', r.color);
  d.innerHTML =
    '<div class="ri-icon">' + it.icon + '</div>' +
    '<div class="ri-name">' + it.name + '</div>' +
    '<div class="ri-rar">' + r.name + '</div>';
  return d;
}

function openCase(c) {
  if (spinningCase) return;
  if (state.coins < c.price) { toast('Недостаточно монет!'); Sound.error(); return; }

  state.coins -= c.price;
  state.stats.casesOpened++;
  spinningCase = true;
  updateBalance();
  renderCases();
  save();

  Sound.caseOpen();

  const winKey = rollItem(c);

  els.reel.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (let i = 0; i < REEL_COUNT; i++) {
    frag.appendChild(makeReelItem(i === REEL_WIN_IX ? winKey : rollItem(c)));
  }
  els.reel.appendChild(frag);

  const wrapW = els.reelWrap.clientWidth;
  const endX = wrapW / 2 - (REEL_WIN_IX * REEL_STEP + 62) + (Math.random() - 0.5) * 55;

  els.reel.style.transition = 'none';
  els.reel.style.transform = 'translateX(0)';
  void els.reel.offsetWidth;

  const dur = 5200 + Math.random() * 700;
  const t0 = performance.now();
  let lastIdx = 0;

  function frame(now) {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 4.5);
    const x = endX * e;
    els.reel.style.transform = 'translateX(' + x + 'px)';

    const idx = Math.floor(x / REEL_STEP);
    if (idx !== lastIdx) {
      const diff = Math.min(Math.abs(idx - lastIdx), 3);
      for (let i = 0; i < diff; i++) Sound.tick();
      lastIdx = idx;
    }

    if (p < 1) requestAnimationFrame(frame);
    else finishCase(winKey);
  }
  requestAnimationFrame(frame);
}

function finishCase(winKey) {
  spinningCase = false;
  const uid = state.uid++;
  state.inventory.push({ uid: uid, key: winKey });
  updateAll();
  showModal(winKey, uid, ITEMS[winKey].value >= 2000 ? '🔥 Отличный дроп!' : 'Вы получили');
}

/* ============================================================
   8. АПГРЕЙДЫ — КОЛЕСО
   ============================================================ */

let selectedUid   = null;
let targetKey     = null;
let wheelSpinning = false;
let needleDeg     = 0;
let wheelCssSize  = 340;
let spinStake     = null;   // { uid, key } — предмет, поставленный на кон

const canvas = els.canvas;
const ctx2d  = canvas.getContext('2d');

/* ---- цветовая рампа ---- */
const RAMP = [
  [0.00, [239, 68, 68]],
  [0.35, [249, 115, 22]],
  [0.62, [234, 179, 8]],
  [0.85, [163, 230, 53]],
  [1.00, [34, 197, 94]]
];
function rampColor(t) {
  t = Math.max(0, Math.min(1, t));
  for (let i = 0; i < RAMP.length - 1; i++) {
    const p0 = RAMP[i][0], c0 = RAMP[i][1];
    const p1 = RAMP[i + 1][0], c1 = RAMP[i + 1][1];
    if (t <= p1) {
      const k = (t - p0) / (p1 - p0 || 1);
      return 'rgb(' +
        Math.round(c0[0] + (c1[0] - c0[0]) * k) + ',' +
        Math.round(c0[1] + (c1[1] - c0[1]) * k) + ',' +
        Math.round(c0[2] + (c1[2] - c0[2]) * k) + ')';
    }
  }
  return 'rgb(34,197,94)';
}

function getChance() {
  if (!selectedUid || !targetKey) return 0;
  const sel = state.inventory.find(function (x) { return x.uid === selectedUid; });
  if (!sel) return 0;
  return Math.min(0.95, ITEMS[sel.key].value / ITEMS[targetKey].value);
}

function chanceLabel(ch) {
  if (ch < 0.20) return 'низкий шанс';
  if (ch < 0.55) return 'средний шанс';
  if (ch < 0.80) return 'высокий шанс';
  return 'отличный шанс';
}

/* ---- размер ---- */
function resizeWheel() {
  const rect = els.wheel.getBoundingClientRect();
  const size = Math.round(rect.width) || 340;
  wheelCssSize = size;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width  = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawWheel();
}

/* ---- отрисовка ---- */
function drawWheel() {
  const size = wheelCssSize;
  const cx = size / 2, cy = size / 2;
  const R = size / 2 - 4;

  ctx2d.clearRect(0, 0, size, size);

  /* фон */
  ctx2d.beginPath();
  ctx2d.arc(cx, cy, R, 0, Math.PI * 2);
  ctx2d.fillStyle = '#0c0c11';
  ctx2d.fill();

  /* внешнее тонкое кольцо */
  ctx2d.beginPath();
  ctx2d.arc(cx, cy, R - 1, 0, Math.PI * 2);
  ctx2d.strokeStyle = '#2c2c38';
  ctx2d.lineWidth = 2;
  ctx2d.stroke();

  /* деления */
  const tickOuter = R - 10;
  const tickInner = R - 17;
  ctx2d.lineWidth = 1.6;
  for (let deg = 0; deg < 360; deg += 4.5) {
    const a = (deg - 90) * Math.PI / 180;
    const big = Math.abs(deg % 45) < 0.1;
    ctx2d.beginPath();
    ctx2d.moveTo(cx + Math.cos(a) * tickOuter, cy + Math.sin(a) * tickOuter);
    ctx2d.lineTo(cx + Math.cos(a) * (big ? tickInner - 5 : tickInner), cy + Math.sin(a) * (big ? tickInner - 5 : tickInner));
    ctx2d.strokeStyle = big ? '#4a4a5e' : '#2a2a36';
    ctx2d.stroke();
  }

  /* тёмная дорожка кольца */
  const ringR = R - 36;
  const ringW = 28;
  ctx2d.beginPath();
  ctx2d.arc(cx, cy, ringR, 0, Math.PI * 2);
  ctx2d.strokeStyle = '#1a1a22';
  ctx2d.lineWidth = ringW;
  ctx2d.stroke();

  /* цветная дуга шанса */
  const chance = getChance();
  if (chance > 0.001) {
    const sweep = chance * Math.PI * 2;
    const start = -Math.PI / 2;
    const segs = Math.max(3, Math.ceil(sweep / (Math.PI / 180) / 2.5));

    ctx2d.save();
    ctx2d.shadowColor = 'rgba(217,242,75,.30)';
    ctx2d.shadowBlur = 16;
    ctx2d.lineCap = 'butt';
    ctx2d.lineWidth = ringW;

    for (let i = 0; i < segs; i++) {
      const a0 = start + (i / segs) * sweep;
      const a1 = start + ((i + 1) / segs) * sweep + 0.006;
      ctx2d.beginPath();
      ctx2d.arc(cx, cy, ringR, a0, a1);
      ctx2d.strokeStyle = rampColor(i / (segs - 1 || 1));
      ctx2d.stroke();
    }
    ctx2d.restore();

    /* светящаяся точка на конце дуги */
    const endA = start + sweep;
    ctx2d.beginPath();
    ctx2d.arc(cx + Math.cos(endA) * ringR, cy + Math.sin(endA) * ringR, 5, 0, Math.PI * 2);
    ctx2d.fillStyle = '#ffffff';
    ctx2d.shadowColor = '#d9f24b';
    ctx2d.shadowBlur = 14;
    ctx2d.fill();
    ctx2d.shadowBlur = 0;
  }

  /* центральный круг */
  ctx2d.beginPath();
  ctx2d.arc(cx, cy, ringR - ringW / 2 - 8, 0, Math.PI * 2);
  ctx2d.fillStyle = '#0d0d13';
  ctx2d.fill();
  ctx2d.strokeStyle = '#20202a';
  ctx2d.lineWidth = 1.5;
  ctx2d.stroke();
}

/* ---- UI апгрейда ---- */
function selectItem(uid) {
  if (wheelSpinning) return;
  Sound.click();
  selectedUid = (selectedUid === uid) ? null : uid;
  targetKey = null;
  updateAll();
}

function selectTarget(key) {
  if (wheelSpinning) return;
  if (!selectedUid) { toast('Сначала выберите предмет'); Sound.error(); return; }
  Sound.click();
  targetKey = key;
  updateAll();
}

function renderSlots() {
  const sel = selectedUid ? state.inventory.find(function (x) { return x.uid === selectedUid; }) : null;

  /* from */
  if (sel) {
    const it = ITEMS[sel.key], r = RARITY[it.rarity];
    els.slotFrom.className = 'slot is-filled';
    els.slotFrom.style.setProperty('--c', r.color);
    els.slotFrom.innerHTML =
      '<div class="slot-icon">' + it.icon + '</div>' +
      '<div class="slot-name">' + it.name + '</div>' +
      '<div class="slot-val">🪙 ' + fmt(it.value) + '</div>';
  } else {
    els.slotFrom.className = 'slot';
    els.slotFrom.style.removeProperty('--c');
    els.slotFrom.innerHTML = '<span class="slot-empty">Пусто</span>';
  }

  /* to */
  if (targetKey) {
    const it = ITEMS[targetKey], r = RARITY[it.rarity];
    els.slotTo.className = 'slot is-filled';
    els.slotTo.style.setProperty('--c', r.color);
    els.slotTo.innerHTML =
      '<div class="slot-icon">' + it.icon + '</div>' +
      '<div class="slot-name">' + it.name + '</div>' +
      '<div class="slot-val">🪙 ' + fmt(it.value) + '</div>';
  } else {
    els.slotTo.className = 'slot';
    els.slotTo.style.removeProperty('--c');
    els.slotTo.innerHTML = '<span class="slot-empty">Пусто</span>';
  }
}

function renderTargets() {
  els.invTargets.innerHTML = '';

  if (!selectedUid) {
    els.invTargets.innerHTML = '<div class="empty">Сначала выберите предмет</div>';
    return;
  }
  const sel = state.inventory.find(function (x) { return x.uid === selectedUid; });
  if (!sel) {
    selectedUid = null;
    els.invTargets.innerHTML = '<div class="empty">Предмет не найден</div>';
    return;
  }

  const myVal = ITEMS[sel.key].value;
  const pool = Object.keys(ITEMS)
    .filter(function (k) { return ITEMS[k].value > myVal; })
    .sort(function (a, b) { return ITEMS[a].value - ITEMS[b].value; });

  if (!pool.length) {
    els.invTargets.innerHTML = '<div class="empty">Это максимальный предмет 👑</div>';
    return;
  }

  const frag = document.createDocumentFragment();
  pool.forEach(function (k) {
    const it = ITEMS[k], r = RARITY[it.rarity];
    const ch = Math.min(0.95, myVal / it.value);
    const card = document.createElement('div');
    card.className = 'item-card' + (targetKey === k ? ' is-selected' : '');
    card.style.setProperty('--c', r.color);
    card.innerHTML =
      '<div class="ic-icon">' + it.icon + '</div>' +
      '<div class="ic-name">' + it.name + '</div>' +
      '<div class="ic-rar">' + r.name + '</div>' +
      '<div class="ic-val">🪙 ' + fmt(it.value) + '</div>' +
      '<div class="ic-chance">🎯 ' + (ch * 100).toFixed(1) + '%</div>';
    card.addEventListener('click', function () { selectTarget(k); });
    frag.appendChild(card);
  });
  els.invTargets.appendChild(frag);
}

function updateWheelUI() {
  const ch = getChance();

  if (ch > 0) {
    els.wheelPct.textContent = (ch * 100).toFixed(2) + '%';
    els.wheelPct.classList.remove('is-neutral');
    els.wheelLabel.textContent = chanceLabel(ch);
  } else if (selectedUid) {
    els.wheelPct.textContent = '—';
    els.wheelPct.classList.add('is-neutral');
    els.wheelLabel.textContent = 'выберите цель';
  } else {
    els.wheelPct.textContent = '—';
    els.wheelPct.classList.add('is-neutral');
    els.wheelLabel.textContent = 'выберите предмет';
  }

  els.spinBtn.disabled = !(selectedUid && targetKey) || wheelSpinning;
  drawWheel();
}

/* ---- ВРАЩЕНИЕ ---- */
function spinWheel() {
  if (wheelSpinning) return;
  if (!selectedUid || !targetKey) return;

  const sel = state.inventory.find(function (x) { return x.uid === selectedUid; });
  if (!sel) return;

  const chance = getChance();
  if (chance <= 0) return;

  wheelSpinning = true;
  els.spinBtn.disabled = true;
  els.spinBtn.textContent = 'КРУТИМ…';

  // ========== ЗАЩИТА ОТ БАГА ==========
  // 1. Запоминаем предмет, поставленный на кон
  spinStake = { uid: selectedUid, key: sel.key };

  // 2. СРАЗУ удаляем его из инвентаря — теперь его нельзя продать
  state.inventory = state.inventory.filter(function (x) { return x.uid !== spinStake.uid; });

  // 3. Блокируем весь UI
  els.invUpgrade.classList.add('is-locked');
  els.invTargets.classList.add('is-locked');
  els.sellAllBtn.disabled = true;

  // 4. Обновляем отображение (предмет уже пропал из инвентаря, но слот "from" показываем вручную)
  renderInventory(els.invUpgrade, 'select');
  renderInventory(els.invCases, 'sell');

  // 5. Слот "from" показываем как "в игре" — используем сохранённый spinStake
  const stakeIt = ITEMS[spinStake.key], stakeR = RARITY[stakeIt.rarity];
  els.slotFrom.className = 'slot is-filled';
  els.slotFrom.style.setProperty('--c', stakeR.color);
  els.slotFrom.innerHTML =
    '<div class="slot-icon">' + stakeIt.icon + '</div>' +
    '<div class="slot-name">' + stakeIt.name + '</div>' +
    '<div class="slot-val">🪙 ' + fmt(stakeIt.value) + '</div>';

  save();
  Sound.spinUp();

  const winArc = chance * 360;
  const isWin = Math.random() < chance;

  let landing;
  if (isWin) {
    landing = 4 + Math.random() * Math.max(1, winArc - 8);
  } else {
    const lo = winArc + 4;
    const hi = 356;
    landing = hi > lo ? lo + Math.random() * (hi - lo) : Math.min(359, lo + 2);
  }

  const startDeg = needleDeg;
  const startMod = ((startDeg % 360) + 360) % 360;
  const turns = 5 + Math.floor(Math.random() * 2);
  let total = turns * 360 + landing - startMod;
  if (total < 360) total += 360 * 6;

  const dur = 4700 + Math.random() * 800;
  const t0 = performance.now();
  const TICK_STEP = 9;
  let lastTickIx = Math.floor(startDeg / TICK_STEP);

  function frame(now) {
    const p = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - p, 4.2);
    const deg = startDeg + total * e;

    needleDeg = deg;
    els.needle.style.transform = 'rotate(' + deg + 'deg)';

    const ix = Math.floor(deg / TICK_STEP);
    if (ix !== lastTickIx) {
      const diff = Math.min(Math.abs(ix - lastTickIx), 2);
      for (let i = 0; i < diff; i++) Sound.tick();
      lastTickIx = ix;
    }

    if (p < 1) requestAnimationFrame(frame);
    else finishSpin(isWin);
  }
  requestAnimationFrame(frame);
}

function finishSpin(isWin) {
  wheelSpinning = false;
  els.spinBtn.textContent = 'ПРОКАЧАТЬ';

  // снимаем блокировку
  els.invUpgrade.classList.remove('is-locked');
  els.invTargets.classList.remove('is-locked');
  els.sellAllBtn.disabled = false;

  const staked = spinStake;
  spinStake = null;

  // предмет уже удалён из инвентаря в начале спина — здесь только добавляем выигрыш

  if (isWin) {
    const won = targetKey;
    const newUid = state.uid++;
    state.inventory.push({ uid: newUid, key: won });
    state.stats.upgradesWin++;

    selectedUid = null;
    targetKey = null;
    updateAll();
    Sound.win();
    showModal(won, newUid, '🎉 АПГРЕЙД УДАЛСЯ!');
  } else {
    state.stats.upgradesLose++;
    selectedUid = null;
    targetKey = null;
    updateAll();
    Sound.lose();
    toast('💀 Предмет потерян…');
  }
}

/* ============================================================
   9. МОДАЛКА
   ============================================================ */

let modalUid = null;

function showModal(key, uid, title) {
  const it = ITEMS[key], r = RARITY[it.rarity];
  modalUid = uid;

  els.modalTitle.textContent = title || 'Вы получили';
  els.modalItem.style.setProperty('--c', r.color);
  els.modalItem.innerHTML =
    '<div class="mi-icon">' + it.icon + '</div>' +
    '<div class="mi-name">' + it.name + '</div>' +
    '<div class="mi-rar">' + r.name + '</div>' +
    '<div class="mi-val">🪙 ' + fmt(it.value) + '</div>';

  els.modal.classList.add('is-open');
  Sound.ding();
}

function closeModal() {
  els.modal.classList.remove('is-open');
  modalUid = null;
}

/* ============================================================
   10. ГЛАВНЫЙ АПДЕЙТ
   ============================================================ */

function updateAll() {
  updateBalance();
  renderCases();
  renderInventory(els.invCases, 'sell');
  renderInventory(els.invUpgrade, 'select');
  renderTargets();
  renderSlots();
  updateWheelUI();
  save();
}

/* ============================================================
   11. СОБЫТИЯ
   ============================================================ */

/* вкладки */
document.querySelectorAll('.tab-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    Sound.click();
    document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('is-active'); });
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('is-active'); });
    btn.classList.add('is-active');
    $('page-' + btn.dataset.tab).classList.add('is-active');

    if (btn.dataset.tab === 'upgrades') {
      requestAnimationFrame(resizeWheel);
    }
  });
});

/* кнопки */
els.spinBtn.addEventListener('click', spinWheel);

els.sellAllBtn.addEventListener('click', function () {
  // ЗАЩИТА: во время вращения колеса / прокрутки кейса продавать нельзя
  if (wheelSpinning) { toast('Колесо крутится…'); Sound.error(); return; }
  if (spinningCase)  { toast('Подожди…'); Sound.error(); return; }

  if (!state.inventory.length) { toast('Инвентарь пуст'); Sound.error(); return; }
  let sum = 0;
  state.inventory.forEach(function (x) { sum += ITEMS[x.key].value; });
  state.inventory = [];
  selectedUid = null;
  targetKey = null;
  state.coins += sum;
  Sound.coin();
  toast('Продано всё за 🪙 ' + fmt(sum));
  updateAll();
});

els.soundBtn.addEventListener('click', function () {
  const on = Sound.toggle();
  els.soundBtn.textContent = on ? '🔊' : '🔇';
  els.soundBtn.classList.toggle('off', !on);
  if (on) Sound.click();
  save();
});

els.resetBtn.addEventListener('click', function () {
  if (!confirm('Сбросить весь прогресс? Это действие нельзя отменить.')) return;
  state.coins = 1000;
  state.inventory = [];
  state.uid = 1;
  state.stats = { casesOpened: 0, upgradesWin: 0, upgradesLose: 0 };
  selectedUid = null;
  targetKey = null;
  spinStake = null;
  needleDeg = 0;
  els.needle.style.transform = 'rotate(0deg)';
  Sound.click();
  toast('Прогресс сброшен');
  updateAll();
});

/* модалка */
els.modalOk.addEventListener('click', function () { Sound.click(); closeModal(); });
els.modalSell.addEventListener('click', function () {
  // ЗАЩИТА: если колесо крутится — не продаём
  if (wheelSpinning) { toast('Колесо крутится…'); Sound.error(); return; }

  if (modalUid !== null) {
    const uid = modalUid;
    closeModal();
    sellItem(uid);
  }
});
els.modal.addEventListener('click', function (e) {
  if (e.target === els.modal) closeModal();
});

/* ресайз колеса */
if (window.ResizeObserver) {
  new ResizeObserver(function () { resizeWheel(); }).observe(els.wheel);
}
window.addEventListener('resize', function () {
  clearTimeout(window.__wheelT);
  window.__wheelT = setTimeout(resizeWheel, 120);
});

/* разблокировка звука по первому клику */
document.addEventListener('pointerdown', function () { Sound.unlock(); }, { once: true });

/* горячая клавиша: пробел = крутить */
document.addEventListener('keydown', function (e) {
  if (e.code === 'Space' && document.getElementById('page-upgrades').classList.contains('is-active')) {
    e.preventDefault();
    if (!els.spinBtn.disabled) spinWheel();
  }
});

/* ============================================================
   12. СТАРТ
   ============================================================ */
load();
els.soundBtn.textContent = Sound.enabled ? '🔊' : '🔇';
els.soundBtn.classList.toggle('off', !Sound.enabled);

updateAll();
requestAnimationFrame(resizeWheel);
