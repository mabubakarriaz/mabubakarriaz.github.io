/* ============================================================
   THEME TOGGLE (1.2.3)
   Reads/writes localStorage('theme'). Dark = no attribute on <html>.
   Light = data-theme="light" on <html>.
   ============================================================ */
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  });

  // Respect OS preference changes when no manual override is stored
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  });
}

// Remove no-transition class after first paint to enable smooth theme switching
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('no-transition');
  });
});

/* ============================================================
   NAVBAR: add .scrolled class on scroll
   ============================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ============================================================
   MOBILE MENU TOGGLE
   ============================================================ */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ============================================================
   ACTIVE NAV LINK on scroll
   ============================================================ */
const sections  = document.querySelectorAll('section[id]');
const navItems  = document.querySelectorAll('.nav-link[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navItems.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));

/* ============================================================
   SCROLL-TRIGGERED ANIMATIONS
   ============================================================ */
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.animate-on-scroll').forEach(el => animObserver.observe(el));

/* ============================================================
   TYPING ANIMATION for hero role
   ============================================================ */
const roles = [
  'Principal DevOps Engineer',
  'Azure Cloud Architect',
  'Full Stack .NET Developer',
  'SQL Server Trainer',
];

const roleEl = document.getElementById('roleText');
if (roleEl) {
  let roleIndex = 0;
  let charIndex  = 0;
  let isDeleting = false;
  const TYPING_SPEED   = 65;
  const DELETING_SPEED = 35;
  const PAUSE_DURATION = 2200;

  function type() {
    const current = roles[roleIndex];

    if (isDeleting) {
      roleEl.textContent = current.slice(0, charIndex - 1);
      charIndex--;
    } else {
      roleEl.textContent = current.slice(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? DELETING_SPEED : TYPING_SPEED;

    if (!isDeleting && charIndex === current.length) {
      delay = PAUSE_DURATION;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex  = (roleIndex + 1) % roles.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  // Respect reduced motion: keep the static role text, skip the typing loop.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // small delay before starting so hero animation finishes first
    setTimeout(type, 900);
  }
}

/* ============================================================
   STAT COUNT-UP — animate numbers when the stats bar enters view
   ============================================================ */
const statValues = document.querySelectorAll('.stat-value[data-count]');
if (statValues.length) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const runCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }
    const DURATION = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    };
    requestAnimationFrame(tick);
  };

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statValues.forEach(el => statObserver.observe(el));
}

/* ============================================================
   Shared motion / input flags
   ============================================================ */
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER   = window.matchMedia('(pointer: fine)').matches;

/* ============================================================
   HERO NETWORK CANVAS — a drifting node topology ("the control plane").
   Nodes wander, link to nearby nodes, and reach toward the cursor.
   Paused off-screen / on hidden tabs; disabled for reduced motion.
   ============================================================ */
(function heroNetwork() {
  const canvas = document.getElementById('heroNet');
  const hero   = document.getElementById('home');
  if (!canvas || !hero || REDUCED_MOTION) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let nodes = [];
  let raf = null;
  let running = false;
  const pointer = { x: -9999, y: -9999 };

  function build() {
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    if (!w || !h) return;
    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(26, Math.min(Math.round((w * h) / 22000), 70));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    const LINK = 130;
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x <= 0 || n.x >= w) n.vx *= -1;
      if (n.y <= 0 || n.y >= h) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(120,134,248,${(1 - d / LINK) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      const d = Math.hypot(n.x - pointer.x, n.y - pointer.y);
      if (d < 190) {
        ctx.strokeStyle = `rgba(34,211,238,${(1 - d / 190) * 0.55})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(129,140,248,0.7)';
      ctx.beginPath(); ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!running && nodes.length) { running = true; frame(); } }
  function stop()  { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  build();
  start();

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      build();
    }, 200);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => (e.isIntersecting ? start() : stop()));
    }, { threshold: 0 }).observe(hero);
  }

  if (FINE_POINTER) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      hero.style.setProperty('--mx', pointer.x + 'px');
      hero.style.setProperty('--my', pointer.y + 'px');
      hero.classList.add('is-pointing');
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      pointer.x = -9999; pointer.y = -9999;
      hero.classList.remove('is-pointing');
    });
  }
})();

/* ============================================================
   CARD CURSOR SPOTLIGHT — a glow tracks the pointer inside grids
   ============================================================ */
if (FINE_POINTER && !REDUCED_MOTION) {
  document.querySelectorAll('.cert-grid, .projects-grid').forEach((grid) => {
    grid.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.cert-card, .project-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  });
}

/* ============================================================
   CONSOLE BOOT — reveal the hero console's lines in sequence.
   Defaults to fully visible; only animates when motion is allowed.
   ============================================================ */
(function consoleBoot() {
  const panel = document.querySelector('.hero-console');
  if (!panel || REDUCED_MOTION) return;
  const lines = Array.from(panel.querySelectorAll('.console-body > *'));
  if (!lines.length) return;
  panel.classList.add('booting');
  let i = 0;
  const reveal = () => {
    if (i >= lines.length) return;
    lines[i].classList.add('lit');
    i += 1;
    setTimeout(reveal, 170);
  };
  setTimeout(reveal, 450);
})();
