const phone = document.getElementById('phone');
let stack = ['s1'];

function push(id) {
  if (id === 's4-signup') {
    showSignupCelebrate();
    return;
  }
  const cur = stack[stack.length - 1];
  document.getElementById(cur).classList.remove('active');
  document.getElementById(cur).classList.add('prevshift');
  stack.push(id);
  const next = document.getElementById(id);
  next.classList.add('active');
  next.classList.remove('prevshift');
  if (id === 's2') {
    setTimeout(runGaugeIntro, 250);
  }
}
function back() {
  if (stack.length < 2) return;
  const cur = stack.pop();
  document.getElementById(cur).classList.remove('active');
  const prev = stack[stack.length - 1];
  document.getElementById(prev).classList.remove('prevshift');
  document.getElementById(prev).classList.add('active');
}

// ---------- Screen 1: onboarding ----------
function toggleSplitTrack(el) {
  const track = el.closest('.sync-card').querySelector('.split-track');
  document.querySelectorAll('.split-track.show').forEach((t) => {
    if (t !== track) t.classList.remove('show');
  });
  track.classList.toggle('show');
}
function onbSplitUpdate(input) {
  const card = input.closest('.sync-card');
  const total = parseInt(card.dataset.price, 10);
  const n = input.value;
  const val = Math.round(total / n);
  card.querySelector('.split-track .out').textContent = `${n}명 분담 · ${val.toLocaleString('ko-KR')}원`;
}
function onbDirectInput(input) {
  const card = input.closest('.sync-card');
  const val = parseInt(input.value || '0', 10);
  card.querySelector('.split-track .out').textContent = val > 0 ? `직접 입력 · ${val.toLocaleString('ko-KR')}원` : '금액을 입력해주세요';
}

// category filter bento tiles
document.querySelectorAll('.bento-tile[data-filter]').forEach((tile) => {
  tile.addEventListener('click', () => {
    document.querySelectorAll('.bento-tile[data-filter]').forEach((t) => t.classList.remove('on'));
    tile.classList.add('on');
    const f = tile.dataset.filter;
    document.querySelectorAll('#syncList .sync-card').forEach((card) => {
      const show = f === 'all' || card.dataset.category === f;
      card.style.display = show ? '' : 'none';
    });
  });
});

// swipe-to-dismiss for the gym card
(function initSwipe() {
  const card = document.getElementById('gymCard');
  if (!card) return;
  let startX = 0,
    curX = 0,
    dragging = false;
  function pointerDown(e) {
    dragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    card.classList.add('dragging');
  }
  function pointerMove(e) {
    if (!dragging) return;
    curX = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
    if (curX < 0) {
      card.style.transform = `translateX(${curX}px)`;
      card.style.opacity = String(1 + curX / 220);
    }
  }
  function pointerUp() {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('dragging');
    if (curX < -90) {
      card.classList.add('removed');
      card.style.transform = '';
    } else {
      card.style.transform = 'translateX(0)';
      card.style.opacity = '1';
    }
    curX = 0;
  }
  card.addEventListener('mousedown', pointerDown);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);
  card.addEventListener('touchstart', pointerDown, { passive: true });
  card.addEventListener('touchmove', pointerMove, { passive: true });
  card.addEventListener('touchend', pointerUp);
})();

// simulate progress ticking while on screen1 (kept for the my-data sync feel)
// (progress bar removed from layout per redesign; kept function no-op safe)

// ---------- Screen 2: gauge ----------
const CIRC = 2 * Math.PI * 82;
let gaugeRan = false;
function runGaugeIntro() {
  if (gaugeRan) return;
  gaugeRan = true;
  animateGauge(0, 72, 1400);
}
function animateGauge(from, to, duration) {
  const start = performance.now();
  const valueEl = document.getElementById('gaugeValue');
  const scoreEl = document.getElementById('gaugeScore');
  const labelEl = document.getElementById('gaugeLabel');
  const wasteEl = document.getElementById('wasteLine');
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const cur = Math.round(from + (to - from) * eased);
    const offset = CIRC * (1 - cur / 100);
    valueEl.style.strokeDashoffset = offset;
    scoreEl.textContent = cur + '점';
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      const good = to >= 80;
      valueEl.style.stroke = good ? 'var(--mint)' : 'var(--warn)';
      scoreEl.style.color = good ? 'var(--mint-text)' : 'var(--text-1)';
      labelEl.style.color = good ? 'var(--mint-text)' : 'var(--warn-text)';
      labelEl.textContent = good ? '양호' : '주의';
      wasteEl.innerHTML = good ? '월 <b style="color:var(--mint-text)">4,250원</b>만 지출 중이에요' : '월 <b>29,000원</b> 낭비 중!';
    }
  }
  requestAnimationFrame(frame);
}
function pullRefresh() {
  const btn = event.currentTarget;
  btn.style.transform = 'rotate(360deg)';
  btn.style.transition = 'transform .5s ease';
  setTimeout(() => {
    btn.style.transform = 'rotate(0deg)';
  }, 550);
}

// ---------- Screen 3: bottom sheet ----------
function openSheet() {
  document.getElementById('sheetOverlay').classList.add('show');
}
function closeSheet() {
  document.getElementById('sheetOverlay').classList.remove('show');
}
function toggleSplitBody(el) {
  el.classList.toggle('on');
  document.getElementById('splitBody').classList.toggle('show');
}
function sheetSplitUpdate(n) {
  const val = Math.round(17000 / n);
  document.getElementById('sheetResult').textContent = val.toLocaleString('ko-KR') + '원';
  const directInput = document.getElementById('sheetDirectInput');
  if (directInput) directInput.value = '';
}
function sheetDirectInputFn(input) {
  const val = parseInt(input.value || '0', 10);
  document.getElementById('sheetResult').textContent = val > 0 ? val.toLocaleString('ko-KR') + '원 (직접 입력)' : '0원';
}
function updateRealPrice(input) {
  const val = parseInt(input.value || '0', 10);
  document.querySelector('.sheet-brand .pay').textContent = `매월 14일 결제 · ${val.toLocaleString('ko-KR')}원`;
}
function saveOverride() {
  closeSheet();
  const priceEl = document.getElementById('netflixPrice');
  const toggled = document.getElementById('splitToggle').classList.contains('on');
  let finalVal = null;
  if (toggled) {
    const directInput = document.getElementById('sheetDirectInput');
    if (directInput && parseInt(directInput.value, 10) > 0) {
      finalVal = parseInt(directInput.value, 10);
    } else {
      const n = document.getElementById('sheetSlider').value;
      finalVal = Math.round(17000 / n);
    }
  } else {
    const realInput = document.getElementById('realPriceInput');
    const realVal = parseInt(realInput.value, 10);
    if (realVal && realVal !== 17000) finalVal = realVal;
  }
  if (finalVal !== null) {
    priceEl.textContent = '월 ' + finalVal.toLocaleString('ko-KR') + '원';
    priceEl.style.color = 'var(--mint-text)';
    priceEl.style.fontWeight = '700';
    animateGauge(72, 85, 900);
  }
}
function goCancelFromSheet() {
  closeSheet();
  push('s4');
}

// ---------- Screen 4: cancelation ----------
function fakeOutlink() {
  const btn = event.currentTarget;
  const orig = btn.textContent;
  btn.textContent = '넷플릭스로 이동 중...';
  setTimeout(() => {
    btn.textContent = orig;
  }, 1200);
  document.querySelectorAll('.tl-step')[1].classList.add('done');
}
function copyClip(el) {
  const orig = el.textContent;
  el.textContent = '복사됨 ✓';
  setTimeout(() => {
    el.textContent = orig;
  }, 1200);
}
function completeCancel() {
  document.querySelectorAll('.tl-step')[2].classList.add('done');
  fireConfetti();
  setTimeout(() => {
    document.getElementById('celebrateOverlay').classList.add('show');
  }, 350);
}
function closeCelebrate() {
  document.getElementById('celebrateOverlay').classList.remove('show');
  const card = document.querySelector('.sub-card.flagged');
  if (card) {
    card.style.transition = 'all .4s ease';
    card.style.opacity = '0';
    card.style.maxHeight = '0';
    card.style.overflow = 'hidden';
    card.style.margin = '0';
    card.style.padding = '0';
    card.style.border = '0';
    card.style.boxShadow = 'none';
  }
  animateGauge(72, 92, 900);
  back();
}
function fireConfetti() {
  const layer = document.getElementById('confettiLayer');
  const colors = ['#12B886', '#3D7FFF', '#FF9F43', '#FF5C5C', '#FFD166'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDelay = Math.random() * 0.3 + 's';
    p.style.animationDuration = 1.2 + Math.random() * 0.8 + 's';
    layer.appendChild(p);
    setTimeout(() => p.remove(), 2200);
  }
}

// ---------- Screen 5: matching + scroll savings ----------
(function buildDots() {
  const grid = document.getElementById('dotgrid');
  for (let i = 0; i < 100; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i < 92 ? ' filled' : '');
    grid.appendChild(d);
  }
})();
function onS5Scroll() {
  const el = document.getElementById('s5scroll');
  const pct = Math.min(el.scrollTop / (el.scrollHeight - el.clientHeight), 1);
  const amount = Math.round((pct * 40000) / 1000) * 1000;
  const badge = document.getElementById('floatSave');
  badge.textContent = `+ ${amount.toLocaleString('ko-KR')}원 저축 중`;
  badge.classList.toggle('show', pct > 0.02);
}
function showSignupCelebrate() {
  fireConfettiOnScreen();
  alertLike();
}
function fireConfettiOnScreen() {
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  layer.style.zIndex = 70;
  phone.appendChild(layer);
  const colors = ['#12B886', '#3D7FFF', '#FF9F43', '#FFD166'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDelay = Math.random() * 0.3 + 's';
    layer.appendChild(p);
  }
  setTimeout(() => layer.remove(), 2200);
}
function alertLike() {
  const overlay = document.createElement('div');
  overlay.className = 'celebrate-overlay show';
  overlay.style.zIndex = 71;
  overlay.innerHTML = '<div class="celebrate"><div class="emoji">💳</div><h4>신청 완료!</h4><div class="stat">월 40,000원 절약 시작</div><p class="sub">카드가 도착하면 자동으로 혜택이 매칭돼요.</p><div class="close-btn" onclick="this.closest(\'.celebrate-overlay\').remove()">확인</div></div>';
  phone.appendChild(overlay);
}
