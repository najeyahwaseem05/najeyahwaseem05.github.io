/* ============================================================
   Najeyah Waseem Portfolio — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     PARTICLE / MOUSE REPULSION HERO EFFECT
  ───────────────────────────────────────── */
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const PARTICLE_COUNT = 150;
    const MOUSE = { x: -9999, y: -9999 };
    const REPEL_RADIUS = 120;
    const REPEL_STRENGTH = 3.5;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = canvas.closest('.hero-section').offsetHeight;
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(randomY = false) {
        this.x  = Math.random() * W;
        this.y  = randomY ? Math.random() * H : H + 10;
        this.ox = this.x; // origin x
        this.oy = this.y;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = -(Math.random() * 0.3 + 0.1);
        this.r  = Math.random() * 2.5 + 1;
        this.alpha = Math.random() * 0.35 + 0.1;
        this.color = Math.random() > 0.5 ? '5,102,141' : '103,148,54';
      }
      update() {
        // Gentle drift
        this.x += this.vx;
        this.y += this.vy;

        // Mouse repulsion
        const dx = this.x - MOUSE.x;
        const dy = this.y - MOUSE.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force * REPEL_STRENGTH;
          this.y += Math.sin(angle) * force * REPEL_STRENGTH;
        }

        // Wrap / reset
        if (this.y < -10 || this.x < -20 || this.x > W + 20) {
          this.reset(false);
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    }

    let animId;
    function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });

      // Draw connecting lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(5,102,141,${0.08 * (1 - d / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(loop);
    }

    // Mouse tracking (hero section only)
    const heroSection = document.getElementById('hero');
    heroSection.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      MOUSE.x = e.clientX - rect.left;
      MOUSE.y = e.clientY - rect.top;
    });
    heroSection.addEventListener('mouseleave', () => {
      MOUSE.x = -9999;
      MOUSE.y = -9999;
    });

    resize();
    initParticles();
    loop();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    // Stop animation when hero not visible (performance)
    const heroObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (!animId) loop();
      } else {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }, { threshold: 0 });
    heroObs.observe(heroSection);
  }


  /* ─────────────────────────────────────────
     NAVBAR — scroll class + active links
  ───────────────────────────────────────── */
  const navbar  = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  function updateNav() {
    // Scroll shadow
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    // Active section highlight
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 140) current = s.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ── Mobile menu ── */
  const mobileBtn = document.getElementById('mobileBtn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => navbar.classList.toggle('mobile-open'));
    navLinks.forEach(a => a.addEventListener('click', () => navbar.classList.remove('mobile-open')));
  }


  /* ─────────────────────────────────────────
     SCROLL ANIMATIONS (IntersectionObserver)
  ───────────────────────────────────────── */
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('in-view');

      // Animate progress bars when card enters view
      const bars = entry.target.querySelectorAll('.progress-fill');
      if (bars.length) {
        bars.forEach(bar => {
          const w = bar.getAttribute('data-width');
          if (w) bar.style.width = w + '%';
        });
      }

      scrollObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.scroll-anim').forEach(el => scrollObserver.observe(el));


  /* ─────────────────────────────────────────
     PROJECTS CAROUSEL — 3D Coverflow
  ───────────────────────────────────────── */
  const track    = document.getElementById('carouselTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('carouselDots');

  if (track && prevBtn && nextBtn && dotsWrap) {
    const cards = Array.from(track.querySelectorAll('.project-card'));
    let currentIdx = 0;

    // Build dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function getDots() { return Array.from(dotsWrap.querySelectorAll('.carousel-dot')); }

    const n = cards.length;
    const wrap = idx => ((idx % n) + n) % n;

    function goTo(idx) {
      currentIdx = wrap(idx);

      cards.forEach((card, i) => {
        card.classList.remove('coverflow-active','coverflow-prev-1','coverflow-prev-2','coverflow-next-1','coverflow-next-2','coverflow-hidden');

        // Shortest circular offset
        let offset = i - currentIdx;
        if (offset > n / 2)  offset -= n;
        if (offset < -n / 2) offset += n;

        if      (offset === 0)  card.classList.add('coverflow-active');
        else if (offset === -1) card.classList.add('coverflow-prev-1');
        else if (offset === 1)  card.classList.add('coverflow-next-1');
        else if (offset === -2) card.classList.add('coverflow-prev-2');
        else if (offset === 2)  card.classList.add('coverflow-next-2');
        else                    card.classList.add('coverflow-hidden');
      });

      getDots().forEach((d, i) => d.classList.toggle('active', i === currentIdx));
      prevBtn.disabled = false;
      nextBtn.disabled = false;
    }

    prevBtn.addEventListener('click', () => goTo(currentIdx - 1));
    nextBtn.addEventListener('click', () => goTo(currentIdx + 1));

    // Click side cards to navigate
    cards.forEach((card, i) => {
      card.addEventListener('click', () => {
        if (i !== currentIdx) goTo(i);
      });
    });

    // Initialize
    goTo(0);

    // Drag/swipe support
    let startX = 0, isDragging = false, dragDelta = 0;

    function dragStart(e) {
      isDragging = true;
      dragDelta = 0;
      startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      track.classList.add('dragging');
    }
    function dragMove(e) {
      if (!isDragging) return;
      const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      dragDelta = startX - x;
    }
    function dragEnd(e) {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('dragging');
      if (Math.abs(dragDelta) > 50) {
        goTo(dragDelta > 0 ? currentIdx + 1 : currentIdx - 1);
      }
      dragDelta = 0;
    }

    track.addEventListener('mousedown',  dragStart);
    track.addEventListener('mousemove',  dragMove);
    track.addEventListener('mouseup',    dragEnd);
    track.addEventListener('mouseleave', dragEnd);
    track.addEventListener('touchstart', dragStart, { passive: false });
    track.addEventListener('touchmove',  dragMove,  { passive: true });
    track.addEventListener('touchend',   dragEnd);

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      const projectsSection = document.getElementById('projects');
      const rect = projectsSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        if (e.key === 'ArrowLeft') goTo(currentIdx - 1);
        if (e.key === 'ArrowRight') goTo(currentIdx + 1);
      }
    });
  }


  /* ─────────────────────────────────────────
     HORIZONTAL TIMELINE — drag scroll
  ───────────────────────────────────────── */
  const htScroll = document.getElementById('htimelineScroll');
  if (htScroll) {
    let isDown = false, startScrollX = 0, scrollStart = 0;

    htScroll.addEventListener('mousedown', e => {
      isDown = true;
      startScrollX = e.clientX;
      scrollStart  = htScroll.scrollLeft;
      htScroll.style.cursor = 'grabbing';
    });
    htScroll.addEventListener('mouseleave', () => { isDown = false; htScroll.style.cursor = 'grab'; });
    htScroll.addEventListener('mouseup',    () => { isDown = false; htScroll.style.cursor = 'grab'; });
    htScroll.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      htScroll.scrollLeft = scrollStart - (e.clientX - startScrollX);
    }, { passive: false });
  }


  /* ─────────────────────────────────────────
     BACK TO TOP
  ───────────────────────────────────────── */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }


  /* ─────────────────────────────────────────
     RESEARCH MODAL
  ───────────────────────────────────────── */
  const researchModal     = document.getElementById('researchModal');
  const viewResearchBtn   = document.getElementById('viewResearchBtn');
  const researchModalClose = document.getElementById('researchModalClose');

  if (researchModal && viewResearchBtn) {
    function openModal(e) {
      e.preventDefault();
      researchModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      researchModal.classList.remove('open');
      document.body.style.overflow = '';
    }

    viewResearchBtn.addEventListener('click', openModal);
    researchModalClose.addEventListener('click', closeModal);
    researchModal.addEventListener('click', e => {
      if (e.target === researchModal) closeModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && researchModal.classList.contains('open')) closeModal();
    });
  }

});