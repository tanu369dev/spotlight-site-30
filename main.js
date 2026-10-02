// ============================================================
// SPOTLIGHT — main.js
// Mobile nav toggle, cursor-follow hero glow, scroll reveal,
// contact form (front-end stub), footer year.
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMobile.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMobile.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Hero cursor-follow spotlight glow
  var hero = document.getElementById('top');
  var heroGlow = document.getElementById('heroGlow');
  if (hero && heroGlow) {
    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      heroGlow.style.left = (e.clientX - rect.left) + 'px';
      heroGlow.style.top = (e.clientY - rect.top) + 'px';
    });
  }

  // Scroll reveal via IntersectionObserver (robust, works in every modern browser)
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: no JS animation support — just show everything
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  // Futuristic motion graphic — drifting constellation network in the hero
  // Respects prefers-reduced-motion: static/off entirely for users who asked for less motion.
  var canvas = document.getElementById('heroCanvas');
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canvas && !prefersReducedMotion) {
    var ctx = canvas.getContext('2d');
    var heroSection = document.getElementById('top');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, nodes = [], rafId = null, running = true;
    var PALETTE = ['rgba(189,144,60,0.55)', 'rgba(173,140,238,0.5)', 'rgba(95,208,160,0.5)', 'rgba(242,166,184,0.55)'];
    var NODE_COUNT = 46;
    var LINK_DIST = 150;

    function resize() {
      var rect = heroSection.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      nodes = [];
      for (var i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: 1.1 + Math.random() * 1.6,
          color: PALETTE[i % PALETTE.length]
        });
      }
    }

    function step() {
      if (!running) { rafId = null; return; }
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      // Links between nearby nodes
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.globalAlpha = (1 - dist / LINK_DIST) * 0.35;
            ctx.strokeStyle = 'rgba(35,30,44,0.5)';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      ctx.globalAlpha = 1;
      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        ctx.beginPath();
        ctx.fillStyle = node.color;
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(step);
    }

    resize();
    seed();
    rafId = requestAnimationFrame(step);

    window.addEventListener('resize', function () {
      resize();
      seed();
    });

    // Pause when the hero is off-screen or the tab is hidden — saves battery/CPU
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          running = entry.isIntersecting && !document.hidden;
          if (running && !rafId) rafId = requestAnimationFrame(step);
        });
      }, { threshold: 0.05 }).observe(heroSection);
    }
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running && !rafId) rafId = requestAnimationFrame(step);
    });
  }

  // Contact form — validation, honeypot + time-trap spam protection, front-end stub
  var formLoadedAt = Date.now();
  var MIN_FILL_SECONDS = 3; // humans rarely fill a form in under 3s — bots often do

  function setFieldError(input, errorId, show) {
    var field = input.closest('.form-field');
    var err = document.getElementById(errorId);
    if (!field) return;
    field.classList.toggle('has-error', !!show);
    if (err && show) err.textContent = err.textContent; // keep existing message
  }

  function validateContactForm(form) {
    var valid = true;
    var name = form.querySelector('#name');
    var email = form.querySelector('#email');
    var message = form.querySelector('#message');

    if (!name.value.trim() || name.value.trim().length < 2) {
      setFieldError(name, 'nameError', true); valid = false;
    } else { setFieldError(name, 'nameError', false); }

    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!emailOk) { setFieldError(email, 'emailError', true); valid = false; }
    else { setFieldError(email, 'emailError', false); }

    if (!message.value.trim() || message.value.trim().length < 10) {
      setFieldError(message, 'messageError', true); valid = false;
    } else { setFieldError(message, 'messageError', false); }

    return valid;
  }

  window.handleContactSubmit = function (event) {
    event.preventDefault();
    var form = event.target;

    // Validate first, always — a real visitor should never click submit and see nothing happen.
    if (!validateContactForm(form)) {
      return false;
    }

    var button = form.querySelector('button[type="submit"]');
    var originalLabel = button.innerHTML;

    // Honeypot — a real visitor never fills this hidden field.
    var honeypot = form.querySelector('#website');
    var isHoneypotTripped = honeypot && honeypot.value.trim() !== '';

    // Time-trap — implausibly fast fill-and-submit is a weak bot signal (not used alone;
    // legitimate autofill can be this fast too, so it only ever "soft fails" below, never errors).
    var elapsedSeconds = (Date.now() - formLoadedAt) / 1000;
    var isTooFast = elapsedSeconds < MIN_FILL_SECONDS;

    var looksLikeSpam = isHoneypotTripped || isTooFast;

    // Either way the visitor sees a normal confirmation — spam just never reaches a real
    // endpoint once one is wired up (guard the fetch() call below on !looksLikeSpam).
    button.innerHTML = 'Sent — thank you!';
    button.disabled = true;
    if (!looksLikeSpam) {
      // TODO: replace with a fetch() call to your email/CRM endpoint, e.g.:
      // fetch('/api/contact', { method: 'POST', body: new FormData(form) });
    }
    setTimeout(function () {
      form.reset();
      button.innerHTML = originalLabel;
      button.disabled = false;
    }, 3000);
    return false;
  };

  // Live-clear field errors as the person types
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.querySelectorAll('input, textarea').forEach(function (el) {
      el.addEventListener('input', function () {
        el.closest('.form-field').classList.remove('has-error');
      });
    });
  }

  // Cookie consent banner — essential cookies always run; analytics/marketing only after consent
  var cookieBanner = document.getElementById('cookieBanner');
  var cookieAccept = document.getElementById('cookieAccept');
  var cookieDecline = document.getElementById('cookieDecline');
  var cookieSettingsBtn = document.getElementById('cookieSettingsBtn');
  var CONSENT_KEY = 'spotlight_cookie_consent'; // 'accepted' | 'declined'

  function loadAnalytics() {
    // Called only once analytics/marketing cookies are accepted.
    // Flip on your real GA4 / Meta Pixel snippet from the <head> placeholder here,
    // or dynamically inject the <script> tags at this point.
  }

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* storage unavailable — banner will just reappear */ }
  }

  function showCookieBanner() {
    if (cookieBanner) {
      requestAnimationFrame(function () { cookieBanner.classList.add('show'); });
    }
  }
  function hideCookieBanner() {
    if (cookieBanner) cookieBanner.classList.remove('show');
  }

  var existingConsent = getConsent();
  if (existingConsent === 'accepted') {
    loadAnalytics();
  } else if (!existingConsent) {
    showCookieBanner();
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', function () {
      setConsent('accepted');
      hideCookieBanner();
      loadAnalytics();
    });
  }
  if (cookieDecline) {
    cookieDecline.addEventListener('click', function () {
      setConsent('declined');
      hideCookieBanner();
    });
  }
  if (cookieSettingsBtn) {
    cookieSettingsBtn.addEventListener('click', function (e) {
      e.preventDefault();
      showCookieBanner();
    });
  }

});
