/**
 * Sora & Umi Café & Dining (空と海)
 * script.js — Interactions, Animations & Dynamic Elements
 *
 * Sections:
 *  1. Navbar scroll behavior
 *  2. Hamburger menu toggle
 *  3. Scroll reveal (IntersectionObserver)
 *  4. Smooth scroll for anchor links
 *  5. Sky-to-Ocean parallax background
 *  6. Sakura canvas animation
 *  7. Floating fish layer
 *  8. Rising bubble effect
 *  9. Bioluminescent particles
 * 10. Menu tab switching (café)
 * 11. Form submission handlers
 * 12. Reservation date/time defaults
 */

'use strict';

/* ─────────────────────────────────────────────
   1. NAVBAR SCROLL BEHAVIOR
   Transparent → frosted glass on scroll
───────────────────────────────────────────── */
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll(); // run on load


/* ─────────────────────────────────────────────
   2. HAMBURGER MENU TOGGLE
───────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a nav link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}


/* ─────────────────────────────────────────────
   3. SCROLL REVEAL (IntersectionObserver)
───────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // animate once
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));


/* ─────────────────────────────────────────────
   4. SMOOTH SCROLL FOR ANCHOR LINKS
───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar ? navbar.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ─────────────────────────────────────────────
   5. SKY-TO-OCEAN PARALLAX BACKGROUND
   Dynamically updates hero gradient on scroll
───────────────────────────────────────────── */
const hero = document.querySelector('.hero');

function updateHeroParallax() {
  if (!hero) return;
  const scrolled   = window.scrollY;
  const heroHeight = hero.offsetHeight;
  const progress   = Math.min(scrolled / heroHeight, 1);

  // Shift horizon point upward as user scrolls
  const horizon = Math.max(55 - progress * 30, 25);
  hero.style.backgroundImage = `
    linear-gradient(
      180deg,
      #B8DDF0 0%,
      #7EC8E3 ${horizon * 0.55}%,
      #4A9CBF ${horizon}%,
      #1B4965 ${horizon + 20}%,
      #0A2342 100%
    )
  `;
}

window.addEventListener('scroll', updateHeroParallax, { passive: true });


/* ─────────────────────────────────────────────
   6. SAKURA CANVAS ANIMATION
   Canvas overlay: falling cherry blossom petals
───────────────────────────────────────────── */
(function initSakura() {
  const canvas = document.getElementById('sakura-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let petals = [];
  let animId;
  let paused = false;

  // Respect reduced-motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) return;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Petal color variants
  const PETAL_COLORS = [
    'rgba(255,183,197,',   // sakura pink
    'rgba(255,210,220,',   // light pink
    'rgba(255,240,245,',   // near-white pink
    'rgba(250,170,185,',   // deeper pink
  ];

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x     = Math.random() * canvas.width;
      this.y     = initial ? Math.random() * -canvas.height : -20;
      this.size  = 5 + Math.random() * 7;          // 5–12px
      this.speedY = 0.6 + Math.random() * 1.2;     // fall speed
      this.speedX = (Math.random() - 0.5) * 0.8;   // horizontal drift
      this.angle  = Math.random() * Math.PI * 2;
      this.spin   = (Math.random() - 0.5) * 0.06;
      this.opacity = 0.6 + Math.random() * 0.4;
      this.color  = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
      this.wobble = 0;
      this.wobbleSpeed = 0.02 + Math.random() * 0.03;
      this.wobbleAmp   = 0.5 + Math.random() * 1.5;
    }

    update() {
      this.wobble += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobble) * this.wobbleAmp;
      this.y += this.speedY;
      this.angle += this.spin;

      // Fade out near bottom
      if (this.y > canvas.height * 0.85) {
        this.opacity -= 0.012;
      }

      if (this.y > canvas.height + 20 || this.opacity <= 0) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = Math.max(this.opacity, 0);

      // Draw petal shape (5-lobe flower petal)
      ctx.fillStyle = this.color + this.opacity + ')';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const r = this.size;
        const x1 = Math.cos(angle) * r * 0.5;
        const y1 = Math.sin(angle) * r * 0.5;
        const x2 = Math.cos(angle + Math.PI / 5) * r;
        const y2 = Math.sin(angle + Math.PI / 5) * r;
        if (i === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.closePath();
      ctx.fill();

      // Subtle center detail
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.18, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // Spawn initial petals
  const PETAL_COUNT = window.innerWidth < 768 ? 28 : 55;
  for (let i = 0; i < PETAL_COUNT; i++) {
    petals.push(new Petal());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(animate);
  }

  // Pause animation when tab is not visible (performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      paused = true;
      cancelAnimationFrame(animId);
    } else {
      paused = false;
      animate();
    }
  });

  animate();
})();


/* ─────────────────────────────────────────────
   7. FLOATING FISH LAYER
   Dynamically generates fish that swim across
───────────────────────────────────────────── */
(function initFloatingFish() {
  const fishLayer = document.getElementById('fish-layer') || document.querySelector('.fish-layer');
  if (!fishLayer) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Simple SVG fish silhouettes (2 variants)
  const fishSVGs = [
    // Small koi silhouette
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" fill="currentColor">
      <path d="M55 15 C45 5,25 3,5 15 C25 27,45 25,55 15Z"/>
      <path d="M5 15 C0 10,0 20,5 15Z"/>
      <circle cx="50" cy="13" r="1.5" fill="rgba(0,0,0,0.5)"/>
    </svg>`,
    // Wider fish
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 32" fill="currentColor">
      <ellipse cx="36" cy="16" rx="28" ry="10"/>
      <path d="M8 16 C0 8,0 24,8 16Z"/>
      <path d="M30 6 C35 0,40 0,38 6Z"/>
      <path d="M30 26 C35 32,40 32,38 26Z"/>
      <circle cx="58" cy="14" r="2" fill="rgba(0,0,0,0.4)"/>
    </svg>`,
  ];

  const FISH_COLORS = [
    'rgba(255,140,80,0.18)',
    'rgba(44,166,164,0.15)',
    'rgba(201,168,76,0.14)',
    'rgba(255,183,197,0.16)',
    'rgba(120,180,220,0.12)',
  ];

  function createFish() {
    const fish = document.createElement('div');
    fish.className = 'floating-fish';

    const size     = 40 + Math.random() * 60;   // 40–100px wide
    const topPct   = 10 + Math.random() * 75;   // vertical position
    const duration = 18 + Math.random() * 22;   // 18–40s
    const delay    = Math.random() * -30;        // stagger start times
    const color    = FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)];
    const svgIndex = Math.floor(Math.random() * fishSVGs.length);
    const flipY    = Math.random() > 0.5 ? 'scaleX(-1)' : 'none';

    fish.style.cssText = `
      position: absolute;
      top: ${topPct}%;
      left: -120px;
      width: ${size}px;
      color: ${color};
      transform: ${flipY};
      animation: fish-float-across ${duration}s ${delay}s linear infinite;
      pointer-events: none;
      opacity: 0;
    `;
    fish.innerHTML = fishSVGs[svgIndex];

    // Fade in after brief delay
    setTimeout(() => { fish.style.opacity = '1'; }, 100);

    return fish;
  }

  // Spawn fish (fewer on mobile for performance)
  const count = window.innerWidth < 768 ? 5 : 10;
  for (let i = 0; i < count; i++) {
    fishLayer.appendChild(createFish());
  }

  // Inject keyframe if not in CSS
  if (!document.querySelector('#fish-keyframe')) {
    const style = document.createElement('style');
    style.id = 'fish-keyframe';
    style.textContent = `
      @keyframes fish-float-across {
        0%   { transform: translateX(0) scaleX(1); opacity: 0; }
        5%   { opacity: 1; }
        95%  { opacity: 1; }
        100% { transform: translateX(calc(100vw + 200px)) scaleX(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
})();


/* ─────────────────────────────────────────────
   8. RISING BUBBLE EFFECT
   Generates bubbles that float upward in hero/aquarium
───────────────────────────────────────────── */
(function initBubbles() {
  const bubbleLayer = document.getElementById('bubble-layer') || document.querySelector('.bubble-layer');
  if (!bubbleLayer) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) return;

  function createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const size     = 4 + Math.random() * 12;      // 4–16px
    const leftPct  = Math.random() * 95;           // horizontal position
    const duration = 6 + Math.random() * 10;       // 6–16s
    const delay    = Math.random() * -15;           // stagger

    bubble.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${leftPct}%;
      bottom: -20px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;

    bubbleLayer.appendChild(bubble);

    // Remove and respawn after animation completes (avoid DOM bloat)
    bubble.addEventListener('animationiteration', () => {
      // Reset position for variety
      bubble.style.left = Math.random() * 95 + '%';
    });
  }

  const count = window.innerWidth < 768 ? 18 : 35;
  for (let i = 0; i < count; i++) {
    createBubble();
  }
})();


/* ─────────────────────────────────────────────
   8b. STEAM WISPS (café ambient — rising steam)
   Simulates steam from matcha / hot tea cups
───────────────────────────────────────────── */
(function initSteam() {
  const layer = document.getElementById('steam-layer');
  if (!layer) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const count = window.innerWidth < 768 ? 7 : 14;

  for (let i = 0; i < count; i++) {
    const wisp = document.createElement('div');
    wisp.className = 'steam-wisp';

    const width    = 28 + Math.random() * 36;          // 28–64px
    const height   = width * (1.6 + Math.random() * 0.8); // taller blob
    const left     = 4 + Math.random() * 92;           // % across viewport
    const duration = 10 + Math.random() * 14;          // 10–24s rise
    const delay    = -(Math.random() * 24);             // staggered starts
    const drift    = (Math.random() - 0.5) * 80;       // px side drift

    wisp.style.cssText = `
      width: ${width}px;
      height: ${height}px;
      left: ${left}%;
      bottom: -100px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      --drift: ${drift}px;
    `;
    layer.appendChild(wisp);
  }
})();


/* ─────────────────────────────────────────────
   8c. FLOATING TEA LEAVES (café ambient)
   Small tea / matcha leaves drifting downward
───────────────────────────────────────────── */
(function initTeaLeaves() {
  const layer = document.getElementById('tea-leaf-layer');
  if (!layer) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Tea leaf SVG variants
  const leafSVGs = [
    // Narrow elongated tea leaf
    `<svg viewBox="0 0 32 14" xmlns="http://www.w3.org/2000/svg">
      <path d="M1,7 Q6,1 16,1 Q26,1 31,7 Q26,13 16,13 Q6,13 1,7Z" fill="currentColor"/>
      <line x1="2" y1="7" x2="30" y2="7" stroke="rgba(255,255,255,0.25)" stroke-width="0.8"/>
      <line x1="16" y1="1" x2="10" y2="13" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
      <line x1="16" y1="1" x2="22" y2="13" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
    </svg>`,
    // Rounder matcha leaf
    `<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="9" rx="11" ry="8" fill="currentColor"/>
      <line x1="2" y1="9" x2="22" y2="9" stroke="rgba(255,255,255,0.2)" stroke-width="0.7"/>
      <line x1="12" y1="1" x2="12" y2="17" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>
    </svg>`,
    // Small pointed leaf
    `<svg viewBox="0 0 20 10" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,5 Q5,0 10,0 Q18,0 20,5 Q18,10 10,10 Q5,10 0,5Z" fill="currentColor"/>
      <line x1="1" y1="5" x2="19" y2="5" stroke="rgba(255,255,255,0.2)" stroke-width="0.6"/>
    </svg>`,
  ];

  // Matcha greens + dark tea tones
  const leafColors = [
    'rgba(106, 153, 78, 0.40)',   // matcha green
    'rgba(140, 195, 100, 0.32)',  // light green tea
    'rgba(82,  120, 50, 0.38)',   // deep matcha
    'rgba(101, 72,  38, 0.28)',   // dried tea leaf brown
    'rgba(130, 170, 80, 0.30)',   // fresh green
  ];

  const count = window.innerWidth < 768 ? 8 : 16;

  for (let i = 0; i < count; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'tea-leaf';

    const size     = 14 + Math.random() * 22;         // 14–36px wide
    const left     = 2  + Math.random() * 96;         // % horizontal
    const duration = 18 + Math.random() * 20;         // 18–38s fall
    const delay    = -(Math.random() * 38);            // stagger
    const drift    = (Math.random() - 0.5) * 120;     // px horizontal drift
    const color    = leafColors[Math.floor(Math.random() * leafColors.length)];
    const svgIdx   = Math.floor(Math.random() * leafSVGs.length);

    leaf.style.cssText = `
      width: ${size}px;
      height: auto;
      left: ${left}%;
      top: 0;
      color: ${color};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      --drift: ${drift}px;
    `;
    leaf.innerHTML = leafSVGs[svgIdx];
    layer.appendChild(leaf);
  }
})();


/* ─────────────────────────────────────────────
   9. BIOLUMINESCENT PARTICLES
   Glowing dots in the aquarium section
───────────────────────────────────────────── */
(function initBioParticles() {
  const container = document.getElementById('bio-particles');
  if (!container) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) return;

  const COLORS = [
    '#2CA6A4',  // teal
    '#7FF4F2',  // cyan
    '#C9A84C',  // gold
    '#FFB7C5',  // pink
    '#A0F0ED',  // light teal
  ];

  const count = window.innerWidth < 768 ? 30 : 60;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'bio-dot';

    const size     = 2 + Math.random() * 5;
    const x        = Math.random() * 100;
    const y        = Math.random() * 100;
    const color    = COLORS[Math.floor(Math.random() * COLORS.length)];
    const duration = 2 + Math.random() * 4;
    const delay    = Math.random() * -6;

    dot.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color};
      box-shadow: 0 0 ${size * 3}px ${color}, 0 0 ${size * 6}px ${color}44;
      animation: bio-pulse ${duration}s ${delay}s ease-in-out infinite;
      pointer-events: none;
    `;

    container.appendChild(dot);
  }
})();


/* ─────────────────────────────────────────────
   10. MENU TAB SWITCHING (CAFÉ SECTION)
───────────────────────────────────────────── */
const menuTabs   = document.querySelectorAll('.menu-tab');
const menuPanels = document.querySelectorAll('.menu-panel');

menuTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;  // "drinks" or "sweets"

    // Update tab active state
    menuTabs.forEach(t => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', String(t === tab));
    });

    // Show target panel — panels use id="cafe-drinks" / id="cafe-sweets"
    menuPanels.forEach(panel => {
      const isTarget = panel.id === `cafe-${target}`;
      panel.classList.toggle('active', isTarget);
      panel.setAttribute('aria-hidden', String(!isTarget));
      // Trigger reveal animations in newly shown panel
      if (isTarget) {
        panel.querySelectorAll('.reveal-up:not(.visible)').forEach(el => {
          el.classList.add('visible');
        });
      }
    });
  });
});


/* ─────────────────────────────────────────────
   11. FORM SUBMISSION HANDLERS
───────────────────────────────────────────── */

// ── Reservation form ──────────────────────────
const reservationForm = document.querySelector('.res-form');
if (reservationForm) {
  reservationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = reservationForm.querySelector('[type="submit"]');

    // Loading state
    const originalText = btn.textContent;
    btn.disabled    = true;
    btn.textContent = '予約中…';
    btn.style.opacity = '0.7';

    // Simulate async submission (replace with real API call)
    await new Promise(resolve => setTimeout(resolve, 1400));

    // Success state
    btn.textContent = '✓ ご予約を承りました';
    btn.style.background = 'linear-gradient(135deg, #2CA6A4, #7FF4F2)';
    btn.style.color = '#020B1C';
    btn.style.opacity = '1';

    showToast('ご予約ありがとうございます。確認メールをお送りしました。', 'success');

    setTimeout(() => {
      reservationForm.reset();
      btn.disabled    = false;
      btn.textContent = originalText;
      btn.style.background = '';
      btn.style.color = '';
    }, 4000);
  });
}

// ── Contact form ──────────────────────────────
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('[type="submit"]');

    const originalText = btn.textContent;
    btn.disabled    = true;
    btn.textContent = '送信中…';
    btn.style.opacity = '0.7';

    await new Promise(resolve => setTimeout(resolve, 1200));

    btn.textContent   = '✓ 送信完了';
    btn.style.opacity = '1';

    showToast('お問い合わせありがとうございます。3営業日以内にご連絡いたします。', 'success');

    setTimeout(() => {
      contactForm.reset();
      btn.disabled    = false;
      btn.textContent = originalText;
    }, 3500);
  });
}


/* ─────────────────────────────────────────────
   TOAST NOTIFICATION HELPER
───────────────────────────────────────────── */
function showToast(message, type = 'info') {
  // Create toast container if missing
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    container.style.cssText = `
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.setAttribute('role', 'status');
  toast.style.cssText = `
    background: ${type === 'success' ? 'rgba(44,166,164,0.95)' : 'rgba(201,168,76,0.95)'};
    color: #020B1C;
    padding: 14px 24px;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 340px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    backdrop-filter: blur(10px);
    transform: translateY(20px);
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
    pointer-events: auto;
  `;
  toast.textContent = message;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity   = '1';
    });
  });

  // Auto-dismiss after 4s
  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity   = '0';
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}


/* ─────────────────────────────────────────────
   12. RESERVATION DATE / TIME DEFAULTS
   Set minimum date to today and default time
───────────────────────────────────────────── */
(function setReservationDefaults() {
  const dateInput = document.getElementById('res-date');
  const timeInput = document.getElementById('res-time');

  if (dateInput) {
    // Set min to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Default to 3 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    dateInput.value = defaultDate.toISOString().split('T')[0];
  }

  if (timeInput) {
    timeInput.value = '18:30';  // matches <option value="18:30"> in select
  }
})();


/* ─────────────────────────────────────────────
   BONUS: JELLYFISH GLOW PULSE INTERACTION
   Click/tap to trigger extra glow burst
───────────────────────────────────────────── */
document.querySelectorAll('.jelly-orb').forEach(orb => {
  orb.addEventListener('click', function () {
    this.style.transform = 'scale(1.25)';
    this.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)';
    setTimeout(() => {
      this.style.transform = '';
      this.style.transition = '';
    }, 600);

    // Ripple burst
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%,-50%) scale(0);
      width: 100%; height: 100%;
      border-radius: 50%;
      border: 2px solid rgba(44,166,164,0.6);
      animation: jelly-ripple 0.8s ease-out forwards;
      pointer-events: none;
    `;
    this.style.position = 'relative';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 900);

    if (!document.querySelector('#jelly-ripple-keyframe')) {
      const s = document.createElement('style');
      s.id = 'jelly-ripple-keyframe';
      s.textContent = `
        @keyframes jelly-ripple {
          to { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
        }
      `;
      document.head.appendChild(s);
    }
  });
});


/* ─────────────────────────────────────────────
   BONUS: GALLERY ITEM HOVER REVEAL
   Subtle caption reveal on hover/focus
───────────────────────────────────────────── */
document.querySelectorAll('.gallery-item').forEach((item, i) => {
  const captions = [
    '深海の静寂', '桜と光', '回遊する魚たち', '天空の青', '珊瑚の庭', '夜の海底'
  ];
  const caption = document.createElement('div');
  caption.style.cssText = `
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 16px 20px;
    background: linear-gradient(transparent, rgba(2,11,28,0.85));
    color: rgba(255,255,255,0.9);
    font-family: 'Noto Serif JP', serif;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.08em;
    transform: translateY(100%);
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  `;
  caption.textContent = captions[i] || '空と海';
  item.style.position  = 'relative';
  item.style.overflow  = 'hidden';
  item.appendChild(caption);

  item.addEventListener('mouseenter', () => { caption.style.transform = 'translateY(0)'; });
  item.addEventListener('mouseleave', () => { caption.style.transform = 'translateY(100%)'; });
  item.addEventListener('focus',      () => { caption.style.transform = 'translateY(0)'; });
  item.addEventListener('blur',       () => { caption.style.transform = 'translateY(100%)'; });
});


/* ─────────────────────────────────────────────
   ACTIVE NAV LINK HIGHLIGHTING
   Updates active link based on scroll position
───────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const navItems = document.querySelectorAll('#nav-links a[href^="#"]');

  if (!navItems.length) return;

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navItems.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('active', isActive);
          link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
      });
    },
    {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    }
  );

  sections.forEach(s => sectionObserver.observe(s));
})();


/* ─────────────────────────────────────────────
   SAKURA FOREST — hero background silhouettes
   3-layer depth: back → mid → front
───────────────────────────────────────────── */
(function initSakuraForest() {
  const container = document.querySelector('.sakura-forest');
  if (!container) return;

  const W     = 1440;
  const H     = 800;
  const TRUNK = '#3D1A2E'; // dark muted rose-brown trunk & branches

  // Canopy colour sets per depth layer [base, light, highlight]
  const C = {
    back:  ['rgba(255,200,215,0.35)', 'rgba(255,225,238,0.25)', 'rgba(255,240,248,0.18)'],
    mid:   ['rgba(255,175,200,0.58)', 'rgba(255,205,222,0.42)', 'rgba(255,220,232,0.30)'],
    front: ['rgba(255,148,178,0.80)', 'rgba(255,182,205,0.62)', 'rgba(255,210,225,0.45)'],
  };

  // [cx, baseY, trunkH, canopyR, opacity, colourSet]
  const trees = [
    // ── Back layer — small, delicate
    [55,   780,  65, 36, 0.22, C.back],
    [220,  780,  72, 42, 0.20, C.back],
    [400,  780,  60, 34, 0.22, C.back],
    [580,  780,  70, 40, 0.20, C.back],
    [760,  780,  64, 37, 0.22, C.back],
    [940,  780,  73, 41, 0.20, C.back],
    [1120, 780,  62, 35, 0.22, C.back],
    [1310, 780,  68, 39, 0.20, C.back],
    // ── Mid layer — medium
    [140,  792, 112, 60, 0.36, C.mid],
    [350,  792, 122, 66, 0.34, C.mid],
    [555,  792, 116, 63, 0.36, C.mid],
    [740,  792, 120, 65, 0.34, C.mid],
    [930,  792, 114, 61, 0.36, C.mid],
    [1130, 792, 121, 65, 0.34, C.mid],
    [1340, 792, 110, 59, 0.36, C.mid],
    // ── Front layer — large, full blossom
    [-15,  800, 180,  90, 0.55, C.front],
    [255,  800, 205, 105, 0.55, C.front],
    [520,  800, 222, 116, 0.55, C.front],
    [715,  800, 234, 123, 0.55, C.front],
    [905,  800, 216, 113, 0.55, C.front],
    [1155, 800, 202, 103, 0.55, C.front],
    [1455, 800, 182,  88, 0.55, C.front],
  ];

  function makeTree(cx, by, th, r, op, cols) {
    const [cb, cl, ch] = cols;            // base, light, highlight
    const ty = by - th;                   // trunk top y
    const cy = ty - r * 0.45;            // canopy cluster centre y
    const tw = Math.max(r * 0.11, 6);    // trunk half-width at base
    const bw = Math.max(r * 0.08, 4);    // branch stroke-width
    const bY = ty + th * 0.32;           // branch junction y

    return `<g opacity="${op}">
      <!-- trunk -->
      <path d="M${cx-tw},${by} L${cx-tw*.5},${ty} L${cx+tw*.5},${ty} L${cx+tw},${by}Z"
            fill="${TRUNK}"/>
      <!-- branches -->
      <path d="M${cx},${bY} Q${cx-r*.42},${bY-th*.1} ${cx-r*.52},${cy+r*.6}"
            stroke="${TRUNK}" stroke-width="${bw}" fill="none" stroke-linecap="round"/>
      <path d="M${cx},${bY} Q${cx+r*.42},${bY-th*.1} ${cx+r*.52},${cy+r*.6}"
            stroke="${TRUNK}" stroke-width="${bw}" fill="none" stroke-linecap="round"/>
      <!-- canopy — outer blossom mass -->
      <ellipse cx="${cx}"        cy="${cy+r*.22}" rx="${r}"     ry="${r*.74}" fill="${cb}"/>
      <ellipse cx="${cx-r*.48}"  cy="${cy+r*.40}" rx="${r*.66}" ry="${r*.56}" fill="${cb}"/>
      <ellipse cx="${cx+r*.48}"  cy="${cy+r*.40}" rx="${r*.66}" ry="${r*.56}" fill="${cb}"/>
      <ellipse cx="${cx}"        cy="${cy+r*.50}" rx="${r*.76}" ry="${r*.50}" fill="${cb}"/>
      <!-- canopy — inner lighter blossoms -->
      <ellipse cx="${cx}"        cy="${cy}"        rx="${r*.70}" ry="${r*.60}" fill="${cl}"/>
      <ellipse cx="${cx-r*.26}"  cy="${cy+r*.12}" rx="${r*.50}" ry="${r*.45}" fill="${cl}"/>
      <ellipse cx="${cx+r*.26}"  cy="${cy+r*.12}" rx="${r*.50}" ry="${r*.45}" fill="${cl}"/>
      <!-- canopy — sunlit highlight at top -->
      <ellipse cx="${cx}"        cy="${cy-r*.08}" rx="${r*.44}" ry="${r*.36}" fill="${ch}"/>
    </g>`;
  }

  const ns  = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMax slice');
  svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  svg.innerHTML     = trees.map(t => makeTree(...t)).join('');
  container.appendChild(svg);
})();


/* ─────────────────────────────────────────────
   EDUCATIONAL BANNER
───────────────────────────────────────────── */
(function initEduBanner() {
  const banner = document.getElementById('edu-banner');
  const closeBtn = document.getElementById('edu-banner-close');
  if (!banner || !closeBtn) return;

  // Push navbar down while banner is visible
  document.body.classList.add('has-edu-banner');

  closeBtn.addEventListener('click', () => {
    banner.hidden = true;
    document.body.classList.remove('has-edu-banner');
    // Restore navbar to top
    const nb = document.getElementById('navbar');
    if (nb) nb.style.top = '0';
  });
})();


/* ─────────────────────────────────────────────
   SECURESHIELD PRO — EDUCATIONAL SCAM MODAL
   Demonstrates logical fallacies used in scams
───────────────────────────────────────────── */
(function initScamModal() {
  const modal      = document.getElementById('scam-modal');
  const box        = document.getElementById('scam-box');
  const backdrop   = document.getElementById('scam-backdrop');
  const closeBtn   = document.getElementById('scam-close');
  const protectBtn = document.getElementById('scam-btn-protect');
  const revealBtn  = document.getElementById('scam-btn-reveal');
  const demoNote   = document.getElementById('scam-demo-note');
  const explain    = document.getElementById('scam-explain');
  const timerEl    = document.getElementById('scam-timer');
  const scanFill   = document.getElementById('scam-scan-fill');
  const scanFile   = document.getElementById('scam-scan-file');
  const scanResult = document.getElementById('scam-scan-result');
  const threats    = document.getElementById('scam-threats');
  const ipEl       = document.getElementById('scam-ip');

  if (!modal) return;

  // Fake IP (randomly generated, not a real lookup)
  if (ipEl) {
    ipEl.textContent = '192.168.' + (Math.floor(Math.random() * 254) + 1) + '.' + (Math.floor(Math.random() * 254) + 1);
  }

  // — Element that triggered open (for focus return) —
  let triggerEl = null;
  // — Countdown state —
  let countdownInterval = null;
  let secondsLeft = 300;
  // — Reveal state —
  let revealMode = false;
  // — Scan state —
  let scanInterval = null;

  // ── Screen flash on open ──────────────────
  function flashScreen() {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed; inset: 0; z-index: 9590;
      background: rgba(0, 60, 200, 0.38);
      pointer-events: none;
      animation: scam-screen-flash 0.55s ease-out forwards;
    `;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);
  }

  // ── Fake scan animation ───────────────────
  const fakeFiles = [
    'C:\\Windows\\System32\\svchost.exe',
    'C:\\Users\\User\\AppData\\Roaming\\...',
    'C:\\Program Files\\Chrome\\cache...',
    'C:\\Windows\\Temp\\tmp4f8e2a1...',
    'C:\\Users\\User\\Documents\\...',
    'C:\\Windows\\System32\\drivers...',
  ];

  function runScan() {
    if (!scanFill) return;
    if (scanInterval) clearInterval(scanInterval);
    let progress = 0;
    let fileIdx  = 0;
    scanFill.style.width = '0%';
    if (scanResult) scanResult.hidden = true;
    if (threats)    threats.hidden    = true;
    if (scanFile)   scanFile.textContent = 'Initialising…';

    scanInterval = setInterval(() => {
      progress += Math.random() * 7 + 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(scanInterval);
        scanInterval = null;
        if (scanFill) scanFill.style.width = '100%';
        if (scanFile) scanFile.textContent = 'Scan complete';
        if (scanResult) scanResult.hidden = false;
        if (threats)    threats.hidden    = false;
        return;
      }
      if (scanFill) scanFill.style.width = progress + '%';
      const newIdx = Math.floor(progress / 18);
      if (newIdx > fileIdx) {
        fileIdx = newIdx;
        if (scanFile) scanFile.textContent = fakeFiles[fileIdx % fakeFiles.length];
      }
    }, 130);
  }

  // ── Open ──────────────────────────────────
  function openModal(trigger) {
    triggerEl = trigger || null;
    modal.hidden = false;
    secondsLeft = 300;
    updateTimer();
    startCountdown();
    flashScreen();
    runScan();
    // Reset reveal mode
    revealMode = false;
    box.classList.remove('reveal-mode');
    revealBtn.setAttribute('aria-pressed', 'false');
    revealBtn.innerHTML = '&#128269; Show me the tricks';
    demoNote.hidden = true;
    explain.hidden  = true;
    // Move focus into modal
    requestAnimationFrame(() => { box.focus(); });
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  // ── Close ─────────────────────────────────
  function closeModal() {
    modal.hidden = true;
    stopCountdown();
    document.body.style.overflow = '';
    // Return focus to trigger
    if (triggerEl) { triggerEl.focus(); }
  }

  // ── Countdown timer ───────────────────────
  function updateTimer() {
    const m = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const s = String(secondsLeft % 60).padStart(2, '0');
    timerEl.textContent = m + ':' + s;
  }

  function startCountdown() {
    stopCountdown();
    countdownInterval = setInterval(() => {
      if (secondsLeft > 0) {
        secondsLeft--;
        updateTimer();
      }
      // Timer loops back at 0 — fake urgency is always fake
      if (secondsLeft <= 0) { secondsLeft = 300; }
    }, 1000);
  }

  function stopCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  // ── Keyboard trap inside modal ─────────────
  function trapFocus(e) {
    if (modal.hidden) return;
    const focusable = Array.from(
      box.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.closest('[hidden]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    if (e.key === 'Escape') { closeModal(); }
  }

  document.addEventListener('keydown', trapFocus);

  // ── Crash effect before modal ─────────────
  if (!document.querySelector('#crash-styles')) {
    const crashCSS = document.createElement('style');
    crashCSS.id = 'crash-styles';
    crashCSS.textContent = `
      /* === Phase 1: page dying — filter corruption + shake === */
      body.page-dying {
        animation: page-die 0.07s steps(2) infinite;
        overflow: hidden !important;
        cursor: wait !important;
        user-select: none;
      }
      body.page-dying * { cursor: wait !important; pointer-events: none !important; }
      @keyframes page-die {
        0%   { filter: none;                                           transform: translate(0,0)       skewX(0deg); }
        20%  { filter: saturate(8) hue-rotate(90deg) contrast(3);     transform: translate(-5px,3px)  skewX(-1.5deg); }
        40%  { filter: invert(1) hue-rotate(180deg) brightness(1.4);  transform: translate(6px,-2px)  skewX(1deg); }
        60%  { filter: saturate(0) contrast(12) brightness(2.5);      transform: translate(-4px,5px)  skewX(0deg); }
        80%  { filter: hue-rotate(270deg) saturate(6) contrast(2);    transform: translate(4px,-4px)  skewX(-1deg); }
        100% { filter: none;                                           transform: translate(0,0)       skewX(0deg); }
      }

      /* === Phase 2: Chrome "Page Unresponsive" dialog === */
      #chrome-backdrop {
        position: fixed; inset: 0; z-index: 9792;
        background: rgba(0,0,0,0.30);
        animation: cfadein 0.13s ease-out;
      }
      @keyframes cfadein { from { opacity:0; } to { opacity:1; } }
      #chrome-dialog {
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%,-50%);
        z-index: 9793;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.07);
        width: 430px; max-width: 92vw;
        font-family: 'Google Sans', Roboto, system-ui, sans-serif;
        overflow: hidden;
        animation: cdialog-in 0.15s cubic-bezier(0.2,0,0,1);
      }
      @keyframes cdialog-in {
        from { transform: translate(-50%,-47%); opacity:0; }
        to   { transform: translate(-50%,-50%); opacity:1; }
      }
      .cd-titlebar {
        background: #f1f3f4; padding: 10px 16px;
        font-size: 12.5px; color: #202124; font-weight: 500;
        border-bottom: 1px solid #dadce0;
        display: flex; align-items: center; gap: 9px;
      }
      .cd-body {
        padding: 18px 20px 10px;
        font-size: 13.5px; color: #3c4043; line-height: 1.55;
      }
      .cd-page-url {
        font-size: 11.5px; color: #80868b;
        margin-top: 6px; white-space: nowrap;
        overflow: hidden; text-overflow: ellipsis;
      }
      .cd-actions {
        padding: 10px 16px 16px;
        display: flex; justify-content: flex-end; gap: 8px;
      }
      .cd-btn {
        padding: 7px 18px; border-radius: 4px;
        font-size: 13px; font-weight: 500; border: none;
        cursor: default;
        font-family: 'Google Sans', Roboto, system-ui, sans-serif;
      }
      .cd-btn-wait { background: transparent; color: #1a73e8; }
      .cd-btn-kill { background: #1a73e8; color: #fff; }

      /* === Phase 3: GPU corruption canvas === */
      #gpu-canvas {
        position: fixed; inset: 0; z-index: 9795;
        pointer-events: none;
      }

      /* === Phase 4: screen flicker === */
      #flash-overlay {
        position: fixed; inset: 0; z-index: 9797;
        pointer-events: none; background: #000; opacity: 0;
      }

      /* === Phase 5: Windows 11 BSOD === */
      #bsod-overlay {
        position: fixed; inset: 0; z-index: 9800;
        background: #1a52a1;
        display: flex; flex-direction: column;
        justify-content: center;
        padding: clamp(36px, 7.5vw, 130px);
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        color: #fff; overflow: hidden;
        cursor: none !important;
      }
      #bsod-overlay * { cursor: none !important; }
      .bsod-winlogo { margin-bottom: clamp(14px, 2.2vw, 28px); }
      .bsod-sad {
        font-size: clamp(68px, 12.5vw, 155px);
        line-height: 1; font-weight: 300;
        margin-bottom: clamp(18px, 2.8vw, 34px);
        letter-spacing: -4px; user-select: none;
      }
      .bsod-main {
        font-size: clamp(17px, 2.5vw, 34px);
        font-weight: 400; max-width: 680px;
        line-height: 1.4; margin-bottom: 14px;
      }
      /* Windows 11 spinning dots */
      .bsod-spinner {
        display: flex;
        gap: clamp(7px, 0.9vw, 11px);
        margin-bottom: clamp(10px, 1.8vw, 18px);
      }
      .bsod-dot {
        width:  clamp(7px, 1.1vw, 11px);
        height: clamp(7px, 1.1vw, 11px);
        border-radius: 50%;
        background: rgba(255,255,255,0.22);
        animation: bdot 1.6s ease-in-out infinite;
      }
      .bsod-dot:nth-child(1){animation-delay:0s}
      .bsod-dot:nth-child(2){animation-delay:.16s}
      .bsod-dot:nth-child(3){animation-delay:.32s}
      .bsod-dot:nth-child(4){animation-delay:.48s}
      .bsod-dot:nth-child(5){animation-delay:.64s}
      @keyframes bdot {
        0%,55%,100% { background: rgba(255,255,255,0.22); transform: scale(1); }
        27%          { background: rgba(255,255,255,1);    transform: scale(1.2); }
      }
      .bsod-pct {
        font-size: clamp(13px, 1.7vw, 21px);
        font-weight: 400;
        margin-bottom: clamp(36px, 6.5vw, 85px);
      }
      .bsod-bottom {
        position: absolute;
        bottom: clamp(22px, 4vw, 56px);
        left:   clamp(36px, 7.5vw, 130px);
        right:  clamp(36px, 7.5vw, 130px);
        display: flex; align-items: flex-start; gap: 22px;
      }
      .bsod-qr { flex-shrink: 0; }
      .bsod-stop {
        font-size: clamp(9px, 1vw, 13px);
        line-height: 1.75; opacity: 0.88;
      }
      .bsod-stop u { opacity: 0.7; }
    `;
    document.head.appendChild(crashCSS);
  }

  // ── Sound: hard click + white-noise burst + dying-machine tone ──
  function playGlitchSound() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const t  = ac.currentTime;
      // Hard click pop at t=0
      const clk = ac.createOscillator();
      const cg  = ac.createGain();
      clk.type = 'square'; clk.frequency.value = 90;
      cg.gain.setValueAtTime(0.55, t);
      cg.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      clk.connect(cg); cg.connect(ac.destination);
      clk.start(t); clk.stop(t + 0.035);
      // White-noise burst fading out
      const frames = Math.floor(ac.sampleRate * 0.32);
      const buf = ac.createBuffer(1, frames, ac.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < frames; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / frames);
      const noise = ac.createBufferSource();
      noise.buffer = buf;
      const ng = ac.createGain(); ng.gain.value = 0.20;
      noise.connect(ng); ng.connect(ac.destination); noise.start(t);
      // Descending sawtooth — "dying machine" power-down
      const osc = ac.createOscillator();
      const og  = ac.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.6);
      og.gain.setValueAtTime(0.15, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(og); og.connect(ac.destination);
      osc.start(t); osc.stop(t + 0.6);
    } catch (_) {}
  }

  // ── GPU artifact canvas: random colored corruption tiles ──
  function paintGPUArtifacts(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    // Horizontal screen-tear bands
    const tearColors = ['#ff0044','#00d4ff','#7f00ff','#00ff80','#ff8800','#fff','#ff00ff','#ffff00','#00ffff'];
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = tearColors[i % tearColors.length];
      ctx.globalAlpha = 0.55 + Math.random() * 0.45;
      const w = 8  + Math.random() * 220;
      const h = 1  + Math.random() * 22;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, w, h);
    }
    // Large corrupted blocks (GPU VRAM dump look)
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = tearColors[Math.floor(Math.random() * tearColors.length)];
      ctx.globalAlpha = 0.40 + Math.random() * 0.55;
      const w = 50  + Math.random() * 340;
      const h = 12  + Math.random() * 90;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, w, h);
    }
    // Scattered single pixel noise
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = Math.random();
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
    ctx.globalAlpha = 1;
  }

  // ── Fake QR code SVG ──
  function makeFakeQR() {
    const S = 21, C = 4, W = S * C;
    let r = '';
    function corner(ox, oy) {
      r += `<rect x="${ox}" y="${oy}" width="${7*C}" height="${7*C}" fill="white"/>`;
      r += `<rect x="${ox+C}" y="${oy+C}" width="${5*C}" height="${5*C}" fill="#1a52a1"/>`;
      r += `<rect x="${ox+2*C}" y="${oy+2*C}" width="${3*C}" height="${3*C}" fill="white"/>`;
    }
    corner(0,0); corner((S-7)*C,0); corner(0,(S-7)*C);
    for (let row=0;row<S;row++) for (let col=0;col<S;col++) {
      if ((row<8&&col<8)||(row<8&&col>=S-8)||(row>=S-8&&col<8)) continue;
      if (Math.random()>0.52) r+=`<rect x="${col*C}" y="${row*C}" width="${C}" height="${C}" fill="white"/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}" style="image-rendering:pixelated;display:block">${r}</svg>`;
  }

  function triggerCrash(trigger) {
    const origTitle = document.title;

    // ── PHASE 1 (0–400ms): page corruption — filter glitch + shake ──
    document.body.classList.add('page-dying');
    document.body.style.overflow = 'hidden';
    document.title = '● Not Responding';
    playGlitchSound();

    // Tab title flickers between original and "Not Responding"
    let titleFlip = 0;
    const titleFlicker = setInterval(() => {
      document.title = titleFlip++ % 2 === 0 ? origTitle : '● Not Responding';
    }, 120);

    // ── PHASE 2 (400–1250ms): Chrome "Page Unresponsive" dialog ──
    setTimeout(() => {
      document.body.classList.remove('page-dying');
      document.body.style.transform = '';

      const backdrop = document.createElement('div');
      backdrop.id = 'chrome-backdrop';

      const dlg = document.createElement('div');
      dlg.id = 'chrome-dialog';
      dlg.innerHTML = `
        <div class="cd-titlebar">
          <svg width="18" height="18" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="9" fill="#dadce0"/>
            <path d="M10,4.5 L15.26,7.75 L10,10Z" fill="#ea4335"/>
            <path d="M15.26,7.75 L15.26,12.25 L10,10Z" fill="#fbbc04"/>
            <path d="M15.26,12.25 L4.74,12.25 L10,10Z" fill="#34a853"/>
            <path d="M4.74,12.25 L4.74,7.75 L10,10Z" fill="#4285f4"/>
            <circle cx="10" cy="10" r="3" fill="#fff"/>
          </svg>
          Page Unresponsive
        </div>
        <div class="cd-body">
          The following page has become unresponsive. You can wait for it to become responsive or kill it.
          <div class="cd-page-url">空と海 · Sora &amp; Umi Café &amp; Dining — localhost/index.html</div>
        </div>
        <div class="cd-actions">
          <button class="cd-btn cd-btn-wait">Wait</button>
          <button class="cd-btn cd-btn-kill">Kill page</button>
        </div>
      `;
      dlg.querySelectorAll('.cd-btn').forEach(b => b.addEventListener('click', e => e.preventDefault()));

      document.body.appendChild(backdrop);
      document.body.appendChild(dlg);

      // Dialog holds for 850ms, then collapses into GPU artifact phase
      setTimeout(() => {
        backdrop.remove();
        dlg.style.transition = 'opacity 0.1s, transform 0.1s';
        dlg.style.opacity    = '0';
        dlg.style.transform  = 'translate(-50%,-52%)';
        setTimeout(() => { dlg.remove(); showGPU(); }, 110);
      }, 850);
    }, 400);

    // ── PHASE 3 (1250–1600ms): GPU VRAM corruption ──
    function showGPU() {
      const canvas = document.createElement('canvas');
      canvas.id = 'gpu-canvas';
      document.body.appendChild(canvas);
      paintGPUArtifacts(canvas);

      // Rapidly repaint (flickering corruption)
      let redraws = 0;
      const rdInt = setInterval(() => {
        paintGPUArtifacts(canvas);
        if (++redraws >= 5) clearInterval(rdInt);
      }, 65);

      setTimeout(() => { canvas.remove(); showFlicker(); }, 350);
    }

    // ── PHASE 4 (1600–1800ms): monitor signal loss flicker ──
    function showFlicker() {
      clearInterval(titleFlicker);
      document.title = 'Recovery';

      const flash = document.createElement('div');
      flash.id = 'flash-overlay';
      document.body.appendChild(flash);

      const seq = [1,0,1,0,1,0,1,1,0,1,0,0]; // irregular flicker pattern
      let fi = 0;
      const flk = setInterval(() => {
        flash.style.opacity = seq[fi] === 1 ? '0.95' : '0';
        fi++;
        if (fi >= seq.length) { clearInterval(flk); flash.remove(); showBSOD(); }
      }, 28);
    }

    // ── PHASE 5: Windows 11 BSOD ──
    function showBSOD() {
      const bsod = document.createElement('div');
      bsod.id = 'bsod-overlay';
      bsod.innerHTML = `
        <div class="bsod-winlogo">
          <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
            <rect x="0"  y="0"  width="19" height="19" fill="#f35325"/>
            <rect x="22" y="0"  width="19" height="19" fill="#81bc06"/>
            <rect x="0"  y="22" width="19" height="19" fill="#05a6f0"/>
            <rect x="22" y="22" width="19" height="19" fill="#ffba08"/>
          </svg>
        </div>
        <div class="bsod-sad">:(</div>
        <div class="bsod-main">Your PC ran into a problem and needs to restart. We&#39;re just collecting some error info, and then we&#39;ll restart for you.</div>
        <div class="bsod-spinner">
          <div class="bsod-dot"></div><div class="bsod-dot"></div>
          <div class="bsod-dot"></div><div class="bsod-dot"></div>
          <div class="bsod-dot"></div>
        </div>
        <div class="bsod-pct" id="bsod-pct">0% complete</div>
        <div class="bsod-bottom">
          <div class="bsod-qr">${makeFakeQR()}</div>
          <div class="bsod-stop">
            For more information about this issue and possible fixes,<br>
            visit <u>https://www.windows.com/stopcode</u><br><br>
            If you call a support person, give them this info:<br>
            Stop code: &nbsp;<strong>CRITICAL_PROCESS_DIED</strong><br>
            What failed: <strong>BrowserHost.exe</strong>
          </div>
        </div>
      `;
      document.body.appendChild(bsod);

      // Realistic stalling progress — mirrors real BSOD pauses at ~11%, ~33%, ~67%
      const pctEl  = document.getElementById('bsod-pct');
      const stalls = [{ at: 11, hold: 32 }, { at: 33, hold: 22 }, { at: 67, hold: 16 }];
      let pct = 0, si = 0, stallCount = 0;

      const prog = setInterval(() => {
        const st = stalls[si];
        if (st && pct >= st.at && stallCount < st.hold) { stallCount++; return; }
        if (stallCount > 0) { si++; stallCount = 0; }

        const speed = pct < 14 ? 0.65 : pct < 40 ? 1.2 : pct < 70 ? 0.85 : 2.8;
        pct = Math.min(100, pct + speed * (0.7 + Math.random() * 0.55));
        if (pctEl) pctEl.textContent = Math.floor(pct) + '% complete';

        if (pct >= 100) {
          clearInterval(prog);
          setTimeout(() => {
            bsod.style.transition = 'background 0.06s';
            bsod.style.background = '#fff';
            setTimeout(() => {
              bsod.remove();
              document.title = origTitle;
              openModal(trigger);
            }, 120);
          }, 400);
        }
      }, 90);
    }
  }

  // ── Intercept "Reserve a Table" nav button ─
  // Use capture phase so this fires before the existing smooth-scroll handler
  const navCta = document.querySelector('.nav-cta');
  if (navCta) {
    navCta.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      triggerCrash(navCta);
    }, { capture: true });
  }

  // Also intercept the experience-section "Book" button (also links to #reservation)
  const expBtn = document.querySelector('.exp-content .btn-primary');
  if (expBtn) {
    expBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      triggerCrash(expBtn);
    }, { capture: true });
  }

  // ── Close on × button ─────────────────────
  if (closeBtn) { closeBtn.addEventListener('click', closeModal); }

  // ── Close on backdrop click ────────────────
  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }

  // ── "Protect me now" — demo only ──────────
  if (protectBtn) {
    protectBtn.addEventListener('click', () => {
      demoNote.hidden = false;
      demoNote.focus();
    });
  }

  // ── "Show me the tricks" toggle ────────────
  if (revealBtn) {
    revealBtn.addEventListener('click', () => {
      revealMode = !revealMode;
      box.classList.toggle('reveal-mode', revealMode);
      revealBtn.setAttribute('aria-pressed', String(revealMode));
      explain.hidden = !revealMode;
      revealBtn.innerHTML = revealMode
        ? '&#128269; Hide the tricks'
        : '&#128269; Show me the tricks';
      if (revealMode) {
        explain.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
})();


/* ─────────────────────────────────────────────
   13. SCROLL PROGRESS BAR
   Fills gold → teal → sakura as page scrolls
───────────────────────────────────────────── */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function updateProgress() {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const pct          = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width    = pct + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();
