export function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn__text');
    const btnLoader = submitBtn.querySelector('.btn__loader');
    const successMsg = document.getElementById('form-success');
    const globalError = document.getElementById('form-global-error');

    function showError(input, errorMsgElement, message) {
        if (input) input.setAttribute('aria-invalid', 'true');
        if (errorMsgElement) {
            errorMsgElement.textContent = message;
            errorMsgElement.hidden = false;
        }
    }

    function clearError(input, errorMsgElement) {
        if (input) input.removeAttribute('aria-invalid');
        if (errorMsgElement) {
            errorMsgElement.textContent = '';
            errorMsgElement.hidden = true;
        }
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset states
        let isValid = true;
        globalError.hidden = true;
        
        const nameInput = document.getElementById('full-name');
        const emailInput = document.getElementById('email');
        const companyInput = document.getElementById('company');
        const typeSelect = document.getElementById('project-type');
        const budgetSelect = document.getElementById('budget');
        const msgInput = document.getElementById('message');
        const privacyCheck = document.getElementById('privacy');

        // Validate Name
        if (!nameInput.value.trim()) {
            showError(nameInput, document.getElementById('full-name-error'), 'Name is required.');
            isValid = false;
        } else {
            clearError(nameInput, document.getElementById('full-name-error'));
        }

        // Validate Email
        if (!emailInput.value.trim()) {
             showError(emailInput, document.getElementById('email-error'), 'Email is required.');
             isValid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
             showError(emailInput, document.getElementById('email-error'), 'Please enter a valid email address.');
             isValid = false;
        } else {
             clearError(emailInput, document.getElementById('email-error'));
        }

        // Validate Project Type
        if (!typeSelect.value) {
            showError(typeSelect, document.getElementById('project-type-error'), 'Please select a project type.');
            isValid = false;
        } else {
            clearError(typeSelect, document.getElementById('project-type-error'));
        }

        // Validate Message
        if (!msgInput.value.trim()) {
            showError(msgInput, document.getElementById('message-error'), 'Message is required.');
            isValid = false;
        } else {
            clearError(msgInput, document.getElementById('message-error'));
        }
        
        // Validate Privacy
        if (!privacyCheck.checked) {
            showError(privacyCheck, document.getElementById('privacy-error'), 'You must agree to the privacy policy.');
            isValid = false;
        } else {
             clearError(privacyCheck, document.getElementById('privacy-error'));
        }


        if (isValid) {
            submitBtn.disabled = true;
            btnText.hidden = true;
            btnLoader.hidden = false;

            const fields = {
                full_name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                company: companyInput ? companyInput.value.trim() : '',
                project_type: typeSelect.value,
                budget_range: budgetSelect ? budgetSelect.value : '',
                message: msgInput.value.trim(),
            };

            try {
                const res = await fetch('https://formspree.io/f/your_formspree_id', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(fields),
                });

                if (res.ok) {
                    form.hidden = true;
                    successMsg.hidden = false;
                } else {
                    const data = await res.json().catch(() => ({}));
                    if (data.errors && Array.isArray(data.errors)) {
                        showError(null, globalError, data.errors.map(e => e.message).join(', '));
                    } else {
                        showError(null, globalError, data.error || 'Something went wrong. Please try again.');
                    }
                }
            } catch (err) {
                showError(null, globalError, 'Network error. Please check your connection and try again.');
            } finally {
                submitBtn.disabled = false;
                btnText.hidden = false;
                btnLoader.hidden = true;
            }
        }
    });

    // Clear error on input
    form.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', () => {
             const errorId = el.getAttribute('aria-describedby');
             if(errorId) {
                 clearError(el, document.getElementById(errorId));
             }
        });
    });
}
