// ─── State ───────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  theme: 'jot_theme',
  spinOptions: 'jot_spinOptions',
  priorities: 'jot_priorities_v2',
  savedLists: 'jot_savedLists',
  lastResetDate: 'jot_lastResetDate',
};

const PRESETS = {
  meals: ['Pasta', 'Salad', 'Stir fry', 'Tacos', 'Soup', 'Sandwich', 'Rice bowl'],
  tasks: ['Clear inbox', 'Team standup', 'Review PR', 'Write docs', 'Fix that bug', 'Plan tomorrow'],
  break: ['Go for a walk', 'Make tea', 'Stretch', 'Read 5 pages', 'Call a friend', 'Step outside'],
  exercise: ['Run 20 min', 'Yoga', 'Pushups + situps', 'Bike ride', 'Jump rope', 'Walk the block'],
};

let state = {
  theme: load(STORAGE_KEYS.theme) || 'dark',
  spinOptions: load(STORAGE_KEYS.spinOptions) || [],
  spinListId: '__default',
  priorities: checkResetPriorities(),
  savedLists: load(STORAGE_KEYS.savedLists) || {},
  currentResult: null,
};

// ─── Helpers ─────────────────────────────────────────────────────────
function load(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function checkResetPriorities() {
  const today = new Date().toDateString();
  const lastReset = load(STORAGE_KEYS.lastResetDate);
  if (lastReset !== today) {
    save(STORAGE_KEYS.lastResetDate, today);
    save(STORAGE_KEYS.priorities, []);
    return [];
  }
  return load(STORAGE_KEYS.priorities) || [];
}

function persist() {
  save(STORAGE_KEYS.spinOptions, state.spinOptions);
  save(STORAGE_KEYS.priorities, state.priorities);
  save(STORAGE_KEYS.savedLists, state.savedLists);
}

function showToast(msg, type = '', duration = 2200) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast fixed bottom-6 left-1/2 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-medium z-50 pointer-events-none ${type}`;
  toast.style.animation = 'none';
  toast.offsetHeight; // reflow
  toast.style.animation = '';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.classList.add('hidden'); }, duration);
}

function fireConfetti() {
  if (typeof confetti !== 'undefined') {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 },
      colors: ['#e8a84a', '#c97c2a', '#f0c060', '#fff8e8'] });
  }
}

// ─── Theme ─────────────────────────────────────────────────────────
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.getElementById('themeIcon').textContent = theme === 'dark' ? '🌙' : '☀️';
  save(STORAGE_KEYS.theme, theme);
}

document.getElementById('themeToggle').addEventListener('click', () => {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
});

// ─── Tabs ─────────────────────────────────────────────────────────
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
  });
});

// ─── SPIN TAB ─────────────────────────────────────────────────────
function getActiveOptions() {
  if (state.spinListId === '__default') return state.spinOptions;
  return state.savedLists[state.spinListId]?.items || [];
}

function setActiveOptions(arr) {
  if (state.spinListId === '__default') {
    state.spinOptions = arr;
  } else if (state.savedLists[state.spinListId]) {
    state.savedLists[state.spinListId].items = arr;
  }
  persist();
}

function renderOptions() {
  const list = document.getElementById('optionsList');
  const empty = document.getElementById('optionsEmpty');
  const spinBtn = document.getElementById('spinBtn');
  const opts = getActiveOptions();

  // Clear chips
  [...list.children].forEach(c => { if (c !== empty) c.remove(); });

  if (opts.length === 0) {
    empty.style.display = '';
    spinBtn.disabled = true;
    return;
  }

  empty.style.display = 'none';
  spinBtn.disabled = opts.length < 2;

  opts.forEach((opt, i) => {
    const chip = document.createElement('span');
    chip.className = 'option-chip';
    chip.style.animationDelay = `${i * 0.04}s`;
    chip.innerHTML = `${escHtml(opt)}<span class="chip-remove" data-idx="${i}" title="Remove">✕</span>`;
    list.appendChild(chip);
  });
}

function escHtml(str) {
  return str.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

document.getElementById('addOptionBtn').addEventListener('click', addOption);
document.getElementById('optionInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addOption();
});

function addOption() {
  const input = document.getElementById('optionInput');
  const val = input.value.trim();
  if (!val) return;
  const opts = getActiveOptions();
  if (opts.includes(val)) { showToast('Already in the list!', 'error'); return; }
  opts.push(val);
  setActiveOptions(opts);
  input.value = '';
  input.focus();
  renderOptions();
  updateListSelector();
}

document.getElementById('optionsList').addEventListener('click', e => {
  const btn = e.target.closest('.chip-remove');
  if (!btn) return;
  const i = parseInt(btn.dataset.idx);
  const opts = getActiveOptions();
  opts.splice(i, 1);
  setActiveOptions(opts);
  renderOptions();
});

// Spin!
document.getElementById('spinBtn').addEventListener('click', () => {
  const opts = getActiveOptions();
  if (opts.length < 2) return;
  spin(opts);
});

document.getElementById('spinAgainBtn').addEventListener('click', () => {
  const opts = getActiveOptions();
  if (opts.length >= 1) spin(opts);
});

function spin(opts) {
  const btn = document.getElementById('spinBtn');
  const label = document.getElementById('spinBtnLabel');
  const resultCard = document.getElementById('resultCard');

  btn.disabled = true;
  btn.classList.add('spinning');
  label.textContent = '⟳ Deciding…';
  resultCard.classList.add('hidden');

  let ticks = 0;
  const maxTicks = 12 + Math.floor(Math.random() * 8);
  const resultText = document.getElementById('resultText');

  const tick = setInterval(() => {
    const rand = opts[Math.floor(Math.random() * opts.length)];
    resultText.textContent = rand;
    resultCard.classList.remove('hidden');
    ticks++;
    if (ticks >= maxTicks) {
      clearInterval(tick);
      // Final pick
      const pick = opts[Math.floor(Math.random() * opts.length)];
      state.currentResult = pick;
      resultText.textContent = pick;

      btn.disabled = opts.length < 2;
      btn.classList.remove('spinning');
      label.textContent = '✦ Pick For Me';

      fireConfetti();
    }
  }, 80);
}

document.getElementById('doneBtn').addEventListener('click', () => {
  if (state.currentResult) {
    const opts = getActiveOptions();
    const idx = opts.indexOf(state.currentResult);
    if (idx !== -1) { opts.splice(idx, 1); setActiveOptions(opts); }
    renderOptions();
    document.getElementById('resultCard').classList.add('hidden');
    showToast('✓ Done! Great work.', 'success');
    state.currentResult = null;
    fireConfetti();
  }
});

document.getElementById('removeResultBtn').addEventListener('click', () => {
  if (state.currentResult) {
    const opts = getActiveOptions();
    const idx = opts.indexOf(state.currentResult);
    if (idx !== -1) { opts.splice(idx, 1); setActiveOptions(opts); }
    renderOptions();
    document.getElementById('resultCard').classList.add('hidden');
    showToast('Removed from list.', '');
    state.currentResult = null;
  }
});

// Presets
document.querySelectorAll('.preset-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const key = chip.dataset.preset;
    const items = PRESETS[key] || [];
    const opts = getActiveOptions();
    let added = 0;
    items.forEach(item => {
      if (!opts.includes(item)) { opts.push(item); added++; }
    });
    setActiveOptions(opts);
    renderOptions();
    showToast(`Added ${added} options!`, 'success');
  });
});

// List Selector
function updateListSelector() {
  const sel = document.getElementById('spinListSelect');
  const current = sel.value;
  sel.innerHTML = '<option value="__default">Quick Add (no list)</option>';
  Object.entries(state.savedLists).forEach(([id, list]) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = `${list.name} (${list.items.length})`;
    sel.appendChild(opt);
  });
  sel.value = current in state.savedLists || current === '__default' ? current : '__default';
  state.spinListId = sel.value;
}

document.getElementById('spinListSelect').addEventListener('change', e => {
  state.spinListId = e.target.value;
  document.getElementById('resultCard').classList.add('hidden');
  state.currentResult = null;
  renderOptions();
});

// ─── PRIORITY TAB ─────────────────────────────────────────────────
function renderPriorities() {
  const container = document.getElementById('priorityList');
  const empty = document.getElementById('priorityEmpty');
  const pickBtn = document.getElementById('pickTopBtn');
  const progressWrap = document.getElementById('progressWrap');
  const progressBar = document.getElementById('progressBar');
  const progressLabel = document.getElementById('progressLabel');

  const items = state.priorities;

  // Clear
  [...container.children].forEach(c => { if (c !== empty) c.remove(); });

  if (items.length === 0) {
    empty.style.display = '';
    pickBtn.classList.add('hidden');
    progressWrap.classList.add('hidden');
    document.getElementById('topPriorityCard').classList.add('hidden');
    return;
  }

  empty.style.display = 'none';
  pickBtn.classList.remove('hidden');
  progressWrap.classList.remove('hidden');

  const done = items.filter(i => i.done).length;
  const pct = Math.round((done / items.length) * 100);
  progressBar.style.width = pct + '%';
  progressLabel.textContent = `${done}/${items.length} done`;

  items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = `priority-item${item.done ? ' done' : ''}`;
    row.style.animationDelay = `${i * 0.05}s`;
    row.innerHTML = `
      <span class="priority-num">${i + 1}</span>
      <span class="priority-text">${escHtml(item.text)}</span>
      <button class="priority-check" data-id="${item.id}" title="Mark done">✓</button>
      <button class="priority-delete" data-id="${item.id}" title="Delete">✕</button>
    `;
    container.appendChild(row);
  });
}

document.getElementById('addPriorityBtn').addEventListener('click', addPriority);
document.getElementById('priorityInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addPriority();
});

function addPriority() {
  if (state.priorities.length >= 5) {
    showToast('Max 5 priorities — focus is the point!', 'error');
    return;
  }
  const input = document.getElementById('priorityInput');
  const val = input.value.trim();
  if (!val) return;
  state.priorities.push({ id: uid(), text: val, done: false });
  persist();
  input.value = '';
  input.focus();
  renderPriorities();
}

document.getElementById('priorityList').addEventListener('click', e => {
  const checkBtn = e.target.closest('.priority-check');
  const delBtn   = e.target.closest('.priority-delete');

  if (checkBtn) {
    const id = checkBtn.dataset.id;
    const item = state.priorities.find(p => p.id === id);
    if (item) {
      item.done = !item.done;
      persist();
      renderPriorities();
      if (item.done) {
        showToast('✓ Nice work!', 'success');
        fireConfetti();
      }
    }
  }

  if (delBtn) {
    const id = delBtn.dataset.id;
    state.priorities = state.priorities.filter(p => p.id !== id);
    persist();
    renderPriorities();
    document.getElementById('topPriorityCard').classList.add('hidden');
  }
});

document.getElementById('pickTopBtn').addEventListener('click', () => {
  const notDone = state.priorities.filter(p => !p.done);
  if (!notDone.length) {
    showToast('🎉 All done! You crushed it.', 'success');
    fireConfetti();
    return;
  }
  // Top undone
  const top = notDone[0];
  document.getElementById('topPriorityText').textContent = top.text;
  document.getElementById('topPriorityCard').classList.remove('hidden');
  document.getElementById('topPriorityCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.getElementById('topDoneBtn').addEventListener('click', () => {
  const text = document.getElementById('topPriorityText').textContent;
  const item = state.priorities.find(p => p.text === text && !p.done);
  if (item) {
    item.done = true;
    persist();
    renderPriorities();
    document.getElementById('topPriorityCard').classList.add('hidden');
    showToast('✓ Done! What a legend.', 'success');
    fireConfetti();
  }
});

// ─── LISTS TAB ────────────────────────────────────────────────────
function renderSavedLists() {
  const container = document.getElementById('savedLists');
  const empty     = document.getElementById('listsEmpty');
  const lists = state.savedLists;

  [...container.children].forEach(c => { if (c !== empty) c.remove(); });

  if (!Object.keys(lists).length) {
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';

  Object.entries(lists).forEach(([id, list]) => {
    const card = document.createElement('div');
    card.className = 'list-card';
    card.dataset.id = id;

    const header = document.createElement('div');
    header.className = 'list-card-header';
    header.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="list-card-name">${escHtml(list.name)}</span>
        <span class="list-card-count">${list.items.length} item${list.items.length !== 1 ? 's' : ''}</span>
      </div>
      <span class="text-xs opacity-40 list-toggle-icon">▾</span>
    `;

    const body = document.createElement('div');
    body.className = 'list-card-body';

    // Items
    list.items.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'list-item-row';
      row.innerHTML = `
        <span class="flex-1">${escHtml(item)}</span>
        <button class="list-delete-btn" data-list="${id}" data-idx="${i}" title="Remove">✕</button>
      `;
      body.appendChild(row);
    });

    // Add item row
    const addRow = document.createElement('div');
    addRow.className = 'list-add-row';
    addRow.innerHTML = `
      <input type="text" class="flex-1 rounded-xl px-3 py-2 text-xs input-field list-item-input" placeholder="Add item…" maxlength="60" data-list="${id}" />
      <button class="action-btn rounded-xl px-3 py-2 text-xs list-item-add-btn" data-list="${id}">+ Add</button>
    `;
    body.appendChild(addRow);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'list-actions';
    actions.innerHTML = `
      <button class="list-action-btn load-list-btn" data-list="${id}">📥 Use in Spin</button>
      <button class="list-delete-all-btn delete-list-btn" data-list="${id}">Delete list</button>
    `;
    body.appendChild(actions);

    header.addEventListener('click', () => {
      body.classList.toggle('open');
      header.querySelector('.list-toggle-icon').textContent = body.classList.contains('open') ? '▴' : '▾';
    });

    card.appendChild(header);
    card.appendChild(body);
    container.appendChild(card);
  });
}

document.getElementById('createListBtn').addEventListener('click', createList);
document.getElementById('newListInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') createList();
});

function createList() {
  const input = document.getElementById('newListInput');
  const name = input.value.trim();
  if (!name) return;
  if (Object.values(state.savedLists).some(l => l.name === name)) {
    showToast('A list with that name exists!', 'error');
    return;
  }
  const id = uid();
  state.savedLists[id] = { name, items: [] };
  persist();
  input.value = '';
  renderSavedLists();
  updateListSelector();
  showToast(`"${name}" created!`, 'success');
}

document.getElementById('savedLists').addEventListener('click', e => {
  // Delete item
  const delItemBtn = e.target.closest('.list-delete-btn');
  if (delItemBtn) {
    const { list, idx } = delItemBtn.dataset;
    if (state.savedLists[list]) {
      state.savedLists[list].items.splice(parseInt(idx), 1);
      persist();
      renderSavedLists();
      updateListSelector();
    }
  }

  // Add item
  const addItemBtn = e.target.closest('.list-item-add-btn');
  if (addItemBtn) {
    const listId = addItemBtn.dataset.list;
    const inputEl = addItemBtn.closest('.list-add-row').querySelector('.list-item-input');
    const val = inputEl.value.trim();
    if (!val) return;
    if (!state.savedLists[listId]) return;
    state.savedLists[listId].items.push(val);
    persist();
    inputEl.value = '';
    renderSavedLists();
    updateListSelector();
  }

  // Load list into spin
  const loadBtn = e.target.closest('.load-list-btn');
  if (loadBtn) {
    const listId = loadBtn.dataset.list;
    state.spinListId = listId;
    document.getElementById('spinListSelect').value = listId;
    // Switch to spin tab
    document.querySelector('[data-tab="spin"]').click();
    renderOptions();
    showToast(`"${state.savedLists[listId].name}" loaded into Spin`, 'success');
  }

  // Delete list
  const deleteListBtn = e.target.closest('.delete-list-btn');
  if (deleteListBtn) {
    const listId = deleteListBtn.dataset.list;
    const name = state.savedLists[listId]?.name || 'this list';
    if (confirm(`Delete "${name}"? This can't be undone.`)) {
      delete state.savedLists[listId];
      if (state.spinListId === listId) state.spinListId = '__default';
      persist();
      renderSavedLists();
      updateListSelector();
      showToast('List deleted.', '');
    }
  }
});

document.getElementById('savedLists').addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const input = e.target.closest('.list-item-input');
  if (input) {
    const listId = input.dataset.list;
    const val = input.value.trim();
    if (!val || !state.savedLists[listId]) return;
    state.savedLists[listId].items.push(val);
    persist();
    input.value = '';
    renderSavedLists();
    updateListSelector();
  }
});

// ─── Init ─────────────────────────────────────────────────────────
function init() {
  applyTheme(state.theme);
  updateListSelector();
  renderOptions();
  renderPriorities();
  renderSavedLists();
}

init();
