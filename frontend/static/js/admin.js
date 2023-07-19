const state = {
  adminToken: localStorage.getItem('adminToken') || '',
};

const els = {
  adminLoginPanel: document.querySelector('#adminLoginPanel'),
  adminLoginForm: document.querySelector('#adminLoginForm'),
  adminDashboard: document.querySelector('#adminDashboard'),
  adminItemForm: document.querySelector('#adminItemForm'),
  adminLoadOrdersBtn: document.querySelector('#adminLoadOrdersBtn'),
  adminLoadFeedbackBtn: document.querySelector('#adminLoadFeedbackBtn'),
  adminOrdersList: document.querySelector('#adminOrdersList'),
  adminFeedbackList: document.querySelector('#adminFeedbackList'),
  billOutput: document.querySelector('#billOutput'),
  toast: document.querySelector('#toast'),
};

function money(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove('show'), 3200);
}

function setBusy(button, busy) {
  if (!button) return;
  button.disabled = busy;
}

function updateAdminView() {
  const signedIn = Boolean(state.adminToken);
  els.adminLoginPanel.classList.toggle('hidden', signedIn);
  els.adminDashboard.classList.toggle('hidden', !signedIn);
}

async function adminApi(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.adminToken) {
    headers.Authorization = state.adminToken;
  }

  const response = await fetch(path, { ...options, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const detail = data?.error || data?.detail || Object.values(data || {})[0] || response.statusText;
    throw new Error(Array.isArray(detail) ? detail.join(', ') : detail);
  }

  return data;
}

async function loadOrders() {
  const orders = await adminApi('/api/ad/orders/');
  if (!orders.length) {
    els.adminOrdersList.innerHTML = '<p class="empty">No orders found.</p>';
    return;
  }

  els.adminOrdersList.innerHTML = orders.map((order) => `
    <article class="admin-row">
      <div class="admin-row-main">
        <strong>Order #${order.id}</strong>
        <span>${money(order.total_price)}</span>
      </div>
      <span class="muted">${order.full_name} - ${order.status}</span>
      <button class="secondary" type="button" data-bill="${order.id}">Generate bill</button>
    </article>
  `).join('');
}

async function loadFeedback() {
  const feedback = await adminApi('/api/ad/feedback/');
  if (!feedback.length) {
    els.adminFeedbackList.innerHTML = '<p class="empty">No feedback yet.</p>';
    return;
  }

  els.adminFeedbackList.innerHTML = feedback.map((item) => `
    <article class="admin-row">
      <div class="admin-row-main">
        <strong>${item.name || 'Visitor'}</strong>
        <span>${new Date(item.created_at).toLocaleDateString()}</span>
      </div>
      <span class="muted">${item.email || 'No email'}</span>
      <p>${item.message}</p>
    </article>
  `).join('');
}

els.adminLoginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  setBusy(button, true);
  try {
    const data = await adminApi('/api/ad/login/', {
      method: 'POST',
      body: JSON.stringify(formData(els.adminLoginForm)),
    });
    state.adminToken = data.token;
    localStorage.setItem('adminToken', state.adminToken);
    updateAdminView();
    showToast('Admin signed in.');
  } catch (error) {
    showToast(error.message);
  } finally {
    setBusy(button, false);
  }
});

els.adminItemForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  setBusy(button, true);
  try {
    await adminApi('/api/ad/items/', {
      method: 'POST',
      body: JSON.stringify(formData(els.adminItemForm)),
    });
    els.adminItemForm.reset();
    els.adminItemForm.status.value = 'active';
    showToast('Product added.');
  } catch (error) {
    showToast(error.message);
  } finally {
    setBusy(button, false);
  }
});

els.adminLoadOrdersBtn.addEventListener('click', () => loadOrders().catch((error) => showToast(error.message)));
els.adminLoadFeedbackBtn.addEventListener('click', () => loadFeedback().catch((error) => showToast(error.message)));

els.adminOrdersList.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-bill]');
  if (!button) return;

  try {
    const bill = await adminApi(`/api/ad/orders/${button.dataset.bill}/bill/`);
    els.billOutput.textContent = JSON.stringify(bill, null, 2);
    showToast('Bill generated.');
  } catch (error) {
    showToast(error.message);
  }
});

updateAdminView();
