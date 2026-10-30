// ---- Image data -------------------------------------------------------
// Images are generated as SVG so the gallery works offline.
// To use real photos, replace `src` with a file path, e.g. "images/photo1.jpg".
const rnd = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function art(type, seed) {
  const r = rnd(seed * 7919 + 13);
  const h = Math.floor(r() * 360);
  let s = '';
  if (type === 'nature') {
    s += `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h},60%,68%)"/><stop offset="1" stop-color="hsl(${h + 30},70%,90%)"/></linearGradient></defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <circle cx="${120 + r() * 560}" cy="${110 + r() * 60}" r="55" fill="hsl(42,100%,78%)"/>`;
    for (let l = 0; l < 3; l++) {
      let d = `M0 600 L0 ${330 + l * 70}`;
      for (let x = 100; x <= 800; x += 100) d += ` L${x} ${260 + l * 70 + r() * 110}`;
      s += `<path d="${d} L800 600Z" fill="hsl(${h + 120},${30 + l * 8}%,${58 - l * 15}%)"/>`;
    }
  } else if (type === 'city') {
    s += `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h},50%,14%)"/><stop offset="1" stop-color="hsl(${h + 40},65%,38%)"/></linearGradient></defs>
      <rect width="800" height="600" fill="url(#g)"/><circle cx="${100 + r() * 600}" cy="100" r="32" fill="#f4f1d8"/>`;
    for (let x = 0; x < 800;) {
      const w = 50 + r() * 50, ht = 160 + r() * 260;
      s += `<rect x="${x}" y="${600 - ht}" width="${w}" height="${ht}" fill="hsl(${h},30%,${8 + r() * 8}%)"/>`;
      for (let wy = 600 - ht + 14; wy < 580; wy += 24)
        for (let wx = x + 10; wx < x + w - 12; wx += 18)
          if (r() > .55) s += `<rect x="${wx}" y="${wy}" width="8" height="12" fill="hsl(48,100%,70%)"/>`;
      x += w + 4;
    }
  } else {
    s += `<rect width="800" height="600" fill="hsl(${h},55%,22%)"/>`;
    for (let i = 0; i < 9; i++)
      s += `<circle cx="${r() * 800}" cy="${r() * 600}" r="${40 + r() * 140}" fill="hsl(${(h + i * 38) % 360},80%,60%)" opacity=".55"/>`;
    for (let i = 0; i < 3; i++)
      s += `<rect x="${r() * 600}" y="${r() * 400}" width="${80 + r() * 120}" height="${80 + r() * 120}" fill="none" stroke="#fff" stroke-width="4" opacity=".7" transform="rotate(${r() * 60} 400 300)"/>`;
  }
  return 'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">${s}</svg>`);
}

const names = {
  nature: ['Alpine Dawn', 'Quiet Ridge', 'Blue Valley', 'Morning Haze'],
  city: ['Night Skyline', 'Harbor Lights', 'Downtown Dusk', 'Neon Blocks'],
  abstract: ['Orbit', 'Drift', 'Tidal', 'Prism']
};
const images = [];
let seed = 1;
Object.keys(names).forEach(cat => names[cat].forEach(title =>
  images.push({ title, category: cat, src: art(cat, seed++) })));

// ---- Elements & state --------------------------------------------------
const grid = document.getElementById('grid');
const count = document.getElementById('count');
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbTitle = document.getElementById('lb-title');
const lbCount = document.getElementById('lb-count');
let filter = 'all', visible = [], index = 0;

// ---- Gallery -----------------------------------------------------------
function render() {
  visible = images.filter(i => filter === 'all' || i.category === filter);
  grid.innerHTML = '';
  visible.forEach((img, i) => {
    const b = document.createElement('button');
    b.className = 'card';
    b.style.setProperty('--i', i);
    b.innerHTML = `<img src="${img.src}" alt="${img.title}, ${img.category} image" loading="lazy">
      <span class="meta"><b>${img.title}</b><small>${img.category}</small></span>`;
    b.addEventListener('click', () => openBox(i));
    grid.appendChild(b);
  });
  count.textContent = `${visible.length} image${visible.length === 1 ? '' : 's'}`;
}

document.querySelector('.filters').addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === btn));
  filter = btn.dataset.filter;
  render();
});

// ---- Lightbox ----------------------------------------------------------
function show(i, animate = true) {
  index = (i + visible.length) % visible.length;
  const img = visible[index];
  const apply = () => {
    lbImg.src = img.src;
    lbImg.alt = `${img.title}, ${img.category} image`;
    lbTitle.textContent = img.title;
    lbCount.textContent = `${index + 1} / ${visible.length}`;
    lbImg.classList.remove('fade');
  };
  if (animate) { lbImg.classList.add('fade'); setTimeout(apply, 180); } else apply();
}
function openBox(i) {
  show(i, false);
  lb.hidden = false;
  requestAnimationFrame(() => lb.classList.add('open'));
  document.body.style.overflow = 'hidden';
  document.getElementById('close').focus();
}
function closeBox() {
  lb.classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('next').onclick = () => show(index + 1);
document.getElementById('prev').onclick = () => show(index - 1);
document.getElementById('close').onclick = closeBox;
lb.addEventListener('click', e => { if (e.target === lb) closeBox(); });

document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'ArrowRight') show(index + 1);
  else if (e.key === 'ArrowLeft') show(index - 1);
  else if (e.key === 'Escape') closeBox();
});

// Swipe support on touch screens
let startX = 0;
lb.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
});

render();
