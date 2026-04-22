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
