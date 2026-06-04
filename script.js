/**
 * LA SIEGA — script.js v2 (Experiencia inmersiva)
 * Parallax multicapa · Scroll reveal · Elementos flotantes · Animaciones
 * JavaScript vanilla, sin dependencias. ES6+.
 */

/* ================================================================
   ESTADO GLOBAL
   ================================================================ */
const S = {
  menuOpen: false,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  isMobile: window.innerWidth <= 768,
  scrollY: 0,
  rafId: null,
};

/* ================================================================
   INICIALIZACIÓN
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initHeroLetters();
  initScrollObserver();
  initManifestoLines();
  initTrajeBatalla();
  initCustomCursor();
  initParallax();
  initFloatingElements();
  initProgramFilter();
  initMobileStickyBtn();
  initSmoothScroll();
  initCTARotation();
  initMapTooltips();
  initBuyButtons();

  // Bucle principal de animación (parallax + flotantes)
  if (!S.reducedMotion) startAnimationLoop();
});

/* ================================================================
   1. NAVBAR — transparente → sticky Ivory al hacer scroll
   ================================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Sentinel invisible al final del hero
  const hero = document.getElementById('inicio');
  if (!hero) return;
  hero.style.position = 'relative';
  const sentinel = Object.assign(document.createElement('div'), {
    style: 'position:absolute;bottom:0;left:0;width:1px;height:1px;pointer-events:none;'
  });
  hero.appendChild(sentinel);

  new IntersectionObserver(([e]) => {
    navbar.classList.toggle('scrolled', !e.isIntersecting);
  }, { threshold: 0 }).observe(sentinel);
}

/* ================================================================
   2. MENÚ MOBILE — despliega desde arriba
   ================================================================ */
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const closeBtn = document.getElementById('menuClose');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;

  const links = menu.querySelectorAll('.mobile-nav-link, .mobile-menu-cta');

  const open = () => {
    S.menuOpen = true;
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    S.menuOpen = false;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => S.menuOpen ? close() : open());
  closeBtn?.addEventListener('click', close);
  links.forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => e.key === 'Escape' && S.menuOpen && close());
}

/* ================================================================
   3. ANIMACIÓN DE LETRAS DEL HERO
   Cada letra aparece con delay escalonado, efecto "persiana lateral"
   ================================================================ */
function initHeroLetters() {
  const chars = document.querySelectorAll('.ht-char');
  if (!chars.length) return;

  // Si reducedMotion, muéstralas todas de golpe
  if (S.reducedMotion) {
    chars.forEach(c => c.classList.add('char-visible'));
    return;
  }

  let delay = 550; // ms de espera inicial
  chars.forEach(char => {
    setTimeout(() => char.classList.add('char-visible'), delay);
    delay += char.classList.contains('ht-space') ? 0 : 80;
  });
}

/* ================================================================
   4. SCROLL OBSERVER — activa .visible en todos los elementos reveal
   Unifica reveal-up, reveal-fade, reveal-blind en un solo observer.
   ================================================================ */
function initScrollObserver() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-blind')
    .forEach(el => obs.observe(el));
}

/* ================================================================
   5. MANIFIESTO — líneas que aparecen de forma escalonada
   Cada línea tiene data-manifesto-delay que determina el orden.
   Se activan cuando la sección entra en viewport.
   ================================================================ */
function initManifestoLines() {
  const section = document.getElementById('manifesto');
  const lines = section?.querySelectorAll('.manifesto-line');
  if (!section || !lines.length) return;

  // Si reducedMotion, visible inmediatamente
  if (S.reducedMotion) {
    lines.forEach(l => l.classList.add('line-visible'));
    return;
  }

  let triggered = false;
  const STAGGER = 320; // ms entre cada línea

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !triggered) {
      triggered = true;
      lines.forEach(line => {
        const order = parseInt(line.dataset.manifestoDelay || '0', 10);
        setTimeout(() => line.classList.add('line-visible'), order * STAGGER + 150);
      });
    }
  }, { threshold: 0.25 }).observe(section);
}

/* ================================================================
   6. TRAJE DE BATALLA — palabras que "aterrizan"
   ================================================================ */
function initTrajeBatalla() {
  const section = document.getElementById('traje');
  const word1 = document.getElementById('traje-word-1');
  const word2 = document.getElementById('traje-word-2');
  if (!section) return;

  if (S.reducedMotion) {
    word1?.classList.add('traje-visible');
    word2?.classList.add('traje-visible');
    return;
  }

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      word1?.classList.add('traje-visible');
      word2?.classList.add('traje-visible');
    }
  }, { threshold: 0.2 }).observe(section);
}

/* ================================================================
   7. CURSOR AMBER — activo en toda la página (desktop con ratón)
   ================================================================ */
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  if (!cursor || !window.matchMedia('(hover:hover)').matches) return;

  // Activa el cursor globalmente
  cursor.classList.add('active');
  document.body.classList.add('cursor-active');

  // Seguimiento del puntero sin lag (sin transition en left/top)
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  // Efecto de click: escala
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1.6)';
  });
  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
  });

  // Expansión a anillo en elementos interactivos
  const interactives = document.querySelectorAll(
    'a, button, .que-es-card, .entrada-card, .quote-card, ' +
    '.section-logo-wrap, .hero-title-svg, .filter-btn, ' +
    '.manifesto-main, .cta-title, .section-title-md, .traje-word'
  );
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
  });

  // Ocultar cursor al salir de la ventana, mostrar al volver
  document.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  document.addEventListener('mouseenter', () => cursor.classList.add('active'));
}

/* ================================================================
   8. PARALLAX — sistema multicapa
   Cada elemento con data-parallax tiene un factor de velocidad.
   El bucle RAF actualiza translateY según scrollY * factor.
   ================================================================ */

// Registra todos los elementos parallax al iniciar
const parallaxEls = [];

function initParallax() {
  if (S.reducedMotion || S.isMobile) return;

  // Hero background (más lento, da sensación de profundidad)
  const heroBg = document.getElementById('heroBg');
  if (heroBg) {
    parallaxEls.push({ el: heroBg, speed: 0.4, baseY: 0, type: 'bg' });
  }

  // Espigas dentro del hero
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax || '0.2');
    parallaxEls.push({ el, speed, baseY: 0, type: 'inner' });
  });

  // Imagen del territorio (efecto sutil)
  const terrImg = document.getElementById('territorioImg');
  if (terrImg) {
    parallaxEls.push({ el: terrImg, speed: 0.12, baseY: 0, type: 'section' });
  }
}

/* ================================================================
   9. ELEMENTOS FLOTANTES — parallax de los SVGs decorativos
   Los elementos con data-speed se mueven a distinta velocidad.
   ================================================================ */
const floatEls = [];

function initFloatingElements() {
  if (S.reducedMotion || S.isMobile) return;

  // Activa la animación CSS de flotación continua
  document.querySelectorAll('[data-float="true"]').forEach(el => {
    el.classList.add('float-active');
  });

  // Registra los flotantes para el parallax de scroll
  document.querySelectorAll('[data-speed]').forEach(el => {
    floatEls.push({
      el,
      speed: parseFloat(el.dataset.speed || '0.1'),
    });
  });
}

/* ================================================================
   10. BUCLE PRINCIPAL DE ANIMACIÓN (RAF)
   Actualiza parallax y flotantes en cada frame.
   Se ejecuta solo si no hay prefers-reduced-motion.
   ================================================================ */
function startAnimationLoop() {
  const tick = () => {
    S.scrollY = window.scrollY;
    updateParallax();
    updateFloats();
    S.rafId = requestAnimationFrame(tick);
  };
  S.rafId = requestAnimationFrame(tick);
}

function updateParallax() {
  parallaxEls.forEach(({ el, speed, type }) => {
    const rect = el.closest('.scene-hero, .scene-territorio, section')?.getBoundingClientRect();
    const offset = S.scrollY * speed;

    if (type === 'bg') {
      // El fondo del hero se mueve más lento que el scroll
      el.style.transform = `translateY(${offset}px)`;
    } else if (type === 'inner') {
      // Elementos dentro del hero: se mueven proporcionalmente
      el.style.transform = `translateY(${S.scrollY * speed}px)`;
    } else {
      // Elementos en otras secciones: parallax relativo a posición
      if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        el.style.transform = `translateY(${(progress - 0.5) * speed * 100}px)`;
      }
    }
  });
}

function updateFloats() {
  floatEls.forEach(({ el, speed }) => {
    // Cada flotante se desplaza verticalmente según su speed
    const y = S.scrollY * speed;
    // El desplazamiento se AÑADE al movimiento de flotación CSS
    // usamos una variable CSS personalizada que la animación puede leer
    el.style.setProperty('--scroll-offset', `${y}px`);
    // Actualizamos directamente el translateY de scroll (la flotación CSS se mantiene separada)
    el.style.marginTop = `-${y}px`;
  });
}

/* ================================================================
   11. FILTRO DE PROGRAMACIÓN
   ================================================================ */
function initProgramFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.prog-item');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      items.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        if (match) {
          item.classList.remove('hidden');
          item.style.opacity = '0';
          requestAnimationFrame(() => {
            item.style.transition = 'opacity 0.25s';
            item.style.opacity = '1';
          });
        } else {
          item.style.transition = 'opacity 0.18s';
          item.style.opacity = '0';
          setTimeout(() => {
            item.classList.add('hidden');
            item.style.opacity = '';
            item.style.transition = '';
          }, 180);
        }
      });

      // Atenúa cabecera del día si no tiene ítems visibles
      document.querySelectorAll('.prog-day').forEach(day => {
        const anyVisible = [...day.querySelectorAll('.prog-item')]
          .some(i => filter === 'all' || i.dataset.category === filter);
        const lbl = day.querySelector('.prog-day-label');
        if (lbl) lbl.style.opacity = anyVisible ? '1' : '0.25';
      });
    });
  });
}

/* ================================================================
   12. BOTÓN STICKY MOBILE
   ================================================================ */
function initMobileStickyBtn() {
  const btn = document.getElementById('mobileStickyBtn');
  const hero = document.getElementById('inicio');
  const cta = document.getElementById('entradas');
  if (!btn || !hero) return;

  new IntersectionObserver(([e]) => {
    btn.classList.toggle('show', !e.isIntersecting);
  }, { threshold: 0.1 }).observe(hero);

  if (cta) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) btn.classList.remove('show');
    }, { threshold: 0.3 }).observe(cta);
  }
}

/* ================================================================
   13. SCROLL SUAVE PARA ANCLAS INTERNAS
   ================================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = (document.getElementById('navbar')?.offsetHeight || 64);
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });
}

/* ================================================================
   14. ROTACIÓN LENTA DEL NÚMERO DE FONDO EN CTA
   ================================================================ */
function initCTARotation() {
  if (S.reducedMotion) return;

  const bgText = document.getElementById('ctaBgText');
  const section = document.getElementById('entradas');
  if (!bgText || !section) return;

  let angle = 0, active = false, raf;

  const spin = () => {
    angle += 0.012;
    bgText.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    raf = requestAnimationFrame(spin);
  };

  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !active) { active = true; spin(); }
    else if (!e.isIntersecting && active) { active = false; cancelAnimationFrame(raf); }
  }, { threshold: 0.1 }).observe(section);
}

/* ================================================================
   15. TOOLTIPS INTERACTIVOS EN EL MAPA SVG
   ================================================================ */
function initMapTooltips() {
  const svg = document.querySelector('.mapa-svg');
  if (!svg) return;

  const tooltip = Object.assign(document.createElement('div'), {
    style: `
      position:fixed; background:#2D2D2E; color:#FFF4DF;
      padding:7px 11px; border-radius:2px;
      font-family:'DM Sans',sans-serif; font-size:12px; line-height:1.4;
      pointer-events:none; opacity:0; transition:opacity 0.2s;
      z-index:1000; max-width:160px;
    `
  });
  document.body.appendChild(tooltip);

  const spots = [
    { sel: 'rect[fill="#FFCC07"]', label: 'Escenario principal', desc: 'La era · Conciertos' },
    { sel: 'circle[fill="none"]',  label: 'Bares de la plaza',    desc: 'Punto de encuentro' },
    { sel: 'circle[fill="#C3CC24"]', label: 'Acceso principal',   desc: 'Entrada al recinto' },
    { sel: 'rect[fill="#B1C8E7"]', label: 'Parking',              desc: 'Acceso libre' },
  ];

  spots.forEach(({ sel, label, desc }) => {
    const el = svg.querySelector(sel);
    if (!el) return;
    el.style.cursor = 'pointer';

    el.addEventListener('mouseenter', () => {
      tooltip.innerHTML = `<strong>${label}</strong><br><span style="opacity:0.6">${desc}</span>`;
      tooltip.style.opacity = '1';
      el.style.opacity = '0.7';
    });
    el.addEventListener('mousemove', e => {
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top  = (e.clientY - 8)  + 'px';
    });
    el.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
      el.style.opacity = '1';
    });
  });
}

/* ================================================================
   16. FEEDBACK BOTONES DE COMPRA (si href="#" → "Próximamente")
   ================================================================ */
function initBuyButtons() {
  document.querySelectorAll('.entrada-card .btn-dark').forEach(btn => {
    btn.addEventListener('click', e => {
      if (btn.getAttribute('href') === '#') {
        e.preventDefault();
        const orig = btn.innerHTML;
        btn.textContent = 'Próximamente';
        btn.style.opacity = '0.65';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.opacity = '';
        }, 2200);
      }
    });
  });
}

/* ================================================================
   17. RESIZE — actualiza flags y cierra menú si pasa a desktop
   ================================================================ */
window.addEventListener('resize', debounce(() => {
  S.isMobile = window.innerWidth <= 768;
  if (window.innerWidth > 1024 && S.menuOpen) {
    document.getElementById('mobileMenu')?.classList.remove('open');
    document.body.style.overflow = '';
    S.menuOpen = false;
  }
}, 250));

/* ================================================================
   UTILIDAD: debounce
   ================================================================ */
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
