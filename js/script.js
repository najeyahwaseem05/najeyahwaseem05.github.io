/* Najeyah Waseem — portfolio interactions */
document.addEventListener('DOMContentLoaded', () => {
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const mouse = { x: -9999, y: -9999 };
  const lerp = (a, b, t) => a + (b - a) * t;

  /* cursor: exact-tracking square dot + reticle brackets that lock onto targets */
  const dot = document.querySelector('.cursor-dot');
  const ret = document.querySelector('.reticle');
  const glow = document.querySelector('.glow');
  if (fine && dot && ret) {
    const LOCK = 'a, button, .chip, .projects .card:not(.featured), .shot';
    const R = { x: 0, y: 0, w: 28, h: 28 }, T = { x: 0, y: 0, w: 28, h: 28 };
    let locked = null;
    addEventListener('pointermove', e => {
      document.body.classList.add('has-cursor');
      mouse.x = e.clientX; mouse.y = e.clientY;
      dot.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      if (glow) { glow.style.setProperty('--gx', e.clientX + 'px'); glow.style.setProperty('--gy', e.clientY + 'px'); }
      if (!locked) { T.x = e.clientX; T.y = e.clientY; T.w = 28; T.h = 28; }
    });
    document.addEventListener('pointerover', e => {
      const hit = e.target.closest(LOCK);
      if (!hit) return;
      locked = hit; ret.classList.add('locked');
    });
    document.addEventListener('pointerout', e => {
      if (locked && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(LOCK))) {
        locked = null; ret.classList.remove('locked');
      }
    });
    document.documentElement.addEventListener('pointerleave', () => document.body.classList.remove('has-cursor'));
    (function tick() {
      if (locked) {
        const b = locked.getBoundingClientRect();
        T.x = b.left + b.width / 2; T.y = b.top + b.height / 2;
        T.w = b.width + 16; T.h = b.height + 16;
      }
      R.x = lerp(R.x, T.x, 0.34); R.y = lerp(R.y, T.y, 0.34);
      R.w = lerp(R.w, T.w, 0.28); R.h = lerp(R.h, T.h, 0.28);
      ret.style.width = R.w + 'px'; ret.style.height = R.h + 'px';
      ret.style.transform = `translate(${R.x - R.w / 2}px,${R.y - R.h / 2}px)`;
      requestAnimationFrame(tick);
    })();
  }

  /* hero grid of square dots that light up and push away from the pointer */
  const canvas = document.getElementById('grid');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const GAP = 32, RADIUS = 170, dpr = Math.min(devicePixelRatio || 1, 2);
    let W, H, dots = [], running = true;
    const build = () => {
      const box = canvas.parentElement.getBoundingClientRect();
      W = box.width; H = box.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let x = GAP / 2, i = 0; x < W; x += GAP, i++)
        for (let y = GAP / 2, j = 0; y < H; y += GAP, j++)
          dots.push({ x, y, ox: 0, oy: 0, hot: (i * 3 + j * 5) % 7 === 0 });
    };
    const paint = (d, t) => {
      const s = 2.4 + t * 4.2;
      ctx.fillStyle = t > 0.02
        ? (d.hot ? `rgba(224,118,46,${0.3 + t * 0.7})` : `rgba(160,185,92,${0.3 + t * 0.7})`)
        : 'rgba(154,145,124,0.2)';
      ctx.fillRect(d.x + d.ox - s / 2, d.y + d.oy - s / 2, s, s);
    };
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      const box = canvas.getBoundingClientRect();
      const mx = mouse.x - box.left, my = mouse.y - box.top;
      for (const d of dots) {
        const dx = d.x - mx, dy = d.y - my, dist = Math.hypot(dx, dy);
        let tx = 0, ty = 0, t = 0;
        if (dist < RADIUS) { t = 1 - dist / RADIUS; tx = (dx / (dist || 1)) * t * 16; ty = (dy / (dist || 1)) * t * 16; }
        d.ox = lerp(d.ox, tx, 0.14); d.oy = lerp(d.oy, ty, 0.14);
        paint(d, t);
      }
      requestAnimationFrame(draw);
    };
    build(); addEventListener('resize', () => { build(); if (calm) dots.forEach(d => paint(d, 0)); });
    if (calm) dots.forEach(d => paint(d, 0));
    else {
      draw();
      new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting; if (running && !was) draw(); }).observe(canvas);
    }
    if (!fine) canvas.parentElement.addEventListener('touchmove', e => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }, { passive: true });
  }

  /* typer */
  const typer = document.getElementById('typer');
  if (typer && !calm) {
    const words = ['web application security', 'attack-path analysis', 'machine learning that resists poisoning', 'CI/CD pipelines in the cloud', 'AI red teaming'];
    let w = 0, c = 0, del = false;
    const step = () => {
      const word = words[w];
      c += del ? -1 : 1;
      typer.textContent = word.slice(0, c);
      let wait = del ? 28 : 62;
      if (!del && c === word.length) { del = true; wait = 1700; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 380; }
      setTimeout(step, wait);
    };
    typer.textContent = ''; setTimeout(step, 700);
  }

  /* card spotlight + tilt toward the pointer */
  document.querySelectorAll('.spot').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - r.left + 'px');
      el.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });
  if (fine && !calm) {
    document.querySelectorAll('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('moving');
        el.style.setProperty('--rx', (px * 7).toFixed(2) + 'deg');
        el.style.setProperty('--ry', (-py * 7).toFixed(2) + 'deg');
      });
      el.addEventListener('mouseleave', () => {
        el.classList.remove('moving');
        el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
      });
    });
    document.querySelectorAll('.btn').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });
  }

  /* projects: click a card to make it the large one */
  const grid = document.getElementById('projects-grid');
  if (grid) {
    const cards = [...grid.querySelectorAll('.card')];
    const label = c => c.querySelector('h3').textContent;
    const mark = (c, on) => {
      c.classList.toggle('featured', on);
      if (on) { c.removeAttribute('role'); c.removeAttribute('tabindex'); c.removeAttribute('aria-label'); }
      else { c.setAttribute('role', 'button'); c.setAttribute('tabindex', '0'); c.setAttribute('aria-label', 'Show project: ' + label(c)); }
    };
    cards.forEach((c, i) => { c.style.viewTransitionName = 'proj' + i; mark(c, c.classList.contains('featured')); });
    const show = card => {
      if (card.classList.contains('featured')) return;
      const apply = () => cards.forEach(c => mark(c, c === card));
      if (document.startViewTransition && !calm) document.startViewTransition(apply); else apply();
      if (innerWidth < 900) grid.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    };
    cards.forEach(c => {
      c.addEventListener('click', e => { if (!e.target.closest('a')) show(c); });
      c.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !c.classList.contains('featured')) { e.preventDefault(); show(c); } });
    });
  }

  /* nav */
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('menuBtn');
  if (toggle) {
    toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', open); });
    nav.querySelectorAll('.links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }
  const links = [...document.querySelectorAll('.links a[href^="#"]')];
  if (links.length) {
    const secs = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const spy = () => { let cur = ''; secs.forEach(s => { if (scrollY >= s.offsetTop - 140) cur = s.id; }); links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur)); };
    addEventListener('scroll', spy, { passive: true }); spy();
  }
  const top = document.getElementById('toTop');
  if (top) top.addEventListener('click', () => scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' }));

  /* CV popup (styled page content, with a separate PDF download) */
  const cv = document.getElementById('cvModal');
  if (cv) {
    const closeBtn = document.getElementById('cvClose');
    let opener = null;
    const open = el => { opener = el; cv.classList.add('open'); cv.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; closeBtn.focus(); };
    const shut = () => { cv.classList.remove('open'); cv.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; if (opener) opener.focus(); };
    document.querySelectorAll('[data-cv]').forEach(b => b.addEventListener('click', () => open(b)));
    closeBtn.addEventListener('click', shut);
    cv.addEventListener('click', e => { if (e.target === cv) shut(); });
    addEventListener('keydown', e => {
      if (!cv.classList.contains('open')) return;
      if (e.key === 'Escape') shut();
      if (e.key === 'Tab') {
        const f = [...cv.querySelectorAll('a[href],button')];
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* lightbox */
  const lb = document.getElementById('lightbox');
  if (lb) {
    const img = lb.querySelector('img');
    const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
    document.querySelectorAll('.shot').forEach(s => s.addEventListener('click', () => {
      const i = s.querySelector('img'); img.src = i.src; img.alt = i.alt;
      lb.classList.add('open'); document.body.style.overflow = 'hidden';
    }));
    lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('button')) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
});
