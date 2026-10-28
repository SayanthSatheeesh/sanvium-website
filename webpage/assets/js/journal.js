export function initJournal() {
  const container = document.getElementById('articles-container');
  if (!container) return;

  initNewsletter();
}

// Newsletter form handling
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  const emailInput = document.getElementById('newsletter-email');
  const errorMsg = document.getElementById('newsletter-error');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    errorMsg.hidden = true;
    emailInput.removeAttribute('aria-invalid');

    const email = emailInput.value.trim();
    if (!email || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
      errorMsg.textContent = 'Please enter a valid email address.';
      errorMsg.hidden = false;
      emailInput.setAttribute('aria-invalid', 'true');
      return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;

    try {
      const res = await fetch('https://formspree.io/f/your_subscribe_formspree_id', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (res.ok) {
        form.innerHTML = '<p class="newsletter__success" style="color: var(--color-accent); font-weight: 500; font-size: 1.125rem;">Thanks for subscribing! Check your inbox.</p>';
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Subscription failed');
      }
    } catch (err) {
      errorMsg.textContent = err.message || 'Network error. Please try again.';
      errorMsg.hidden = false;
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

