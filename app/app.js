// Leonida Trophy Guide: offline tracker for the 55 GTA VI PS5 trophies.
// Progress lives in localStorage; the trophy data comes from data/trophies.json,
// a file inside this app, so the guide works with the network off.
const STORE_KEY = 'leonida-trophy-guide-v1';
const KINDS = [
  { id: 'all', label: 'All trophies' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'activities', label: 'Activities' },
  { id: 'online', label: 'Online' },
];
const ROADMAP = [
  { title: 'Stage 1 — Play the story', text: 'Chapters 1–4 and the final mission, plus the named story missions. All 12 of these trophies are unmissable — just finish the missions in order.', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
  { title: 'Stage 2 — Stranger strands', text: 'The optional questlines for Andy, Billy, Kenton, Randy, Tyrone and Bret, plus 8 stranger strands for Strangers & Freaks. Finales stay open after the story — but race Yago the moment it appears in Chapter 3.', ids: [22, 23, 24, 25, 26, 27, 29] },
  { title: 'Stage 3 — Partners, robberies & free roam', text: 'Partner trophies, bank vaults, jewelry and truck robberies, Combat Focus, the airliner and the tank, the secret one-offs, and the activity trophies (races, fishing, arcade, shooting range).', ids: [33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 16, 17, 18, 19, 20, 21] },
  { title: 'Stage 4 — Collectibles & the long grind', text: 'Meditation spots, card sets, WAiNK posts, vehicles, exploration, Challenges, stunts, money and garages — then 100% completion and the platinum.', ids: [14, 15, 28, 30, 31, 32, 35, 42, 52, 53, 54, 55, 1] },
];

const params = new URLSearchParams(location.search);
const listEl = document.getElementById('trophyList');
const detailBody = document.getElementById('detailBody');
const progressText = document.getElementById('progressText');
const gradeText = document.getElementById('gradeText');
const progressFill = document.getElementById('progressFill');
const progressBar = document.getElementById('progressBar');
const countLine = document.getElementById('countLine');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('search');
const gradeFilter = document.getElementById('gradeFilter');
const hideEarnedBox = document.getElementById('hideEarned');
const spoilerToggle = document.getElementById('spoilerToggle');
const kindRow = document.getElementById('kindRow');

let doc;
let earned = new Set();
let spoilerOn = true;
let kind = 'all';
let selectedId = null;

function loadStored() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
    if (Array.isArray(raw.earned)) earned = new Set(raw.earned.filter((n) => typeof n === 'string'));
    if (typeof raw.spoiler === 'boolean') spoilerOn = raw.spoiler;
  } catch { earned = new Set(); }
}
function saveStored() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned], spoiler: spoilerOn }));
}
function trophyById(id) { return doc.trophies.find((t) => t.id === id); }
function isSpoilerHidden(t) { return spoilerOn && t.hidden && !earned.has(t.name); }
function displayName(t) { return isSpoilerHidden(t) ? 'Hidden trophy' : t.name; }
function displayDesc(t) { return isSpoilerHidden(t) ? 'Hidden on PlayStation until earned — tick it off to reveal it.' : t.description; }

function matchesKind(t) {
  if (kind === 'all') return true;
  if (kind === 'missable') return t.missable;
  if (kind === 'online') return t.kinds.includes('online');
  return t.kinds.includes(kind);
}
function visibleTrophies() {
  const q = searchInput.value.trim().toLowerCase();
  return doc.trophies.filter((t) => {
    if (gradeFilter.value !== 'all' && t.grade !== gradeFilter.value) return false;
    if (!matchesKind(t)) return false;
    if (hideEarnedBox.checked && earned.has(t.name)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderTallies() {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of doc.trophies) counts[t.grade] += 1;
  const hidden = doc.trophies.filter((t) => t.hidden).length;
  const el = document.getElementById('tallies');
  el.replaceChildren();
  const labels = [
    `${doc.trophies.length} trophies`,
    `${counts.platinum} platinum · ${counts.gold} gold · ${counts.silver} silver · ${counts.bronze} bronze`,
    `${hidden} hidden until earned`,
    '0 online — all offline, single-player',
  ];
  for (const label of labels) {
    const span = document.createElement('span');
    span.className = 'tally';
    span.textContent = label;
    el.append(span);
  }
}

function renderProgress() {
  const total = doc.trophies.length;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  progressText.textContent = `${n} of ${total} earned · ${pct}%`;
  const byGrade = {};
  for (const t of doc.trophies) if (earned.has(t.name)) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + 1;
  gradeText.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .filter((g) => byGrade[g]).map((g) => `${byGrade[g]} ${g}`).join(' · ');
  progressFill.style.width = `${pct}%`;
  progressBar.setAttribute('aria-valuenow', String(n));
}

function renderRoadmap() {
  const stagesEl = document.getElementById('stages');
  stagesEl.replaceChildren();
  for (const stage of ROADMAP) {
    const li = document.createElement('li');
    li.className = 'stage';
    const done = stage.ids.filter((id) => earned.has(trophyById(id).name)).length;
    const h3 = document.createElement('h3');
    h3.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.text;
    const count = document.createElement('span');
    count.className = 'stage-count';
    count.textContent = `${done} of ${stage.ids.length} earned`;
    li.append(h3, p, count);
    stagesEl.append(li);
  }
  const missables = doc.trophies.filter((t) => t.missable);
  document.getElementById('missableSummary').textContent =
    `${missables.length} trophy can be missed: ${missables.map((t) => t.name).join(', ')} — the Chapter 1 balcony meditation disappears when Chapter 1 ends. ` +
    'Also time-sensitive: the race against Yago in Chapter 3 (Strangers & Freaks). Keep a manual save at the start of every chapter.';
}

function renderKinds() {
  kindRow.replaceChildren();
  for (const k of KINDS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kind-btn';
    btn.textContent = k.label;
    btn.setAttribute('aria-pressed', String(kind === k.id));
    btn.addEventListener('click', () => { kind = k.id; renderKinds(); renderList(); });
    kindRow.append(btn);
  }
}

function badge(text, cls) {
  const span = document.createElement('span');
  span.className = `badge ${cls}`;
  span.textContent = text;
  return span;
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren();
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.name) ? ' earned' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Earned: ${displayName(t)}`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      saveStored();
      renderAll();
    });
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = displayName(t);
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = displayDesc(t);
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(badge(t.grade, `grade-${t.grade}`));
    if (t.hidden) meta.append(badge(isSpoilerHidden(t) ? 'Hidden' : 'Hidden on PSN', 'hidden-badge'));
    if (t.missable) meta.append(badge('Missable', 'missable'));
    if (t.target) meta.append(badge(`PSN target: ${t.target.toLocaleString('en-US')}`, 'target'));
    for (const k of t.kinds) meta.append(badge(k, ''));
    body.append(name, desc, meta);
    const guideBtn = document.createElement('button');
    guideBtn.type = 'button';
    guideBtn.className = 'guide-btn';
    guideBtn.textContent = 'Guide';
    guideBtn.addEventListener('click', () => { selectedId = t.id; renderDetail(); });
    li.append(box, body, guideBtn);
    listEl.append(li);
  }
  emptyState.hidden = shown.length !== 0;
  countLine.textContent = `Showing ${shown.length} of ${doc.trophies.length} trophies · ${earned.size} earned`;
}

function renderDetail() {
  detailBody.replaceChildren();
  const t = selectedId ? trophyById(selectedId) : null;
  if (!t) {
    const p = document.createElement('p');
    p.className = 'panel-note';
    p.textContent = 'Select any trophy in the checklist to read its full guide here — what to do, where, how, when it can be missed, and the sources each fact comes from.';
    detailBody.append(p);
    return;
  }
  const name = document.createElement('h3');
  name.textContent = displayName(t);
  const grades = document.createElement('div');
  grades.className = 'detail-grade';
  grades.append(badge(t.grade, `grade-${t.grade}`));
  if (t.hidden) grades.append(badge('Hidden on PSN', 'hidden-badge'));
  if (t.missable) grades.append(badge('Missable', 'missable'));
  if (t.target) grades.append(badge(`PSN target: ${t.target.toLocaleString('en-US')}`, 'target'));
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = `Official description: “${displayDesc(t)}”`;
  detailBody.append(name, grades, desc);
  if (isSpoilerHidden(t)) {
    const p = document.createElement('p');
    p.className = 'spoiler-hidden';
    p.textContent = 'This trophy is hidden on PlayStation until you earn it. Its guide is hidden too — tick the trophy off in the checklist (or switch the spoiler setting off) to reveal it.';
    detailBody.append(p);
    return;
  }
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = t.guide;
  const sources = document.createElement('div');
  sources.className = 'detail-sources';
  const label = document.createElement('strong');
  label.textContent = 'Sources: ';
  sources.append(label);
  for (const s of t.sources) {
    const a = document.createElement('a');
    a.href = doc.meta.sourceList[s];
    a.textContent = s;
    a.rel = 'noopener';
    sources.append(a);
  }
  const note = document.createElement('span');
  note.textContent = ' — names, descriptions and grades from the official list; specific steps from the named guide where one is listed.';
  sources.append(note);
  detailBody.append(guide, sources);
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderList();
  renderDetail();
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ app: 'leonida-trophy-guide', earned: [...earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  const data = JSON.parse(await file.text());
  const names = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(names)) throw new Error('Not a progress file: expected a list of trophy names.');
  const known = new Set(doc.trophies.map((t) => t.name));
  earned = new Set(names.filter((n) => known.has(n)));
  saveStored();
  renderAll();
}

document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try { await importProgress(file); } catch { alert('That file is not a valid progress export.'); }
  e.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveStored();
  renderAll();
});
searchInput.addEventListener('input', renderList);
gradeFilter.addEventListener('change', renderList);
hideEarnedBox.addEventListener('change', renderList);
spoilerToggle.addEventListener('change', () => { spoilerOn = spoilerToggle.checked; saveStored(); renderAll(); });

loadStored();
doc = await (await fetch('data/trophies.json')).json();

// Deep links for sharing and screenshots: ?kind=story&grade=silver&trophy=28&spoilers=off
if (params.get('kind') && KINDS.some((k) => k.id === params.get('kind'))) kind = params.get('kind');
if (params.get('grade')) gradeFilter.value = params.get('grade');
if (params.get('spoilers') === 'off') spoilerOn = false;
if (params.get('trophy')) {
  const id = Number(params.get('trophy'));
  if (trophyById(id)) selectedId = id;
}
// Demo seeding for screenshots: ?seed=13 ticks the first 13 roadmap trophies.
if (params.get('seed')) {
  const n = Number(params.get('seed'));
  const order = ROADMAP.flatMap((s) => s.ids);
  for (const id of order.slice(0, n)) earned.add(trophyById(id).name);
  saveStored();
}
spoilerToggle.checked = spoilerOn;
renderTallies();
renderKinds();
renderAll();
