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
