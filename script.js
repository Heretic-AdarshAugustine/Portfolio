// 3D tilt effect that follows the cursor — used on the Selected Works
// cards and the hero photo stack, so both share the same tactile feel.
function initTilt(wraps, { targetSelector, maxTilt, imageSelector, maxShift, imageScale, perspective = 800, hoverScale = 1 }) {
  wraps.forEach((wrap) => {
    const target = targetSelector ? wrap.querySelector(targetSelector) : wrap;
    const image = imageSelector ? wrap.querySelector(imageSelector) : null;
    if (!target) return;
    let leaveTimer = null;

    function apply(clientX, clientY) {
      const rect = wrap.getBoundingClientRect();
      const px = (clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const py = (clientY - rect.top - rect.height / 2) / (rect.height / 2);

      const rotateY = px * maxTilt;
      const rotateX = py * -maxTilt;
      target.style.transform = `perspective(${perspective}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${hoverScale})`;

      if (image && maxShift) {
        const shiftX = px * -maxShift;
        const shiftY = py * -maxShift;
        image.style.transform = `scale(${imageScale || 1}) translate(${shiftX}px, ${shiftY}px)`;
      }
    }

    function reset() {
      target.style.transform = '';
      if (image) image.style.transform = '';
    }

    wrap.addEventListener('mousemove', (e) => {
      clearTimeout(leaveTimer);
      apply(e.clientX, e.clientY);
    });
    wrap.addEventListener('mouseenter', () => clearTimeout(leaveTimer));
    wrap.addEventListener('mouseleave', () => {
      leaveTimer = setTimeout(reset, 150);
    });
  });
}

initTilt(document.querySelectorAll('.card-wrap'), {
  targetSelector: '.card',
  maxTilt: 5,
  imageSelector: '.card__image',
  maxShift: 5,
  imageScale: 1.04,
});

initTilt(document.querySelectorAll('.hero-photo-wrap'), {
  maxTilt: 4,
});

initTilt(document.querySelectorAll('.btn'), {
  maxTilt: 16,
  perspective: 450,
  hoverScale: 1.05,
});

// Mobile hamburger menu — expands the nav links as a dropdown below the bar.
const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');
if (navToggle && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
}

// Nav on scroll: a shadow/opacity boost once the page moves off the top,
// plus a Medium-style hide-on-scroll-down / reveal-on-scroll-up so the bar
// gets out of the way while reading and reappears the moment you scroll back.
const nav = document.querySelector('.nav');
if (nav) {
  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateNav = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 8);

    const menuOpen = navLinks && navLinks.classList.contains('is-open');
    if (!menuOpen) {
      const scrollingDown = y > lastScrollY;
      if (scrollingDown && y > 160) {
        nav.classList.add('nav--hidden');
      } else {
        nav.classList.remove('nav--hidden');
      }
    }

    lastScrollY = y;
    ticking = false;
  };

  updateNav();
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });
}

// Scroll-triggered reveal: content fades and rises into place the first
// time it crosses into the viewport, with a light stagger for sibling
// groups (card grids, stat strips, etc.) — the same "fade-up" pattern most
// modern marketing sites use for scroll-driven entrances.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealSelectors = [
    '.hero__title', '.hero__subtitle', '.btn--cta',
    '.works__title', '.card-wrap',
    '.contact__message', '.contact__actions', '.contact__bottom',
    '.about__row', '.timeline__group-title', '.timeline__item',
    '.career-hero__content',
    '.ortus-stats', '.career-stats', '.pp-stats',
    '.research-card', '.feat-card', '.audience-card', '.problem-card',
    '.solution-banner__head', '.solution-banner > p', '.solution-stats__item',
    '.rationale-col', '.rationale-phone', '.impact-banner__lead', '.impact-stat',
    '.career-metric-card', '.career-objective', '.career-approach-card',
    '.career-finding', '.career-quote-row', '.career-opportunity', '.career-outcome',
    '.pp-callout', '.pp-badge', '.pp-methods__col', '.pp-participant-card',
    '.pp-quote-card', '.pp-principle', '.pp-achieve__item', '.pp-survey__block',

    // Section headings and remaining content blocks, so every section on
    // every case-study page animates in on scroll, not just the card grids.
    '.career-eyebrow', '.career-matters__intro', '.career-survey__intro',
    '.career-interview__intro', '.career-opportunities__intro',
    '.career-problem__visual', '.career-problem__text', '.career-compare',
    '.career-focus-banner', '.career-bar-list',

    '.ortus-title', '.ortus-flow', '.solve-mockup', '.ortus-validation',
    '.ortus-overview > h2', '.ortus-overview > p', '.ortus-objective > h2', '.ortus-objective > p',
    '.solve-text > h2', '.solve-text > p', '.solve-heading-row', '.ortus-rationale__head',

    '.pp-heading', '.pp-overview__text', '.pp-overview__illus', '.pp-poster',
    '.pp-journey__step', '.pp-journey__moods', '.pp-journey__block',
    '.pp-intervention__item', '.pp-intervention__mockup', '.pp-question-banner',
    '.pp-closing',
  ];

  const revealEls = document.querySelectorAll(revealSelectors.join(','));
  if (revealEls.length) {
    const staggerCount = new Map();
    revealEls.forEach((el) => {
      el.classList.add('reveal');
      const parent = el.parentElement;
      const index = staggerCount.get(parent) || 0;
      el.style.transitionDelay = `${Math.min(index, 5) * 70}ms`;
      staggerCount.set(parent, index + 1);
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
  }
}
