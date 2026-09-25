// ============ Huddle Crew — SPA router + views ============
// Hash-based routing so the whole thing behaves like a native app (no page
// reloads) and wraps cleanly into Capacitor later. Views are template
// strings injected into #app; events are handled by delegation so we never
// have to re-bind listeners after a re-render.

const $app = document.getElementById('app');
const $tabbar = document.getElementById('tabbar');

// ---------- transient (non-persisted) UI state ----------
let calMonth = new Date(2026, 9, 1); // October 2026, matches design
let selectedDate = '2026-10-14';
let contactsSubTab = 'parents'; // 'parents' | 'crews'
let exploreSearch = '';
let exploreQuick = 'all'; // all | age58 | sports | art
let filterState = { ageRange: null, types: new Set(), distance: 10, price: null, dates: 'July 2026 (Any week)' };

// ---------- tiny icon set ----------
const ICONS = {
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  chevL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  chevR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
  filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8 5.7 21l1.2-6.9-5-4.9 7-1z"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
  cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5 15.4 6.5M8.6 13.5l6.8 4"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  checklist: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 12 2.5 2.5L16 9"/></svg>`,
  message: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 1 1-3.5-6.6L21 4l-1 4.5A8 8 0 0 1 21 12Z"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 3a2 2 0 0 1-.4 2.1L8 10a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.4c1 .3 2 .5 3 .6a2 2 0 0 1 1.7 2Z"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`,
  crew: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="18" cy="9" r="2.3"/><path d="M15.5 14a5 5 0 0 1 5.4 5.8"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/></svg>`,
};

function iconBtn(name, { action, arg, extraClass = '' } = {}) {
  return `<button class="icon-btn ${extraClass}" ${action ? `data-action="${action}"` : ''} ${arg !== undefined ? `data-arg="${arg}"` : ''}>${ICONS[name]}</button>`;
}

// ---------- helpers ----------
function h(strings, ...vals) { return strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ''), ''); }
function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function kidById(id) { return state.kids.find(k => k.id === id); }
function contactById(id) { return state.contacts.find(c => c.id === id); }
function crewById(id) { return state.crews.find(c => c.id === id); }
function activityById(id) { return state.activities.find(a => a.id === id); }
function isFav(id) { return state.favorites.includes(id); }
function uid(prefix) { return prefix + Math.random().toString(36).slice(2, 8); }

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

function fmtMonthDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

const TAG_COLOR = { PLAYDATE: '#E8934A', SPORTS: '#4C7BD9', CREW: '#8B7CF6', ARTS: '#0E9C7C', MUSIC: '#0E9C7C', 'SOCCER PICKUP': '#4C7BD9' };
const TAG_BADGE_CLASS = { PLAYDATE: 'orange', SPORTS: 'blue', CREW: 'purple', ARTS: 'teal', MUSIC: 'teal', 'SOCCER PICKUP': 'blue' };

function parseAgeRange(str) {
  const m = String(str).match(/(\d+)\D+(\d+)/);
  if (!m) return [0, 99];
  return [parseInt(m[1], 10), parseInt(m[2], 10)];
}
function rangesOverlap(a, b) { return a[0] <= b[1] && b[0] <= a[1]; }

// ============ Topbar / shared fragments ============
function topbar(title, { back = false, backTo = null, rightHtml = '' } = {}) {
  return `<div class="topbar">
    ${back ? `<button class="icon-btn" data-action="back" ${backTo ? `data-arg="${backTo}"` : ''}>${ICONS.back}</button>` : ''}
    <h1>${title}</h1>
    ${rightHtml}
  </div>`;
}

function avatarImg(src, size = 42) {
  return `<img class="avatar" src="${src}" width="${size}" height="${size}" alt="" />`;
}
function avatarInitial(letter, color, size = 42, textColor) {
  const style = `width:${size}px;height:${size}px;background:${color};font-size:${size * 0.42}px${textColor ? `;color:${textColor}` : ''}`;
  return `<div class="avatar-initial" style="${style}">${letter}</div>`;
}
function stackedAvatars(srcs, size = 26) {
  return `<div class="row" style="gap:0">${srcs.map((src, i) => `<img class="avatar" src="${src}" width="${size}" height="${size}" style="border:2px solid #fff;${i > 0 ? `margin-left:-${Math.round(size * 0.3)}px` : ''}" alt="" />`).join('')}</div>`;
}

// ============ VIEW: pre-sign-in ============
function viewWelcome() {
  const features = [
    { icon: '🗓️', bg: 'var(--teal-tint)', fg: 'var(--teal)', title: 'Sync Schedules', body: "See your child's friends' summer plans seamlessly. Sync events directly to your Google, Outlook, or Exchange family calendar." },
    { icon: '💬', bg: 'var(--orange-tint)', fg: 'var(--orange)', title: 'Coordinate Together', body: 'Chat and vote on camps, activities, and other events as a group. Propose camps to your friend group and vote together on the best options for your kids.' },
    { icon: '📅', bg: 'var(--blue-tint)', fg: 'var(--blue)', title: 'Visual Schedule Planning', body: "Map out your entire summer with an intuitive calendar. See your kids' camps, vacations, and free time — plus your friends' schedules." },
    { icon: '🧭', bg: 'var(--teal-tint)', fg: 'var(--teal)', title: 'School Schedules', body: "Does your school have activities, fundraisers, dances, half days, spring break? Let us know where your kid goes to school and we'll bring in their school calendar, too." },
    { icon: '💬', bg: 'var(--orange-tint)', fg: 'var(--orange)', title: 'Reviews & Recommendations', body: 'Read authentic reviews from other parents and get personalized camp recommendations based on your preferences.' },
    { icon: '⏳', bg: 'var(--teal-tint)', fg: 'var(--teal)', title: 'Smart Filtering', body: 'Find the perfect camp or activity with advanced filters by location, type, dates, cost, and more. Track favorites and share your proposed, booked schedule only with the people you know and invite.' },
  ];
  return `<div class="screen">
    <img class="hero-img" src="${PIC(1084, 800, 500)}" alt="" />
    <div class="brand">🌿 Huddle Crew</div>
    <h1 class="h-title">The all-in-one platform for parents, camp organizers, and families to plan, discover, and share activities together.</h1>
    <div class="search-bar" data-action="go" data-arg="#/signin">
      ${ICONS.search}<input placeholder="Search camps, sports, arts…" readonly />${ICONS.filter}
    </div>
    ${features.map(f => `<div class="card" style="padding:0;"><div class="feature-row">
      <div class="f-icon" style="background:${f.bg};color:${f.fg}">${f.icon}</div>
      <div><h3>${f.title}</h3><p>${f.body}</p></div>
    </div></div>`).join('')}
    <button class="btn btn-primary" style="margin-top:6px" data-action="go" data-arg="#/signin">Get Started</button>
    <p style="text-align:center;color:var(--muted);font-size:13.5px;margin:14px 0 24px">
      Already have an account? <a href="#/signin" style="color:var(--teal);font-weight:700">Sign In</a>
    </p>
    <div style="background:#EDE9DC;margin:0 -20px;padding:20px;font-size:12.5px;color:var(--muted)">
      <div style="display:flex;gap:24px;flex-wrap:wrap">
        <div><strong style="display:block;color:var(--ink-soft);font-size:11px;letter-spacing:.5px;margin-bottom:6px">PRODUCT</strong>Features<br>How it Works<br>Pricing</div>
        <div><strong style="display:block;color:var(--ink-soft);font-size:11px;letter-spacing:.5px;margin-bottom:6px">RESOURCES</strong>Help Center<br>Contact Us<br>Blog</div>
        <div><strong style="display:block;color:var(--ink-soft);font-size:11px;letter-spacing:.5px;margin-bottom:6px">LEGAL</strong>Privacy Policy<br>Terms of Service</div>
      </div>
      <p style="text-align:center;margin:16px 0 0">© 2026 Huddle Crew</p>
    </div>
  </div>`;
}

// ============ VIEW: sign-in ============
function viewSignIn() {
  const glyph = (bg, fg, txt) => `<span class="glyph" style="width:22px;height:22px;border-radius:50%;background:${bg};color:${fg};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800">${txt}</span>`;
  return `
  <button class="back-fab" data-action="back" data-arg="#/welcome">${ICONS.back}</button>
  <div class="screen" style="text-align:center;padding-top:10px">
    <div class="brand" style="justify-content:center">🌿 Huddle Crew</div>
    <h1 class="h-title" style="text-align:center;font-size:24px">Welcome to Huddle Crew</h1>
    <p class="text-muted" style="margin:-6px 0 22px">Choose how you'd like to sign in</p>
    <div style="text-align:left">
      <button class="auth-option" data-action="signin" data-arg="Google">${glyph('#fce8e6', '#c5221f', 'G')}<span class="flex-1" style="text-align:center">Sign in with Google</span></button>
      <button class="auth-option" data-action="signin" data-arg="Outlook">${glyph('#e5edfb', '#2b579a', 'O')}<span class="flex-1" style="text-align:center">Sign in with Outlook</span></button>
      <button class="auth-option" data-action="signin" data-arg="Apple">${glyph('#111', '#fff', '')}<span class="flex-1" style="text-align:center">Sign in with Apple</span></button>
      <button class="auth-option" data-action="signin" data-arg="Facebook">${glyph('#e7f0ff', '#1877f2', 'f')}<span class="flex-1" style="text-align:center">Sign in with Facebook</span></button>
      <button class="btn btn-primary" style="margin-top:6px" data-action="signin" data-arg="email">✉️ Create your own account</button>
    </div>
    <p style="font-size:12px;color:var(--muted);margin-top:18px">By continuing, you agree to our <a style="color:var(--teal);font-weight:700">Terms of Service</a> and <a style="color:var(--teal);font-weight:700">Privacy Policy</a></p>
  </div>`;
}

// ============ VIEW: home ============
function viewHome() {
  const u = state.user;
  const days = [];
  const base = new Date(2026, 9, 12); // Mon Oct 12 2026
  for (let i = 0; i < 7; i++) {
    const d = new Date(base); d.setDate(base.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const has = state.events.some(e => e.date === iso);
    days.push({ label: 'MTWTFSS'[i], num: d.getDate(), iso, has });
  }
  const today = state.events.filter(e => e.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  return `<div class="screen">
    <div class="row-between" style="padding-top:14px;margin-bottom:18px">
      <div><p class="eyebrow" style="margin-bottom:2px">Welcome back</p><h1 style="margin:0;font-size:24px;font-weight:800">Hi, ${u.name.split(' ')[0]}! 👋</h1></div>
      <a href="#/profile">${avatarImg(u.avatar, 46)}</a>
    </div>
    <div class="row-between"><h2 class="section-title" style="margin-top:0">This Week</h2><a href="#/calendar" class="link-btn">View Calendar</a></div>
    <div style="display:flex;gap:6px;margin-bottom:18px">
      ${days.map(d => `<button class="cal-day ${d.iso === selectedDate ? 'today' : ''}" style="flex:1;aspect-ratio:unset;height:58px" data-action="pick-day" data-arg="${d.iso}">
        <span style="font-size:10px;font-weight:700;opacity:.75">${d.label}</span><span>${d.num}</span>
        ${d.has ? `<span style="width:4px;height:4px;border-radius:50%;background:${d.iso === selectedDate ? '#fff' : 'var(--teal)'}"></span>` : ''}
      </button>`).join('')}
    </div>
    <div style="display:flex;gap:12px;margin-bottom:22px">
      <div class="card" style="flex:1;background:var(--teal-tint);box-shadow:none;border:1px solid var(--teal-tint-border);cursor:pointer" data-action="go" data-arg="#/event/new">
        <div class="icon-btn accent" style="margin-bottom:8px">${ICONS.plus}</div>
        <strong style="display:block;font-size:14.5px">New Event</strong><span class="text-muted" style="font-size:12.5px">Coordinate playdate</span>
      </div>
      <div class="card" style="flex:1;cursor:pointer" data-action="go" data-arg="#/chat/c1">
        <div class="icon-btn" style="margin-bottom:8px">${ICONS.message}</div>
        <strong style="display:block;font-size:14.5px">Message</strong><span class="text-muted" style="font-size:12.5px">Quick chat</span>
      </div>
    </div>
    <h2 class="section-title" style="margin-top:0">Today's Schedule</h2>
    ${today.length ? today.map(e => scheduleCard(e)).join('') : `<p class="text-muted" style="padding:8px 4px">Nothing scheduled for ${fmtMonthDay(selectedDate)}.</p>`}
  </div>`;
}

function scheduleCard(e) {
  const badgeClass = TAG_BADGE_CLASS[e.tag] || 'teal';
  return `<div class="card">
    <div class="row" style="align-items:flex-start">
      <div style="width:56px;flex-shrink:0">
        <strong style="font-size:15px">${e.time.split(' ')[0]}</strong><br><span class="text-muted" style="font-size:11.5px">${e.time.split(' ')[1]}</span>
      </div>
      <div class="flex-1">
        <span class="badge ${badgeClass}" style="margin-bottom:6px;display:inline-block">${e.tag}</span>
        <h4 style="margin:0 0 4px;font-size:15.5px">${escapeHtml(e.title)}</h4>
        <div class="text-muted" style="font-size:12.5px;display:flex;align-items:center;gap:4px;margin-bottom:6px">${ICONS.pin}${escapeHtml(e.location)}</div>
        ${e.withName ? `<div class="row" style="gap:6px">${avatarInitial(e.withName[0], '#D9CFC0', 20)}<span class="text-muted" style="font-size:12.5px">${e.withName.startsWith('Coordinated') ? e.withName : 'Coordinated with ' + e.withName}</span></div>` : ''}
      </div>
    </div>
  </div>`;
}

// ============ VIEW: calendar ============
function viewCalendar() {
  const y = calMonth.getFullYear(), m = calMonth.getMonth();
  const first = new Date(y, m, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push({ n: prevDays - startOffset + i + 1, muted: true });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ n: d, iso, muted: false, events: state.events.filter(e => e.date === iso) });
  }
  while (cells.length % 7 !== 0) cells.push({ n: cells.length, muted: true });

  const dayEvents = state.events.filter(e => e.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));

  return `<div class="screen">
    <div class="row-between" style="padding-top:14px;margin-bottom:4px">
      <h1 style="margin:0;font-size:24px;font-weight:800">${calMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h1>
      <div class="cal-nav">${iconBtn('chevL', { action: 'cal-prev' })}${iconBtn('chevR', { action: 'cal-next' })}</div>
    </div>
    <div class="cal-grid">
      ${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => `<div class="cal-dow">${d}</div>`).join('')}
      ${cells.map(c => {
        if (c.muted) return `<div class="cal-day muted">${c.n}</div>`;
        const isSel = c.iso === selectedDate;
        const dots = (c.events || []).slice(0, 3).map(e => `<span style="background:${isSel ? '#fff' : (TAG_COLOR[e.tag] || 'var(--teal)')}"></span>`).join('');
        return `<button class="cal-day ${isSel ? 'today' : ''}" data-action="pick-day" data-arg="${c.iso}"><span>${c.n}</span><span class="dots">${dots}</span></button>`;
      }).join('')}
    </div>
    <h2 class="section-title" style="margin-top:8px">${fmtMonthDay(selectedDate)}</h2>
    ${dayEvents.length ? dayEvents.map(e => scheduleCard(e)).join('') : `<p class="text-muted" style="padding:8px 4px 20px">No events this day.</p>`}
  </div>`;
}

// ============ VIEW: new event ============
function viewNewEvent() {
  return `
  <div class="modal-head">
    ${iconBtn('close', { action: 'back', arg: '#/calendar' })}
    <h1>Create New Event</h1>
    <button class="link-btn" data-action="draft">Draft</button>
  </div>
  <form class="screen" id="newEventForm">
    <p class="section-title" style="margin-top:6px">Which kid is this for?</p>
    <div class="chip-row">
      ${state.kids.map((k, i) => `<button type="button" class="chip check ${i === 0 ? 'active ghost' : ''}" data-action="pick-kid" data-arg="${k.id}">${avatarInitial(k.initial, k.color, 20)} ${k.nickname}</button>`).join('')}
    </div>
    <input type="hidden" name="kidId" value="${state.kids[0]?.id || ''}" />

    <p class="section-title">Invite Parents</p>
    <div class="chip-row">
      ${state.contacts.map((c, i) => `<button type="button" class="chip check ${i < 2 ? 'active ghost' : ''}" data-action="toggle-invite" data-arg="${c.id}">${avatarImg(c.avatar, 20)} ${c.name}</button>`).join('')}
      <button type="button" class="chip" data-action="invite-other">${ICONS.plus} Invite other…</button>
    </div>

    <div class="field"><label>Date &amp; Time</label>
      <input type="date" name="date" value="${selectedDate}" />
    </div>
    <div class="field-row">
      <div class="field"><label>Start Time</label><input type="time" name="startTime" value="15:00" /></div>
      <div class="field"><label>End Time</label><input type="time" name="endTime" value="17:00" /></div>
    </div>
    <div class="field"><label>Location</label><input type="text" name="location" placeholder="Sunset Park Playground" /></div>

    <div class="toggle-row">
      <div class="toggle-copy"><strong>Set as Recurring</strong><span>Repeat this schedule weekly</span></div>
      <label class="switch"><input type="checkbox" name="recurring" /><span class="track"></span><span class="thumb"></span></label>
    </div>

    <div class="field"><label>Playdate Notes</label><textarea name="notes" placeholder="Bring scooters and sunscreen!"></textarea></div>
  </form>
  <div class="sticky-bottom">
    <button class="btn btn-primary" data-action="submit-event">Send Coordination Request</button>
  </div>`;
}

// ============ VIEW: explore ============
function viewExplore() {
  const list = state.activities.filter(a => {
    if (exploreSearch && !a.title.toLowerCase().includes(exploreSearch.toLowerCase())) return false;
    if (exploreQuick === 'sports' && a.category !== 'Sports') return false;
    if (exploreQuick === 'art' && a.category !== 'Art & STEM') return false;
    if (exploreQuick === 'age58' && !rangesOverlap(parseAgeRange(a.age), [5, 8])) return false;
    return true;
  });
  return `<div class="screen">
    <div class="row-between" style="padding-top:14px">
      <div><p class="eyebrow" style="margin-bottom:0">Discover Camps &amp; Classes</p><h1 style="margin:2px 0 14px;font-size:24px;font-weight:800">Local Activities 🌲</h1></div>
      <div class="row" style="gap:8px">
        ${iconBtn('heart', { action: 'go', arg: '#/saved', extraClass: state.favorites.length ? 'accent' : '' })}
        ${iconBtn('globe', { extraClass: 'accent' })}
      </div>
    </div>
    <div class="search-bar">
      ${ICONS.search}<input id="exploreSearch" placeholder="Search art, sports, science…" value="${escapeHtml(exploreSearch)}" />
      <button class="filter-btn" data-action="go" data-arg="#/explore/filters">${ICONS.filter}</button>
    </div>
    <div class="chip-row">
      <button class="chip ${exploreQuick === 'all' ? 'active' : ''}" data-action="quick-filter" data-arg="all">All</button>
      <button class="chip ${exploreQuick === 'age58' ? 'active' : ''}" data-action="quick-filter" data-arg="age58">Age 5-8</button>
      <button class="chip ${exploreQuick === 'sports' ? 'active' : ''}" data-action="quick-filter" data-arg="sports">Sports</button>
      <button class="chip ${exploreQuick === 'art' ? 'active' : ''}" data-action="quick-filter" data-arg="art">Art &amp; STEM</button>
    </div>
    <div class="row-between"><h2 class="section-title" style="margin-top:0">Nearby Activities (${list.length})</h2><a href="#" class="link-btn" data-action="noop">Map View</a></div>
    ${list.map(a => activityCard(a)).join('') || `<p class="empty-state">No activities match your filters.</p>`}
  </div>`;
}

function activityCard(a) {
  return `<div class="activity-card" data-action="go" data-arg="#/activity/${a.id}">
    <img src="${a.img}" alt="" />
    <div class="info">
      <div class="badges">
        <span class="badge blue">${a.age}</span><span class="badge orange">$${a.price}</span>
      </div>
      <div class="row-between" style="align-items:flex-start">
        <div>
          <h4>${escapeHtml(a.title)}</h4>
          <div class="by">By ${escapeHtml(a.by)}</div>
        </div>
        <div class="icon-row">
          <button data-action="quick-signup" data-arg="${a.id}" title="Sign up">${ICONS.checklist}</button>
          <button data-action="go" data-arg="#/share/${a.id}" title="Share">${ICONS.share}</button>
          <button class="heart ${isFav(a.id) ? 'active' : ''}" data-action="toggle-fav" data-arg="${a.id}" title="Save">${ICONS.heart}</button>
        </div>
      </div>
      <div class="bottom-row">
        <span class="dist">${ICONS.pin}${a.dist}</span>
        <span class="rating">${ICONS.star}${a.rating}</span>
      </div>
    </div>
  </div>`;
}

// ============ VIEW: explore filters (modal) ============
const AGE_OPTIONS = [['Toddler (2-4)', 2, 4], ['Early Elem (5-8)', 5, 8], ['Late Elem (9-11)', 9, 11], ['Middle School (12+)', 12, 99]];
const TYPE_OPTIONS = ['Sports', 'Arts & Crafts', 'STEM', 'Music & Dance', 'Nature', 'Academic Prep'];
const PRICE_OPTIONS = ['Free', 'Under $100', '$100 - $250', '$250+'];

function viewFilters() {
  const matchCount = state.activities.filter(a => filterMatches(a)).length;
  return `
  <div class="modal-head">
    ${iconBtn('close', { action: 'back', arg: '#/explore' })}
    <h1>Filter Activities</h1>
    <button class="link-btn" data-action="clear-filters">Clear All</button>
  </div>
  <div class="screen">
    <h2 class="section-title" style="margin-top:6px">Age Range</h2>
    <div class="chip-row">
      ${AGE_OPTIONS.map(([label, lo, hi]) => `<button class="chip ${filterState.ageRange && filterState.ageRange[0] === lo ? 'active ghost' : ''}" data-action="filter-age" data-arg="${lo},${hi}">${label}</button>`).join('')}
    </div>
    <h2 class="section-title">Activity Type</h2>
    <div class="chip-row">
      ${TYPE_OPTIONS.map(t => `<button class="chip ${filterState.types.has(t) ? 'active ghost' : ''}" data-action="filter-type" data-arg="${t}">${t}</button>`).join('')}
    </div>
    <div class="row-between"><h2 class="section-title" style="margin-top:22px">Distance Radius</h2><span style="color:var(--teal);font-weight:700;font-size:13.5px">Under ${filterState.distance} miles</span></div>
    <input type="range" min="1" max="25" value="${filterState.distance}" id="distanceRange" style="width:100%;accent-color:var(--teal)" />
    <h2 class="section-title">Price Range</h2>
    <div class="chip-row">
      ${PRICE_OPTIONS.map(p => `<button class="chip ${filterState.price === p ? 'active ghost' : ''}" data-action="filter-price" data-arg="${p}">${p}</button>`).join('')}
    </div>
    <h2 class="section-title">Preferred Dates</h2>
    <div class="field mb-0"><select id="preferredDates">
      ${['July 2026 (Any week)', 'June 2026 (Any week)', 'August 2026 (Any week)'].map(d => `<option ${filterState.dates === d ? 'selected' : ''}>${d}</option>`).join('')}
    </select></div>
  </div>
  <div class="sticky-bottom"><button class="btn btn-primary" data-action="apply-filters">Show ${matchCount} Results</button></div>`;
}

function filterMatches(a) {
  if (filterState.ageRange && !rangesOverlap(parseAgeRange(a.age), filterState.ageRange)) return false;
  if (filterState.types.size && !filterState.types.has(a.category === 'Art & STEM' ? (filterState.types.has('STEM') ? 'STEM' : 'Arts & Crafts') : a.category)) return false;
  if (filterState.price) {
    const p = a.price;
    if (filterState.price === 'Free' && p !== 0) return false;
    if (filterState.price === 'Under $100' && p >= 100) return false;
    if (filterState.price === '$100 - $250' && (p < 100 || p > 250)) return false;
    if (filterState.price === '$250+' && p <= 250) return false;
  }
  return true;
}

// ============ VIEW: activity detail ============
function viewActivityDetail(id) {
  const a = activityById(id);
  if (!a) return notFound();
  const similar = state.activities.filter(x => x.id !== a.id && x.category === a.category).slice(0, 2);
  return `<div class="screen" style="padding-top:0">
    <div style="margin:0 -20px 14px">
      <div style="position:relative">
        <img src="${a.img}" style="width:100%;height:220px;object-fit:cover" alt="" />
        <div style="position:absolute;top:14px;left:16px">${iconBtn('back', { action: 'back', arg: '#/explore' })}</div>
      </div>
    </div>
    <div class="badges" style="margin-bottom:8px">
      <span class="badge blue">${a.age}</span><span class="badge purple">${a.type}</span><span class="badge orange">$${a.price}/wk</span>
    </div>
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:800">${escapeHtml(a.title)}</h1>
    <p class="text-muted" style="margin:0 0 8px">Presented by ${escapeHtml(a.by)}</p>
    <div class="row" style="gap:6px;margin-bottom:16px"><span style="color:var(--star)">${ICONS.star}</span><strong>${a.rating}</strong><span class="text-muted">(${a.reviews} reviews)</span></div>

    <div class="card">
      <div class="row" style="margin-bottom:10px">${ICONS.cal}<div><strong style="display:block;font-size:14.5px">${a.dates}</strong><span class="text-muted" style="font-size:12.5px">${a.hours}</span></div></div>
      <div class="row">${ICONS.pin}<div><strong style="display:block;font-size:14.5px">${a.location.split(',')[0]}</strong><span class="text-muted" style="font-size:12.5px">${a.location}</span></div></div>
    </div>

    <div style="display:flex;justify-content:space-around;text-align:center;margin:18px 0">
      <div data-action="quick-signup" data-arg="${a.id}" style="cursor:pointer">${iconBtn('checklist')}<span style="display:block;font-size:12.5px;font-weight:700;margin-top:4px;color:var(--teal)">Sign Up</span></div>
      <div data-action="go" data-arg="#/share/${a.id}" style="cursor:pointer">${iconBtn('share')}<span style="display:block;font-size:12.5px;font-weight:700;margin-top:4px;color:var(--teal)">Share</span></div>
      <div data-action="toggle-fav" data-arg="${a.id}" style="cursor:pointer">${iconBtn('heart', { extraClass: isFav(a.id) ? 'accent' : '' })}<span style="display:block;font-size:12.5px;font-weight:700;margin-top:4px;color:var(--teal)">${isFav(a.id) ? 'Saved' : 'Save'}</span></div>
    </div>

    <h2 class="section-title" style="margin-top:8px">About this Activity</h2>
    <p style="font-size:14.5px;line-height:1.55;color:var(--ink-soft)">${escapeHtml(a.desc)}</p>

    <h2 class="section-title">Location Map</h2>
    <div style="height:120px;border-radius:var(--radius-lg);background:linear-gradient(135deg,#dfe9d8,#cfe3e9);display:flex;align-items:center;justify-content:center;margin-bottom:18px">
      <span style="color:var(--teal)">${ICONS.pin}</span>
    </div>

    <div class="row" style="gap:10px;margin-bottom:18px">
      <button class="icon-btn" style="width:52px;height:52px" data-action="toggle-fav" data-arg="${a.id}">${ICONS.heart}</button>
      <button class="btn btn-primary" data-action="register" data-arg="${a.id}">Register Now ($${a.price})</button>
    </div>

    ${similar.length ? `<h2 class="section-title">Similar Activities</h2>${similar.map(s => activityCard(s)).join('')}` : ''}
  </div>`;
}

// ============ VIEW: saved favorites ============
function viewSaved() {
  const list = state.favorites.map(activityById).filter(Boolean);
  return `<div class="screen">
    <div class="row-between" style="padding-top:14px">
      <div><p class="eyebrow" style="margin-bottom:0">Your Planning Board</p><h1 style="margin:2px 0 14px;font-size:24px;font-weight:800">Saved Activities ❤️</h1></div>
      <a href="#" class="link-btn" data-action="noop">Compare</a>
    </div>
    ${list.length ? list.map(a => activityCard(a)).join('') : `<p class="empty-state">No saved activities yet — tap the heart on any activity to save it here.</p>`}
    ${list.length ? `<div class="card" style="background:var(--orange-tint);box-shadow:none;border:none">
      <strong style="color:var(--orange);display:block;margin-bottom:4px">Coordination Tip</strong>
      <span style="font-size:13.5px;color:var(--ink-soft)">Share these saved camps directly into group chats with your crew to plan carpools and coordinate kids joining together!</span>
    </div>` : ''}
  </div>`;
}

// ============ VIEW: contacts (parents / crews) ============
function viewContacts() {
  return `<div class="screen">
    <div class="row-between" style="padding-top:14px;margin-bottom:14px">
      <h1 style="margin:0;font-size:24px;font-weight:800">${contactsSubTab === 'parents' ? 'Huddle Crew' : 'My Crews'}</h1>
      ${iconBtn('plus', { action: contactsSubTab === 'parents' ? 'add-contact' : 'add-crew', extraClass: 'accent' })}
    </div>
    <div class="chip-row">
      <button class="chip ${contactsSubTab === 'parents' ? 'active' : ''}" data-action="contacts-tab" data-arg="parents">Parents</button>
      <button class="chip ${contactsSubTab === 'crews' ? 'active' : ''}" data-action="contacts-tab" data-arg="crews">Crews</button>
    </div>
    ${contactsSubTab === 'parents' ? contactsList() : crewsList()}
  </div>`;
}

function contactsList() {
  return `<div class="search-bar">${ICONS.search}<input placeholder="Search parents or kids…" /></div>
    ${state.contacts.map(c => `<div class="card">
      <div class="row-between">
        <div class="row">${avatarImg(c.avatar, 48)}<div>
          <strong style="display:block;font-size:15px">${escapeHtml(c.name)}</strong>
          <span class="text-muted" style="font-size:13px">🙂 ${escapeHtml(c.kidsLabel)}</span><br>
          <span class="text-muted" style="font-size:12px">Last active: ${c.lastActive}</span>
        </div></div>
        <div class="row" style="gap:8px">
          ${iconBtn('message', { action: 'go', arg: `#/chat/${c.id}`, extraClass: 'accent' })}
          ${iconBtn('cal', { action: 'go', arg: '#/calendar' })}
        </div>
      </div>
    </div>`).join('')}`;
}

function crewsList() {
  const all = state.crews.find(c => c.id === 'all');
  const custom = state.crews.filter(c => c.id !== 'all');
  return `
    <div class="card" style="background:var(--teal-tint);border:1px solid var(--teal-tint-border);box-shadow:none;cursor:pointer" data-action="go" data-arg="#/crew/${all.id}">
      <div class="row-between">
        <div class="row">
          <div class="icon-btn accent">${ICONS.crew}</div>
          <div><strong style="display:block">${all.name}</strong><span class="text-muted" style="font-size:12.5px;color:var(--teal-dark)">${all.desc} • ${all.count} families</span></div>
        </div>
        ${stackedAvatars(all.members.slice(0, 3).map(id => contactById(id)?.avatar).filter(Boolean))}
      </div>
    </div>
    <p style="font-size:11.5px;font-weight:800;letter-spacing:.5px;color:var(--muted);margin:18px 0 10px">CUSTOM CREWS</p>
    ${custom.map(c => `<div class="card" style="cursor:pointer" data-action="go" data-arg="#/crew/${c.id}">
      <div class="row-between">
        <div class="row">
          <div class="icon-btn">${c.glyph}</div>
          <div><strong style="display:block">${escapeHtml(c.name)}</strong><span class="text-muted" style="font-size:12.5px">${c.desc}</span></div>
        </div>
        <div class="row" style="gap:6px">${stackedAvatars(c.members.slice(0, 3).map(id => contactById(id)?.avatar).filter(Boolean))}${ICONS.chevR.replace('viewBox', 'style="width:16px;height:16px;stroke:var(--muted)" viewBox')}</div>
      </div>
    </div>`).join('')}`;
}

// ============ VIEW: crew detail ============
function viewCrewDetail(id) {
  const c = crewById(id);
  if (!c) return notFound();
  const members = c.members.map(contactById).filter(Boolean);
  const shared = state.activities.slice(0, 1);
  return `<div class="screen">
    ${topbar('Crew View', { back: true, backTo: '#/contacts' })}
    <div class="card pad-lg">
      <div class="row"><div class="icon-btn" style="width:48px;height:48px">${c.glyph}</div>
        <div><h2 style="margin:0;font-size:19px">${escapeHtml(c.name)}</h2><span class="text-muted" style="font-size:13px">${c.count} Families Joined</span></div>
      </div>
      <p style="font-size:13.5px;color:var(--ink-soft);margin:14px 0">${escapeHtml(c.about || '')}</p>
      <button class="btn btn-secondary" data-action="edit-crew" data-arg="${c.id}">${ICONS.edit} Edit Crew</button>
    </div>
    <div class="row-between"><p style="font-size:11.5px;font-weight:800;letter-spacing:.5px;color:var(--muted);margin:18px 0 10px">CREW FAMILIES</p><a href="#" class="link-btn" data-action="add-crew-member" data-arg="${c.id}">+ Add Members</a></div>
    ${members.map(m => `<div class="card">
      <div class="row-between">
        <div class="row">${avatarImg(m.avatar, 44)}<div><strong style="display:block;font-size:14.5px">${escapeHtml(m.name)}</strong><span class="text-muted" style="font-size:12.5px">${escapeHtml(m.kidsLabel)}</span></div></div>
        ${iconBtn('message', { action: 'go', arg: `#/chat/${m.id}`, extraClass: 'accent' })}
      </div>
    </div>`).join('')}
    <p style="font-size:11.5px;font-weight:800;letter-spacing:.5px;color:var(--muted);margin:18px 0 10px">SHARED ACTIVITIES</p>
    ${shared.map(a => activityCard(a)).join('')}
  </div>`;
}

// ============ VIEW: share activity (modal) ============
let shareSelection = { contacts: new Set(['c1', 'c3']), crews: new Set(['cr2']) };
function viewShare(id) {
  const a = activityById(id);
  if (!a) return notFound();
  return `
  <div class="modal-head">
    <h1 style="text-align:left;flex:1">Share Activity</h1>
    ${iconBtn('close', { action: 'back', arg: `#/activity/${a.id}` })}
  </div>
  <div class="screen">
    <div class="card" style="display:flex;gap:12px;align-items:center">
      <img src="${a.img}" style="width:56px;height:56px;border-radius:10px;object-fit:cover" alt="" />
      <div><strong style="display:block;font-size:14.5px">${escapeHtml(a.title)}</strong><span class="text-muted" style="font-size:12.5px">${a.dates.split(' - ')[0]} • ${escapeHtml(a.by)}</span></div>
    </div>
    <p style="font-size:11.5px;font-weight:800;letter-spacing:.5px;color:var(--muted);margin:18px 0 10px">SHARE WITH INDIVIDUAL PARENTS</p>
    <div class="search-bar">${ICONS.search}<input placeholder="Search parent contacts…" /></div>
    ${state.contacts.map(c => `<div class="row-between" style="padding:10px 2px">
      <div class="row">${avatarImg(c.avatar, 38)}<div><strong style="display:block;font-size:14px">${escapeHtml(c.name)}</strong><span class="text-muted" style="font-size:12px">${escapeHtml(c.kidsLabel)}</span></div></div>
      <button class="chip check ${shareSelection.contacts.has(c.id) ? 'active' : ''}" style="width:26px;height:26px;padding:0;display:flex;align-items:center;justify-content:center" data-action="share-toggle-contact" data-arg="${c.id}">${shareSelection.contacts.has(c.id) ? ICONS.check : ''}</button>
    </div>`).join('')}
    <p style="font-size:11.5px;font-weight:800;letter-spacing:.5px;color:var(--muted);margin:18px 0 10px">SHARE WITH A CREW</p>
    <div class="chip-row">
      ${state.crews.filter(c => c.id !== 'all').map(c => `<button class="chip check ${shareSelection.crews.has(c.id) ? 'active ghost' : ''}" data-action="share-toggle-crew" data-arg="${c.id}">${c.glyph} ${c.name}</button>`).join('')}
    </div>
    <div class="field"><textarea id="shareNote" placeholder="Add a note…"></textarea></div>
  </div>
  <div class="sticky-bottom"><button class="btn btn-primary" data-action="do-share" data-arg="${a.id}">Share</button></div>`;
}

// ============ VIEW: child profile ============
function viewChildProfile(id) {
  const k = kidById(id);
  if (!k) return notFound();
  const linked = [state.user, ...state.familyAccess];
  return `<div class="screen">
    ${topbar('Child Profile', { back: true, backTo: '#/profile', rightHtml: iconBtn('edit', { action: 'go', arg: `#/child/${k.id}/edit` }) })}
    <div style="text-align:center;margin:10px 0 20px">
      ${avatarInitial(k.initial, k.color + '22', 84, k.color)}
      <h2 style="margin:12px 0 2px">${escapeHtml(k.name)}</h2>
      <p class="text-muted" style="margin:0 0 8px">${k.age} Years Old • ${escapeHtml(k.grade)}</p>
      <span class="badge purple">${escapeHtml(k.school)}</span>
    </div>
    <div class="row-between"><h2 class="section-title" style="margin-top:0">Weekly Schedule</h2><a href="#/child/${k.id}/edit" class="link-btn">Manage</a></div>
    ${k.schedule.map(s => `<div class="card">
      <div class="row-between">
        <div class="row"><div style="background:#F1EDE3;border-radius:10px;padding:8px 10px;font-weight:800;font-size:12.5px">${s.day}</div>
          <div><strong style="display:block;font-size:14.5px">${escapeHtml(s.title)}</strong><span class="text-muted" style="font-size:12.5px">${s.time}</span></div>
        </div>
        <span class="badge ${TAG_BADGE_CLASS[s.tag] || 'blue'}">${s.tag}</span>
      </div>
    </div>`).join('')}
    <h2 class="section-title">Allergies &amp; Care Notes</h2>
    ${k.allergies.length ? `<div class="card" style="background:var(--red-tint);box-shadow:none;border:none">
      <strong style="color:var(--red);display:block;margin-bottom:4px">⚠️ ${k.allergies.join(', ')} Allergy</strong>
      <span style="font-size:13px;color:var(--ink-soft)">Strictly ${k.allergies.join('/').toLowerCase()}-free. Carries an Epipen in secondary pocket of school backpack.</span>
    </div>` : `<div class="card" style="background:var(--teal-tint);box-shadow:none;border:none"><span style="font-size:13px;color:var(--teal-dark)">No known allergies on file.</span></div>`}
    <h2 class="section-title">Linked Crew</h2>
    <div class="row" style="gap:20px">
      ${linked.map(p => `<div style="text-align:center">${avatarImg(p.avatar, 52)}<strong style="display:block;font-size:12.5px;margin-top:6px">${p.name.split(' ')[0]} ${p.name.split(' ')[1]?.[0] || ''}.</strong><span class="text-muted" style="font-size:11px">${p.role.includes('organizer') ? 'Mother' : 'Father'}</span></div>`).join('')}
    </div>
  </div>`;
}

// ============ VIEW: edit child profile ============
const ALLERGY_OPTIONS = ['Bee stings', 'Peanuts', 'Gluten', 'Dairy', 'Eggs', 'Tree nuts'];
const INTEREST_OPTIONS = ['Karate', 'Soccer', 'Pokémon', 'Biking', 'Play dates', 'Drawing'];

function viewEditChild(id) {
  const k = kidById(id);
  if (!k) return notFound();
  const allergySet = new Set(k.allergies);
  const interestSet = new Set(k.interests);
  const extraAllergies = k.allergies.filter(a => !ALLERGY_OPTIONS.includes(a));
  const extraInterests = k.interests.filter(i => !INTEREST_OPTIONS.includes(i));
  return `
  <div class="modal-head">
    ${iconBtn('back', { action: 'back', arg: `#/child/${k.id}` })}
    <h1>${k.nickname}'s profile</h1>
    <button class="btn btn-primary small" data-action="save-child" data-arg="${k.id}">Save</button>
  </div>
  <form class="screen" id="editChildForm">
    <p class="text-muted" style="margin:0 0 16px;font-size:13.5px">The details your family and trusted caregivers need, all in one place.</p>
    <div class="card pad-lg">
      <div class="row" style="margin-bottom:16px"><div class="icon-btn accent">🙂</div><h3 style="margin:0;font-size:16px">The basics</h3></div>
      <div class="row" style="margin-bottom:16px">${avatarInitial(k.initial, k.color, 56)}<button type="button" class="link-btn" data-action="change-photo">${ICONS.camera} Change profile picture</button></div>
      <div class="field"><label>Full name</label><input type="text" name="name" value="${escapeHtml(k.name)}" /></div>
      <div class="field"><label>Nickname</label><input type="text" name="nickname" value="${escapeHtml(k.nickname)}" /></div>
      <div class="field-row">
        <div class="field"><label>Date of birth</label><input type="date" name="dob" value="${k.dob}" /></div>
        <div class="field"><label>Current grade</label>
          <select name="grade">
            ${['Preschool', 'Pre-K', 'Kindergartener', '1st grade', '2nd grade', '3rd grade', '4th grade', '5th grade'].map(g => `<option ${k.grade === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="field mb-0"><label>School</label><input type="text" name="school" value="${escapeHtml(k.school)}" /></div>
    </div>

    <div class="card pad-lg">
      <div class="row" style="margin-bottom:6px"><div class="icon-btn accent">🛡️</div><h3 style="margin:0;font-size:16px">Allergies &amp; food needs</h3></div>
      <p class="text-muted" style="font-size:12.5px;margin:0 0 12px">Select all that apply. These are shared with caregivers.</p>
      <div class="chip-row" id="allergyChips">
        ${[...ALLERGY_OPTIONS, ...extraAllergies].map(a => `<button type="button" class="chip check ${allergySet.has(a) ? 'active ghost' : ''}" data-action="toggle-allergy" data-arg="${a}">${allergySet.has(a) ? '✓ ' : ''}${a}</button>`).join('')}
      </div>
      <button type="button" class="link-btn" data-action="add-allergy">${ICONS.plus} Add another allergy</button>
    </div>

    <div class="card pad-lg">
      <div class="row" style="margin-bottom:6px"><div class="icon-btn accent">✨</div><h3 style="margin:0;font-size:16px">Interests</h3></div>
      <p class="text-muted" style="font-size:12.5px;margin:0 0 12px">A few favorites help grown-ups plan better days together.</p>
      <div class="chip-row" id="interestChips">
        ${[...INTEREST_OPTIONS, ...extraInterests].map(i => `<button type="button" class="chip check ${interestSet.has(i) ? 'active ghost' : ''}" data-action="toggle-interest" data-arg="${i}">${interestSet.has(i) ? '✓ ' : ''}${i}</button>`).join('')}
      </div>
      <button type="button" class="link-btn" data-action="add-interest">${ICONS.plus} Add an interest</button>
    </div>
  </form>`;
}

// working copies used only while the edit-child form is open
let editAllergies = null, editInterests = null;

// ============ VIEW: family profile ============
function viewProfile() {
  const u = state.user;
  return `
  <div class="modal-head">
    ${iconBtn('back', { action: 'back', arg: '#/home' })}
    <h1>Family profile</h1>
    <button class="btn btn-primary small" data-action="save-profile">Save</button>
  </div>
  <form class="screen" id="profileForm">
    <p class="text-muted" style="margin:0 0 16px;font-size:13.5px">Manage your details, children, and the people you trust with their care.</p>

    <div class="card pad-lg">
      <div class="row" style="margin-bottom:16px"><div class="icon-btn accent">👤</div><h3 style="margin:0;font-size:16px">Your profile</h3></div>
      <div class="row" style="margin-bottom:16px">${avatarImg(u.avatar, 56)}<div><strong style="display:block">${escapeHtml(u.name)}</strong><span class="text-muted" style="font-size:12.5px">${escapeHtml(u.role)}</span></div></div>
      <div class="field"><label>Full name</label><input type="text" name="name" value="${escapeHtml(u.name)}" /></div>
      <div class="field"><label>Email</label><input type="email" name="email" value="${escapeHtml(u.email)}" /></div>
      <div class="field mb-0"><label>Mobile number</label><input type="tel" name="phone" value="${escapeHtml(u.phone)}" /></div>
    </div>

    <div class="card pad-lg">
      <div class="row" style="margin-bottom:16px"><div class="icon-btn accent">👨‍👩‍👧</div><h3 style="margin:0;font-size:16px">Your kids</h3></div>
      <p class="text-muted" style="font-size:12.5px;margin:-8px 0 12px">Profiles everyone in your family can securely access.</p>
      ${state.kids.map(k => `<div class="row-between" style="padding:8px 0">
        <div class="row">${avatarInitial(k.initial, k.color, 40)}<div><strong style="display:block;font-size:14.5px">${escapeHtml(k.name)}</strong><span class="text-muted" style="font-size:12.5px">Age ${k.age} • ${escapeHtml(k.grade)}</span></div></div>
        <button type="button" class="btn btn-secondary small" data-action="go" data-arg="#/child/${k.id}">Manage</button>
      </div>`).join('')}
      <button type="button" class="btn btn-outline" style="margin-top:10px;background:var(--teal-tint);border:none" data-action="add-child">${ICONS.plus} Add another child</button>
    </div>

    <div class="card pad-lg">
      <div class="row" style="margin-bottom:16px"><div class="icon-btn accent">🔒</div><h3 style="margin:0;font-size:16px">Family access</h3></div>
      <p class="text-muted" style="font-size:12.5px;margin:-8px 0 12px">Invite a spouse, nanny, or guardian. You control what they can see.</p>
      ${state.familyAccess.map(p => `<div class="row-between" style="padding:6px 0">
        <div class="row">${avatarImg(p.avatar, 40)}<div><strong style="display:block;font-size:14.5px">${escapeHtml(p.name)}</strong><span class="text-muted" style="font-size:12.5px">${escapeHtml(p.role)}</span></div></div>
        <button type="button" class="btn btn-secondary small" data-action="edit-access" data-arg="${p.id}">Edit</button>
      </div>`).join('')}
      <button type="button" class="btn btn-outline" style="margin-top:10px" data-action="invite-family">+ Invite someone →</button>
    </div>
  </form>
  <div class="screen" style="padding-top:0">
    <button class="btn btn-danger-tint" data-action="logout">Log out</button>
  </div>`;
}

function notFound() {
  return `<div class="screen empty-state">Not found. <a href="#/home" style="color:var(--teal)">Go home</a></div>`;
}

// ============ ROUTER ============
const NAV_ROUTES = ['#/home', '#/explore', '#/calendar', '#/contacts', '#/profile'];

function render() {
  let hash = location.hash || '#/welcome';
  const [path, param, sub] = hash.split('/').filter((_, i) => i > 0); // e.g. #/activity/a1 -> ['activity','a1']
  const seg0 = hash.split('/')[1] || 'welcome';

  // auth guard
  if (!state.signedIn && !['welcome', 'signin'].includes(seg0)) {
    location.hash = '#/welcome';
    return;
  }
  if (state.signedIn && ['welcome', 'signin', ''].includes(seg0)) {
    location.hash = '#/home';
    return;
  }

  let html = '';
  let showNav = false;
  let activeTab = null;

  switch (seg0) {
    case 'welcome': html = viewWelcome(); break;
    case 'signin': html = viewSignIn(); break;
    case 'home': html = viewHome(); showNav = true; activeTab = '#/home'; break;
    case 'calendar': html = viewCalendar(); showNav = true; activeTab = '#/calendar'; break;
    case 'event': html = viewNewEvent(); break;
    case 'explore':
      if (hash === '#/explore/filters') html = viewFilters();
      else { html = viewExplore(); showNav = true; activeTab = '#/explore'; }
      break;
    case 'activity': html = viewActivityDetail(param); showNav = true; activeTab = '#/explore'; break;
    case 'saved': html = viewSaved(); showNav = true; activeTab = '#/explore'; break;
    case 'contacts': html = viewContacts(); showNav = true; activeTab = '#/contacts'; break;
    case 'chat': html = viewChat(param); break;
    case 'crew': html = viewCrewDetail(param); showNav = true; activeTab = '#/contacts'; break;
    case 'share': html = viewShare(param); break;
    case 'profile': html = viewProfile(); showNav = true; activeTab = '#/profile'; break;
    case 'child':
      if (sub === 'edit') html = viewEditChild(param);
      else { html = viewChildProfile(param); showNav = true; activeTab = '#/profile'; }
      break;
    default: html = notFound();
  }

  $app.innerHTML = html;
  $app.classList.toggle('no-nav', !showNav);
  $tabbar.classList.toggle('hidden', !showNav);
  if (showNav) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.route === activeTab));
  }
  window.scrollTo(0, 0);

  if (seg0 === 'chat') scrollChatToBottom();
}

// ============ VIEW: chat (needs render-time helper defined after render for scroll) ============
function viewChat(contactId) {
  const c = contactById(contactId);
  if (!c) return notFound();
  const msgs = state.messages[contactId] || [];
  return `
  <div class="chat-header">
    ${iconBtn('back', { action: 'back', arg: '#/contacts' })}
    ${avatarImg(c.avatar, 38)}
    <h1 class="flex-1">${escapeHtml(c.name)}<span class="sub">Mom of ${escapeHtml(c.kidsLabel)}</span></h1>
    ${iconBtn('phone', { action: 'call', arg: c.name, extraClass: 'accent' })}
  </div>
  <div class="chat-body" id="chatBody">
    ${msgs.map(m => {
      if (m.from === 'card') {
        return `<div class="playdate-card">
          <div class="top"><span class="badge orange">PLAYDATE IDEA</span>${m.status === 'confirmed' ? `<span style="color:var(--teal)">${ICONS.check}</span>` : ''}</div>
          <h4>${escapeHtml(m.title)}</h4>
          <div class="meta">${ICONS.clock}${m.time}</div>
          <div class="meta">${ICONS.pin}${m.location}</div>
          <div class="meta">${m.attendees}</div>
          ${m.status === 'confirmed'
            ? `<div class="actions"><button class="btn btn-secondary" disabled>✓ Confirmed &amp; added to calendar</button></div>`
            : `<div class="actions"><button class="btn btn-secondary" data-action="modify-playdate">Modify</button><button class="btn btn-primary" data-action="confirm-playdate" data-arg="${contactId}">Confirm</button></div>`}
        </div>`;
      }
      return `<div class="msg-row ${m.from === 'me' ? 'me' : 'them'}">
        ${m.from === 'them' ? avatarImg(c.avatar, 28) : ''}
        <div class="msg-bubble">${escapeHtml(m.text)}</div>
      </div>`;
    }).join('')}
  </div>
  <div class="chat-input-bar">
    ${iconBtn('plus')}
    <input type="text" id="chatInput" placeholder="Message ${c.name.split(' ')[0]}…" />
    <button class="round-btn" data-action="send-chat" data-arg="${contactId}">${ICONS.send}</button>
  </div>`;
}
function scrollChatToBottom() {
  const el = document.getElementById('chatBody');
  if (el) el.scrollTop = el.scrollHeight;
}

// ============ EVENT DELEGATION ============
document.addEventListener('click', e => {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  const arg = target.dataset.arg;
  handleAction(action, arg, target, e);
});

document.addEventListener('input', e => {
  if (e.target.id === 'exploreSearch') { exploreSearch = e.target.value; renderPartialExplore(); }
  if (e.target.id === 'distanceRange') { filterState.distance = e.target.value; render(); }
});

function renderPartialExplore() {
  // cheap re-render that preserves focus/caret reasonably well for a demo app
  const caret = document.getElementById('exploreSearch')?.selectionStart;
  render();
  const input = document.getElementById('exploreSearch');
  if (input) { input.focus(); input.setSelectionRange(caret, caret); }
}

function handleAction(action, arg, el, e) {
  switch (action) {
    case 'go': navigate(arg); break;
    case 'back': arg ? navigate(arg) : history.back(); break;
    case 'noop': e.preventDefault(); break;

    case 'signin': {
      state.signedIn = true; saveState();
      toast(arg === 'email' ? 'Account created (demo)' : `Signed in with ${arg} (demo)`);
      navigate('#/home');
      break;
    }
    case 'logout': {
      if (confirm('Log out of Huddle Crew?')) { state.signedIn = false; saveState(); navigate('#/welcome'); }
      break;
    }

    case 'pick-day': selectedDate = arg; render(); break;
    case 'cal-prev': calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1); render(); break;
    case 'cal-next': calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1); render(); break;

    case 'draft': toast('Draft saved'); break;
    case 'pick-kid':
      document.querySelectorAll('[data-action="pick-kid"]').forEach(b => b.classList.remove('active', 'ghost'));
      el.classList.add('active', 'ghost');
      document.querySelector('#newEventForm input[name=kidId]').value = arg;
      break;
    case 'toggle-invite': el.classList.toggle('active'); el.classList.toggle('ghost'); break;
    case 'invite-other': { const name = prompt('Invite by name or email:'); if (name) toast(`Invite sent to ${name} (demo)`); break; }
    case 'submit-event': submitNewEvent(); break;

    case 'quick-filter': exploreQuick = arg; render(); break;
    case 'toggle-fav': toggleFav(arg); break;
    case 'quick-signup': toast('Added to your sign-up checklist'); break;
    case 'register': toast(`Registered for ${activityById(arg)?.title}! 🎉`); break;

    case 'filter-age': {
      const [lo, hi] = arg.split(',').map(Number);
      filterState.ageRange = (filterState.ageRange && filterState.ageRange[0] === lo) ? null : [lo, hi];
      render();
      break;
    }
    case 'filter-type': {
      if (filterState.types.has(arg)) filterState.types.delete(arg); else filterState.types.add(arg);
      render();
      break;
    }
    case 'filter-price': filterState.price = filterState.price === arg ? null : arg; render(); break;
    case 'clear-filters': filterState = { ageRange: null, types: new Set(), distance: 10, price: null, dates: 'July 2026 (Any week)' }; render(); break;
    case 'apply-filters': {
      const sel = document.getElementById('preferredDates');
      if (sel) filterState.dates = sel.value;
      navigate('#/explore');
      break;
    }

    case 'contacts-tab': contactsSubTab = arg; render(); break;
    case 'add-contact': { const name = prompt('New contact name:'); if (name) { state.contacts.push({ id: uid('c'), name, kidsLabel: '—', lastActive: 'Just now', avatar: AV(Math.ceil(Math.random() * 60)) }); saveState(); toast('Contact added'); render(); } break; }
    case 'add-crew': { const name = prompt('New crew name:'); if (name) { state.crews.push({ id: uid('cr'), name, desc: '1 family', count: 1, glyph: '⭐', color: 'teal', members: [], about: '' }); saveState(); toast('Crew created'); render(); } break; }
    case 'edit-crew': toast('Crew details updated (demo)'); break;
    case 'add-crew-member': { const c = crewById(arg); const name = prompt('Add member by name/email:'); if (name && c) toast(`Invited ${name} to ${c.name} (demo)`); break; }

    case 'share-toggle-contact': shareSelection.contacts.has(arg) ? shareSelection.contacts.delete(arg) : shareSelection.contacts.add(arg); render(); break;
    case 'share-toggle-crew': shareSelection.crews.has(arg) ? shareSelection.crews.delete(arg) : shareSelection.crews.add(arg); render(); break;
    case 'do-share': {
      const n = shareSelection.contacts.size + shareSelection.crews.size;
      toast(n ? `Shared with ${n} recipient${n > 1 ? 's' : ''}!` : 'Pick at least one recipient');
      if (n) navigate(`#/activity/${arg}`);
      break;
    }

    case 'send-chat': sendChatMessage(arg); break;
    case 'call': toast(`Calling ${arg}… (demo)`); break;
    case 'modify-playdate': toast('Opening playdate editor (demo)'); break;
    case 'confirm-playdate': confirmPlaydate(arg); break;

    case 'change-photo': toast('Photo updated (demo)'); break;
    case 'toggle-allergy': toggleChip('allergy', arg, el); break;
    case 'add-allergy': { const v = prompt('Add an allergy:'); if (v) toggleChip('allergy', v, null, true); break; }
    case 'toggle-interest': toggleChip('interest', arg, el); break;
    case 'add-interest': { const v = prompt('Add an interest:'); if (v) toggleChip('interest', v, null, true); break; }
    case 'save-child': saveChild(arg); break;

    case 'save-profile': saveProfile(); break;
    case 'add-child': {
      const name = prompt("Child's name:"); if (!name) break;
      const age = prompt('Age:', '4') || '4';
      const colors = ['#0E9C7C', '#8B7CF6', '#4C7BD9', '#E8934A'];
      state.kids.push({ id: uid('k'), name, nickname: name.split(' ')[0], age: Number(age), grade: 'Preschool', school: '', dob: '', initial: name[0].toUpperCase(), color: colors[state.kids.length % colors.length], allergies: [], interests: [], schedule: [] });
      saveState(); toast('Child added'); render();
      break;
    }
    case 'edit-access': toast('Access settings updated (demo)'); break;
    case 'invite-family': { const email = prompt('Invite by email:'); if (email) toast(`Invite sent to ${email} (demo)`); break; }
  }
}

function navigate(hash) { location.hash = hash; }

function toggleFav(id) {
  const i = state.favorites.indexOf(id);
  if (i === -1) { state.favorites.push(id); toast('Saved to favorites'); }
  else { state.favorites.splice(i, 1); toast('Removed from favorites'); }
  saveState();
  render();
}

function submitNewEvent() {
  const f = document.getElementById('newEventForm');
  const fd = new FormData(f);
  const location_ = (fd.get('location') || '').trim();
  if (!location_) { toast('Add a location to continue'); return; }
  const kid = kidById(fd.get('kidId'));
  const ev = {
    id: uid('e'),
    date: fd.get('date') || selectedDate,
    title: `${kid ? kid.nickname + "'s " : ''}Coordination Request`,
    time: to12h(fd.get('startTime')) || '3:00 PM',
    tag: 'PLAYDATE',
    location: location_,
    withName: '',
    kidId: kid ? kid.id : state.kids[0]?.id,
  };
  state.events.push(ev);
  saveState();
  toast('Coordination request sent!');
  selectedDate = ev.date;
  navigate('#/calendar');
}
function to12h(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, '0')} ${period}`;
}

function sendChatMessage(contactId) {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  state.messages[contactId] = state.messages[contactId] || [];
  state.messages[contactId].push({ from: 'me', text });
  saveState();
  input.value = '';
  render();
}

function confirmPlaydate(contactId) {
  const msgs = state.messages[contactId] || [];
  const card = [...msgs].reverse().find(m => m.from === 'card');
  if (card) {
    card.status = 'confirmed';
    state.events.push({
      id: uid('e'), date: selectedDate, title: card.title, time: card.time.split('@')[1]?.trim() || '3:00 PM',
      tag: 'PLAYDATE', location: card.location, withName: contactById(contactId)?.name || '', kidId: state.kids[0]?.id,
    });
    saveState();
    toast('Confirmed and added to calendar!');
    render();
  }
}

function toggleChip(kind, value, el, isNew) {
  const id = location.hash.split('/')[2];
  const kid = kidById(id);
  if (!kid) return;
  const arr = kind === 'allergy' ? kid.allergies : kid.interests;
  const idx = arr.indexOf(value);
  if (idx === -1) arr.push(value); else arr.splice(idx, 1);
  render();
}

function saveChild(id) {
  const kid = kidById(id);
  const f = document.getElementById('editChildForm');
  const fd = new FormData(f);
  kid.name = fd.get('name') || kid.name;
  kid.nickname = fd.get('nickname') || kid.nickname;
  kid.dob = fd.get('dob') || kid.dob;
  kid.grade = fd.get('grade') || kid.grade;
  kid.school = fd.get('school') || kid.school;
  kid.initial = kid.name[0]?.toUpperCase() || kid.initial;
  saveState();
  toast('Profile saved');
  navigate(`#/child/${id}`);
}

function saveProfile() {
  const f = document.getElementById('profileForm');
  const fd = new FormData(f);
  state.user.name = fd.get('name') || state.user.name;
  state.user.email = fd.get('email') || state.user.email;
  state.user.phone = fd.get('phone') || state.user.phone;
  saveState();
  toast('Profile saved');
  render();
}

// ============ boot ============
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);
if (document.readyState !== 'loading') render();
