(function () {
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Focus management for Skip Link
  function setupSkipLink() {
    const main = qs('#main-content');
    if (main) {
      main.setAttribute('role', 'main');
      main.setAttribute('tabindex', '-1');
    }
  }

  // Countdown 24h and progress bar update
  function setupCountdown() {
    const timerEl = qs('#countdownTimer');
    const progressEl = qs('#timelineProgress');
    if (!timerEl || !progressEl) return;

    const TOTAL_MS = 24 * 60 * 60 * 1000;
    const start = Date.now();
    let remaining = TOTAL_MS;

    function format(h, m, s) {
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    function tick() {
      const elapsed = Date.now() - start;
      remaining = Math.max(TOTAL_MS - elapsed, 0);
      const hrs = Math.floor(remaining / (1000 * 60 * 60));
      const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((remaining % (1000 * 60)) / 1000);
      timerEl.textContent = format(hrs, mins, secs);
      const progressPct = Math.min(100, Math.round((elapsed / TOTAL_MS) * 100));
      progressEl.style.width = `${progressPct}%`;
      if (remaining === 0) clearInterval(intv);
    }

    tick();
    const intv = setInterval(tick, 1000);
  }

  // Accessible FAQ toggles
  function setupFAQ() {
    qsa('.faq-item').forEach((item, idx) => {
      const btn = qs('.faq-question', item);
      const answer = qs('.faq-answer', item);
      if (!btn || !answer) return;
      const answerId = `faq-answer-${idx}`;
      answer.id = answerId;
      btn.setAttribute('aria-controls', answerId);
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        answer.classList.toggle('open', !expanded);
        if (!expanded) {
          // Move focus into answer for screen readers
          answer.setAttribute('tabindex', '-1');
          answer.focus({ preventScroll: true });
        }
      });
    });
  }

  // Modal controls
  function setupModal() {
    const modal = qs('#confirmationModal');
    const openBtn = qs('#openZaloDirectBtn');
    const closeBtn = qs('.modal-close', modal);
    const cancelBtn = qs('#modalCancelBtn', modal);
    const confirmBtn = qs('#modalConfirmBtn', modal);
    const overlay = qs('.modal-overlay', modal);

    if (!modal || !openBtn || !closeBtn || !cancelBtn || !confirmBtn || !overlay) return;

    function openModal() {
      modal.setAttribute('aria-hidden', 'false');
      // Trap focus
      confirmBtn.focus();
      document.addEventListener('keydown', onKeyDown);
    }
    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', onKeyDown);
      openBtn.focus();
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') closeModal();
    }

    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', () => {
      // Open Zalo in new tab then close modal
      const zaloUrl = openBtn.getAttribute('href');
      if (zaloUrl) window.open(zaloUrl, '_blank', 'noopener,noreferrer');
      closeModal();
    });
  }

  // Populate data from localStorage if present
  function populateFromLocalStorage() {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return;
      const data = JSON.parse(raw);
      const map = {
        customerName: 'customerName',
        monthlyPaymentAmount: 'monthlyPaymentAmount',
        paymentDate: 'paymentDate',
        loanAmountValue: 'loanAmountValue',
        modalLoanAmount: 'modalLoanAmount',
        modalLoanAmount2: 'modalLoanAmount2',
        requiredAmount: 'requiredAmount',
      };
      Object.entries(map).forEach(([key, id]) => {
        if (data[key] != null) {
          const el = document.getElementById(id);
          if (el) el.textContent = String(data[key]);
        }
      });
    } catch (_) {
      // silently ignore
    }
  }

  // Expose closeZaloGuidance for inline handler
  window.closeZaloGuidance = function () {
    const g = qs('#zaloGuidance');
    if (g) g.style.display = 'none';
  };

  document.addEventListener('DOMContentLoaded', () => {
    setupSkipLink();
    setupCountdown();
    setupFAQ();
    setupModal();
    populateFromLocalStorage();

    // Improve font awesome decorative icons accessibility
    qsa('.section-icon i, .security-badge i, .success-icon-main i, .contact-item i').forEach((i) => {
      i.setAttribute('aria-hidden', 'true');
    });

    // Focus main when arriving via skip link
    const skip = qs('.skip-link');
    if (skip) {
      skip.addEventListener('click', () => {
        const main = qs('#main-content');
        if (main) main.focus();
      });
    }
  });
})();
