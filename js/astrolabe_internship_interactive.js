// Scroll reveal
    const reveals = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    reveals.forEach(r => io.observe(r));

    // Lightbox
    const lightbox      = document.getElementById('lightbox');
    const lightboxImg   = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    function openLightbox(src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    document.querySelectorAll('.media-card').forEach(card => {
      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        openLightbox(img.src, img.alt);
      });
    });
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

    // Add-more upload slot
    document.querySelectorAll('.media-placeholder').forEach(slot => {
      const input = slot.querySelector('input[type="file"]');
      if (!input) return;
      input.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const n = document.querySelectorAll('.media-card').length + 1;
        const card = document.createElement('div');
        card.className = 'media-card';
        card.innerHTML = `
          <div class="media-img-wrap"><img src="${url}" alt="${file.name}" /></div>
          <div class="media-caption">
            <span class="media-caption-num">0${n}</span>
            <div><div class="media-caption-title">${file.name}</div></div>
          </div>`;
        card.addEventListener('click', () => openLightbox(url, file.name));
        slot.replaceWith(card);
      });
    });

    /* ─────────────────────────────────────────
       EFFECT 1 — HERO PARTICLE REPULSION
    ───────────────────────────────────────── */
    const heroCanvas = document.getElementById('heroCanvas');
    if (heroCanvas) {
      const ctx2 = heroCanvas.getContext('2d');
      let W2, H2, particles2 = [];
      const MOUSE2      = { x: -9999, y: -9999 };
      const REPEL_R     = 110;
      const REPEL_STR   = 4;
      const P_COUNT     = 120;

      function resize2() {
        W2 = heroCanvas.width  = heroCanvas.offsetWidth;
        H2 = heroCanvas.height = heroCanvas.offsetHeight;
      }

      class Particle2 {
        constructor() { this.reset(true); }
        reset(randomY = false) {
          this.x = Math.random() * W2;
          this.y = randomY ? Math.random() * H2 : H2 + 10;
          this.vx = (Math.random() - 0.5) * 0.25;
          this.vy = -(Math.random() * 0.28 + 0.08);
          this.r  = Math.random() * 2.2 + 0.8;
          this.alpha = Math.random() * 0.3 + 0.08;
          this.color = Math.random() > 0.5 ? '5,102,141' : '103,148,54';
        }
        update() {
          this.x += this.vx;
          this.y += this.vy;
          const dx = this.x - MOUSE2.x;
          const dy = this.y - MOUSE2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < REPEL_R && dist > 0) {
            const force = (REPEL_R - dist) / REPEL_R;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * REPEL_STR;
            this.y += Math.sin(angle) * force * REPEL_STR;
          }
          if (this.y < -10 || this.x < -20 || this.x > W2 + 20) this.reset(false);
        }
        draw() {
          ctx2.beginPath();
          ctx2.arc(this.x, this.y, this.r, 0, Math.PI * 2);
          ctx2.fillStyle = `rgba(${this.color},${this.alpha})`;
          ctx2.fill();
        }
      }

      function initP2() {
        particles2 = [];
        for (let i = 0; i < P_COUNT; i++) particles2.push(new Particle2());
      }

      function loop2() {
        ctx2.clearRect(0, 0, W2, H2);
        particles2.forEach(p => { p.update(); p.draw(); });
        // Connecting lines
        for (let i = 0; i < particles2.length; i++) {
          for (let j = i + 1; j < particles2.length; j++) {
            const dx = particles2[i].x - particles2[j].x;
            const dy = particles2[i].y - particles2[j].y;
            const d  = Math.sqrt(dx * dx + dy * dy);
            if (d < 90) {
              ctx2.beginPath();
              ctx2.moveTo(particles2[i].x, particles2[i].y);
              ctx2.lineTo(particles2[j].x, particles2[j].y);
              ctx2.strokeStyle = `rgba(5,102,141,${0.07 * (1 - d / 90)})`;
              ctx2.lineWidth = 1;
              ctx2.stroke();
            }
          }
        }
        requestAnimationFrame(loop2);
      }

      const heroEl = document.getElementById('internHero');
      heroEl.addEventListener('mousemove', e => {
        const rect = heroCanvas.getBoundingClientRect();
        MOUSE2.x = e.clientX - rect.left;
        MOUSE2.y = e.clientY - rect.top;
      });
      heroEl.addEventListener('mouseleave', () => { MOUSE2.x = -9999; MOUSE2.y = -9999; });

      window.addEventListener('resize', () => { resize2(); initP2(); });
      resize2(); initP2(); loop2();
    }

    /* ─────────────────────────────────────────
       EFFECT 2 — ROLE CARDS MAGNETIC TILT
    ───────────────────────────────────────── */
    document.querySelectorAll('.role-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);
        const tiltX  = -dy * 10;
        const tiltY  =  dx * 10;
        const shine  = `radial-gradient(circle at ${(dx+1)/2*100}% ${(dy+1)/2*100}%, rgba(255,255,255,0.12) 0%, transparent 65%)`;
        card.style.transform   = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
        card.style.boxShadow   = `0 16px 40px rgba(5,102,141,0.2)`;
        card.style.background  = `linear-gradient(135deg, #ffffff, #f8fbfe), ${shine}`;
        card.querySelector('.role-card::before') && null; // noop
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform  = '';
        card.style.boxShadow  = '';
        card.style.background = '';
      });
    });

    /* ─────────────────────────────────────────
       EFFECT 3 — SKILL CHIPS REPULSION SCATTER
    ───────────────────────────────────────── */
    const skillsSection = document.querySelector('.skills-grid');
    if (skillsSection) {
      const chips = Array.from(skillsSection.querySelectorAll('.skill-chip'));
      const origins = chips.map(() => ({ tx: 0, ty: 0 }));

      skillsSection.addEventListener('mousemove', e => {
        const sRect = skillsSection.getBoundingClientRect();
        const mx = e.clientX - sRect.left;
        const my = e.clientY - sRect.top;

        chips.forEach((chip, i) => {
          const cRect = chip.getBoundingClientRect();
          const cx = cRect.left + cRect.width  / 2 - sRect.left;
          const cy = cRect.top  + cRect.height / 2 - sRect.top;
          const dx = cx - mx;
          const dy = cy - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const RADIUS = 100;
          if (dist < RADIUS && dist > 0) {
            const force = (RADIUS - dist) / RADIUS;
            const angle = Math.atan2(dy, dx);
            origins[i].tx = Math.cos(angle) * force * 18;
            origins[i].ty = Math.sin(angle) * force * 18;
          } else {
            origins[i].tx *= 0.85;
            origins[i].ty *= 0.85;
          }
          chip.style.transform = `translate(${origins[i].tx}px, ${origins[i].ty}px)`;
          chip.style.transition = dist < RADIUS ? 'transform 0.05s linear' : 'transform 0.5s ease';
        });
      });

      skillsSection.addEventListener('mouseleave', () => {
        chips.forEach((chip, i) => {
          origins[i].tx = 0; origins[i].ty = 0;
          chip.style.transform = '';
          chip.style.transition = 'transform 0.6s ease';
        });
      });
    }