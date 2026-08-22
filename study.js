(() => {
  const STORAGE_KEY = 'etFlashCards.studyStatus.v1';
  const $ = (selector) => document.querySelector(selector);

  const unitSelect = $('#unitSelect');
  const cardGrid = $('#cardGrid');
  const studyFilter = $('#studyFilter');
  const unitNav = $('#unitNav');
  const knownCount = $('#knownCount');
  const hardCount = $('#hardCount');
  const knownBinCount = $('#knownBinCount');
  const hardBinCount = $('#hardBinCount');
  const sizePreset = $('#sizePreset');
  const widthInput = $('#cardWidth');
  const heightInput = $('#cardHeight');
  const sheetEstimate = $('#sheetEstimate');

  if (!unitSelect || !cardGrid) return;

  function readStatus() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeStatus(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Study status is an enhancement. The core card + print workflow still works without storage.
    }
  }

  function cardIdFrom(card) {
    return card.querySelector('.card-number')?.textContent?.trim() || '';
  }

  function getState(id) {
    if (!id) return '';
    return readStatus()[id] || '';
  }

  function setState(id, value) {
    if (!id) return;
    const state = readStatus();
    if (state[id] === value) delete state[id];
    else state[id] = value;
    writeStatus(state);
    decorateCards();
  }

  function decorateCard(card) {
    const id = cardIdFrom(card);
    if (!id) return;

    const status = getState(id);
    card.dataset.studyStatus = status || 'new';

    let actions = card.querySelector('.study-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'study-actions no-print';

      const reveal = document.createElement('button');
      reveal.type = 'button';
      reveal.className = 'reveal-btn';
      reveal.textContent = '👁 පිළිතුර සඟවන්න';
      reveal.addEventListener('click', () => {
        const answerWrap = card.querySelector('.answer-wrap');
        if (!answerWrap) return;
        const hidden = answerWrap.classList.toggle('is-hidden');
        reveal.textContent = hidden ? '👁 පිළිතුර බලන්න' : '👁 පිළිතුර සඟවන්න';
      });

      const known = document.createElement('button');
      known.type = 'button';
      known.className = 'known-btn';
      known.textContent = '✓ පුළුවන්';
      known.addEventListener('click', () => setState(id, 'known'));

      const hard = document.createElement('button');
      hard.type = 'button';
      hard.className = 'hard-btn';
      hard.textContent = '↻ බැරි';
      hard.addEventListener('click', () => setState(id, 'hard'));

      actions.append(reveal, known, hard);
      card.append(actions);
    }

    actions.querySelector('.known-btn')?.classList.toggle('active', status === 'known');
    actions.querySelector('.hard-btn')?.classList.toggle('active', status === 'hard');
  }

  function filterCards() {
    const filter = studyFilter?.value || 'all';
    let visible = 0;

    cardGrid.querySelectorAll('.flash-card').forEach((card) => {
      const status = card.dataset.studyStatus || 'new';
      const show = filter === 'all' || status === filter;
      card.hidden = !show;
      if (show) visible += 1;
    });

    const empty = $('#emptyState');
    if (empty) empty.hidden = visible > 0;
    const hero = $('#heroCount');
    if (hero) hero.textContent = String(visible);
  }

  function updateCounts() {
    let known = 0;
    let hard = 0;
    cardGrid.querySelectorAll('.flash-card').forEach((card) => {
      const status = card.dataset.studyStatus;
      if (status === 'known') known += 1;
      if (status === 'hard') hard += 1;
    });

    [knownCount, knownBinCount].forEach((el) => { if (el) el.textContent = String(known); });
    [hardCount, hardBinCount].forEach((el) => { if (el) el.textContent = String(hard); });
  }

  function decorateCards() {
    cardGrid.querySelectorAll('.flash-card').forEach(decorateCard);
    updateCounts();
    filterCards();
    renderUnitNav();
  }

  function parseUnitOption(option) {
    const value = option.value || '';
    const text = option.textContent?.trim() || `Unit ${value}`;
    const title = text.replace(/^Unit\s*\d+\s*[—-]?\s*/i, '') || text;
    return { id: value, title };
  }

  function renderUnitNav() {
    if (!unitNav) return;
    const options = Array.from(unitSelect.options);
    const current = unitSelect.value;
    const state = readStatus();

    unitNav.innerHTML = '';
    options.forEach((option) => {
      const unit = parseUnitOption(option);
      const prefix = `${unit.id}-`;
      const known = Object.entries(state).filter(([id, status]) => id.startsWith(prefix) && status === 'known').length;
      const hard = Object.entries(state).filter(([id, status]) => id.startsWith(prefix) && status === 'hard').length;

      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = `unit-tile${unit.id === current ? ' active' : ''}`;
      tile.innerHTML = `
        <div class="unit-tile-top">
          <span class="unit-tile-number">${escapeHtml(unit.id)}</span>
          <small>${unit.id === current ? 'ACTIVE UNIT' : 'OPEN UNIT'}</small>
        </div>
        <h3>${escapeHtml(unit.title)}</h3>
        <p>Cards are kept in source-note order with stable unit numbering.</p>
        <div class="unit-tile-foot"><span>✓ ${known} පුළුවන්</span><span>↻ ${hard} බැරි</span><b>Open →</b></div>`;
      tile.addEventListener('click', () => {
        unitSelect.value = unit.id;
        unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('#print-studio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      unitNav.append(tile);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);
  }

  function dimensions() {
    const preset = sizePreset?.value || 'medium';
    if (preset === 'small') return [70, 45];
    if (preset === 'large') return [100, 65];
    if (preset === 'custom') {
      const w = Math.min(120, Math.max(55, Number(widthInput?.value) || 85));
      const h = Math.min(90, Math.max(35, Number(heightInput?.value) || 55));
      return [w, h];
    }
    return [85, 55];
  }

  function updateSheetEstimate() {
    if (!sheetEstimate) return;
    const [w, h] = dimensions();
    const usableW = 196;
    const usableH = 283;
    const gap = 3;
    const columns = Math.max(1, Math.floor((usableW + gap) / (w + gap)));
    const rows = Math.max(1, Math.floor((usableH + gap) / (h + gap)));
    sheetEstimate.textContent = String(columns * rows);
  }

  const observer = new MutationObserver(() => decorateCards());
  observer.observe(cardGrid, { childList: true });

  studyFilter?.addEventListener('change', filterCards);
  unitSelect.addEventListener('change', () => queueMicrotask(decorateCards));
  sizePreset?.addEventListener('change', updateSheetEstimate);
  widthInput?.addEventListener('input', updateSheetEstimate);
  heightInput?.addEventListener('input', updateSheetEstimate);

  decorateCards();
  updateSheetEstimate();
})();
