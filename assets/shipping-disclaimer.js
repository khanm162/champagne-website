/*
 * Champagne de Lossy — checkout shipping disclaimer
 * Intercepts the cart's checkout button (cart page + cart drawer) and asks
 * the customer to acknowledge the special-shipping contact note before
 * proceeding to Shopify checkout.
 */
(function () {
  'use strict';

  var CHECKOUT_SELECTOR = '#checkout, [name="checkout"]';
  var modal = document.getElementById('cdl-shipping-disclaimer');
  if (!modal) return;

  var pendingButton = null;
  var lastFocused = null;

  function openModal(triggerButton) {
    pendingButton = triggerButton;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    var confirmBtn = modal.querySelector('[data-cdl-continue]');
    if (confirmBtn) confirmBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    pendingButton = null;
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function proceed() {
    var btn = pendingButton;
    modal.hidden = true;
    document.body.style.overflow = '';
    pendingButton = null;
    if (!btn) return;
    // Mark as acknowledged so the next click passes straight through.
    btn.dataset.cdlAcknowledged = 'true';
    if (btn.form && typeof btn.form.requestSubmit === 'function') {
      btn.form.requestSubmit(btn);
    } else {
      btn.click();
    }
  }

  // Capture phase so we intercept before the form submits.
  document.addEventListener(
    'click',
    function (event) {
      var btn = event.target.closest ? event.target.closest(CHECKOUT_SELECTOR) : null;
      if (!btn) return;
      if (btn.dataset.cdlAcknowledged === 'true') {
        delete btn.dataset.cdlAcknowledged;
        return; // allow the real checkout
      }
      event.preventDefault();
      event.stopPropagation();
      openModal(btn);
    },
    true
  );

  modal.addEventListener('click', function (event) {
    if (event.target.closest('[data-cdl-continue]')) {
      proceed();
    } else if (event.target.closest('[data-cdl-close]')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) closeModal();
  });
})();
