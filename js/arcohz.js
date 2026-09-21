/* Arcohz — small progressive enhancements (no dependencies).
   - mobile navigation (aria-expanded, Esc to close, closes on link click or
     when focus leaves the header)
   - header style once the page has scrolled
   - WhatsApp button appears once the visitor has scrolled past most of the hero
   - gentle scroll reveals (skipped when reduced motion is preferred)
   The <head> adds the .js class before first paint; it is removed again if
   this file fails to load, so the no-JS layout takes over. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('site-nav');
  var whatsapp = document.querySelector('[data-whatsapp-float]');
  var hero = document.querySelector('.hero, .legal-hero');

  /* ---- Scroll-driven state: header style + WhatsApp button ----------- */
  var ticking = false;
  var syncScroll = function () {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (whatsapp) {
      var threshold = hero ? hero.offsetHeight * 0.6 : 0;
      whatsapp.classList.toggle('is-visible', y > threshold);
    }
    ticking = false;
  };
  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(syncScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', syncScroll, { passive: true });
  syncScroll();

  /* ---- Mobile navigation ----------------------------------------------- */
  if (header && toggle && nav) {
    var setOpen = function (open, returnFocus) {
      header.classList.toggle('is-open', open);
      root.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (!open && returnFocus) toggle.focus();
    };

    var isOpen = function () {
      return header.classList.contains('is-open');
    };

    toggle.addEventListener('click', function () {
      setOpen(!isOpen());
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false, true);
      }
    });

    document.addEventListener('click', function (event) {
      if (isOpen() && !header.contains(event.target)) {
        setOpen(false);
      }
    });

    // Tabbing out of the header (past the menu) closes the menu
    header.addEventListener('focusout', function (event) {
      if (isOpen() && event.relatedTarget && !header.contains(event.relatedTarget)) {
        setOpen(false);
      }
    });

    var desktop = window.matchMedia('(min-width: 900px)');
    var onBreakpoint = function (mq) {
      if (mq.matches) setOpen(false);
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
    else if (desktop.addListener) desktop.addListener(onBreakpoint);
  }

  /* ---- Scroll reveals ---------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reveals.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  // Stagger siblings inside [data-stagger] groups (capped so nothing lags).
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    group.querySelectorAll('.reveal').forEach(function (el, i) {
      el.style.setProperty('--reveal-delay', Math.min(i * 70, 350) + 'ms');
    });
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  reveals.forEach(function (el) { observer.observe(el); });
})();
