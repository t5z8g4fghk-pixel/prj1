(() => {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav
  const menuBtn = document.querySelector('[data-menu-btn]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuBtn && mobilePanel) {
    menuBtn.addEventListener('click', () => {
      const open = mobilePanel.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  // Reveal on scroll (subtle)
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
  }

  // Contact form validation (client-side)
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const status = form.querySelector('[data-form-status]');

    const setError = (fieldEl, message) => {
      const err = fieldEl.closest('.field')?.querySelector('.error');
      if (err) err.textContent = message || '';
      fieldEl.setAttribute('aria-invalid', message ? 'true' : 'false');
    };

    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const company = form.querySelector('#company');
      const budget = form.querySelector('#budget');
      const message = form.querySelector('#message');
      const interests = Array.from(form.querySelectorAll('input[name="interest"]:checked'));

      let ok = true;

      // Reset
      [name,email,company,budget,message].forEach(el => el && setError(el, ''));

      if (!name.value.trim() || name.value.trim().length < 2) { setError(name, 'Please enter your name.'); ok = false; }
      if (!emailOk(email.value)) { setError(email, 'Please enter a valid email address.'); ok = false; }
      if (!company.value.trim() || company.value.trim().length < 2) { setError(company, 'Please enter your company name.'); ok = false; }
      if (!budget.value) { setError(budget, 'Please select a budget range.'); ok = false; }
      if (!message.value.trim() || message.value.trim().length < 20) { setError(message, 'Please share a bit more detail (at least 20 characters).'); ok = false; }

      const interestError = form.querySelector('[data-interest-error]');
      if (interestError) interestError.textContent = '';
      if (interests.length === 0) {
        if (interestError) interestError.textContent = 'Please select at least one service interest.';
        ok = false;
      }

      if (!ok) {
        if (status) {
          status.textContent = 'Please review the highlighted fields and try again.';
          status.setAttribute('role', 'alert');
        }
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // “Production-ready” behavior without backend:
      // - Generates a mailto link with encoded payload as a safe default.
      // - Replace with a real endpoint when available.
      const payload = {
        name: name.value.trim(),
        email: email.value.trim(),
        company: company.value.trim(),
        budget: budget.value,
        interests: interests.map(i => i.value).join(', '),
        message: message.value.trim()
      };

      const subject = encodeURIComponent(`Brivity Inquiry — ${payload.company}`);
      const body = encodeURIComponent(
`Name: ${payload.name}
Email: ${payload.email}
Company: ${payload.company}
Budget: ${payload.budget}
Interests: ${payload.interests}

Message:
${payload.message}`
      );

      // Update status
      if (status) {
        status.innerHTML = `Thanks — your message is ready to send. <a href="mailto:hello@brivity.studio?subject=${subject}&body=${body}">Click here to email Brivity</a>.`;
        status.setAttribute('role', 'status');
      }

      form.reset();
    });
  }
})();
