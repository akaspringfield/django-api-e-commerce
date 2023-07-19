const state = {
  token: localStorage.getItem('ecomToken') || '',
  adminToken: localStorage.getItem('adminToken') || '',
  user: localStorage.getItem('ecomUser') || '',
  items: [],
  search: '',
  category: 'all',
  sort: 'featured',
  cart: [],
  orders: [],
};

const els = {
  sessionLabel: document.querySelector('#sessionLabel'),
  signOutBtn: document.querySelector('#signOutBtn'),
  openAuthBtn: document.querySelector('#openAuthBtn'),
  openFeedbackBtn: document.querySelector('#openFeedbackBtn'),
  openCartBtn: document.querySelector('#openCartBtn'),
  openOrdersBtn: document.querySelector('#openOrdersBtn'),
  authModal: document.querySelector('#authModal'),
  cartDrawer: document.querySelector('#cartDrawer'),
  ordersDrawer: document.querySelector('#ordersDrawer'),
  feedbackModal: document.querySelector('#feedbackModal'),
  feedbackForm: document.querySelector('#feedbackForm'),
  signinTab: document.querySelector('#signinTab'),
  signupTab: document.querySelector('#signupTab'),
  signinForm: document.querySelector('#signinForm'),
  signupForm: document.querySelector('#signupForm'),
  itemsGrid: document.querySelector('#itemsGrid'),
  resultCount: document.querySelector('#resultCount'),
  cartList: document.querySelector('#cartList'),
  cartCount: document.querySelector('#cartCount'),
  paymentTotal: document.querySelector('#paymentTotal'),
  ordersList: document.querySelector('#ordersList'),
  cartTotal: document.querySelector('#cartTotal'),
  checkoutForm: document.querySelector('#checkoutForm'),
  toast: document.querySelector('#toast'),
  refreshItemsBtn: document.querySelector('#refreshItemsBtn'),
  refreshCartBtn: document.querySelector('#refreshCartBtn'),
  refreshOrdersBtn: document.querySelector('#refreshOrdersBtn'),
  itemSearch: document.querySelector('#itemSearch'),
  sortSelect: document.querySelector('#sortSelect'),
};

function money(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
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

function openLayer(element) {
  element.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLayer(element) {
  element.classList.add('hidden');
  if ([els.authModal, els.cartDrawer, els.ordersDrawer, els.feedbackModal].every((layer) => layer.classList.contains('hidden'))) {
    document.body.style.overflow = '';
  }
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = state.token;
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


function updateSession() {
  els.sessionLabel.textContent = state.token ? `Signed in${state.user ? ` as ${state.user}` : ''}` : 'Guest';
  els.openAuthBtn.hidden = Boolean(state.token);
  els.signOutBtn.hidden = !state.token;
}


function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function inferCategory(item) {
  const text = `${item.name} ${item.description || ''}`.toLowerCase();
  if (/(shoe|sneaker|boot|sandal|slipper|footwear)/.test(text)) return 'footwear';
  if (/(bag|backpack|tote|duffle|sling)/.test(text)) return 'bags';
  if (/(wallet|cap|watch|belt|accessor)/.test(text)) return 'accessories';
  if (/(shirt|tee|tshirt|dress|jean|pant|hoodie|jacket|kurta|clothing)/.test(text)) return 'clothing';
  return 'bags';
}

function getVisibleItems() {
  const term = state.search.trim().toLowerCase();
  const visible = state.items.filter((item) => {
    const matchesSearch = !term || `${item.name} ${item.description || ''}`.toLowerCase().includes(term);
    const matchesCategory = state.category === 'all' || inferCategory(item) === state.category;
    return matchesSearch && matchesCategory;
  });

  return visible.sort((a, b) => {
    if (state.sort === 'low') return Number(a.price) - Number(b.price);
    if (state.sort === 'high') return Number(b.price) - Number(a.price);
    if (state.sort === 'new') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    return 0;
  });
}

function setActiveButtons(selector, value, attribute) {
  document.querySelectorAll(selector).forEach((button) => {
    button.classList.toggle('active', button.dataset[attribute] === value);
  });
}

function setCategory(category) {
  state.category = category;
  setActiveButtons('[data-category]', category, 'category');
  renderItems();
}

function setSort(sort) {
  state.sort = sort;
  setActiveButtons('[data-sort]', sort, 'sort');
  if (els.sortSelect) {
    els.sortSelect.value = sort;
  }
  renderItems();
}

function setAuthMode(mode) {
  const isSignin = mode === 'signin';
  els.signinForm.classList.toggle('hidden', !isSignin);
  els.signupForm.classList.toggle('hidden', isSignin);
  els.signinTab.classList.toggle('active', isSignin);
  els.signupTab.classList.toggle('active', !isSignin);
}

function renderItems() {
  const visibleItems = getVisibleItems();
  els.resultCount.textContent = `${visibleItems.length} product${visibleItems.length === 1 ? '' : 's'} found`;

  if (!visibleItems.length) {
    els.itemsGrid.innerHTML = '<p class="empty">No products found in this view. Try another category or search term.</p>';
    return;
  }

  els.itemsGrid.innerHTML = visibleItems.map((item) => `
    <article class="item-card">
      ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
      <div class="item-body">
        <div class="item-title">
          <span>${item.name}</span>
          <span class="price">${money(item.price)}</span>
        </div>
        <p class="description">${item.description || 'No description available.'}</p>
        <div class="quantity-row">
          <label>Qty
            <input id="qty-${item.id}" type="number" min="1" value="1">
          </label>
          <button class="primary" type="button" data-add="${item.id}">Add to bag</button>
        </div>
      </div>
    </article>
  `).join('');
}

function renderCart() {
  const totalItems = state.cart.reduce((count, row) => count + Number(row.quantity || 0), 0);
  els.cartCount.textContent = totalItems;

  if (!state.token) {
    els.cartList.innerHTML = '<p class="empty">Sign in to use the bag.</p>';
    els.cartTotal.textContent = money(0);
    els.paymentTotal.textContent = money(0);
    return;
  }

  if (!state.cart.length) {
    els.cartList.innerHTML = '<p class="empty">Your bag is empty.</p>';
    els.cartTotal.textContent = money(0);
    els.paymentTotal.textContent = money(0);
    return;
  }

  let total = 0;
  els.cartList.innerHTML = state.cart.map((row) => {
    const lineTotal = Number(row.item_price) * Number(row.quantity);
    total += lineTotal;
    return `
      <article class="cart-row">
        <div class="cart-main">
          <strong>${row.item_name}</strong>
          <span>${money(lineTotal)}</span>
        </div>
        <span class="muted">${money(row.item_price)} each</span>
        <div class="cart-actions">
          <input id="cart-qty-${row.id}" type="number" min="1" value="${row.quantity}" aria-label="Quantity for ${row.item_name}">
          <button class="outline-button" type="button" data-update="${row.id}">Update</button>
          <button class="outline-button" type="button" data-delete="${row.id}">Remove</button>
        </div>
      </article>
    `;
  }).join('');
  els.cartTotal.textContent = money(total);
  els.paymentTotal.textContent = money(total);
}

function renderOrders() {
  if (!state.token) {
    els.ordersList.innerHTML = '<p class="empty">Sign in to view orders.</p>';
    return;
  }

  if (!state.orders.length) {
    els.ordersList.innerHTML = '<p class="empty">No orders yet.</p>';
    return;
  }

  els.ordersList.innerHTML = state.orders.map((order) => `
    <article class="order-row">
      <div class="order-main">
        <strong>Order #${order.id}</strong>
        <span>${money(order.total_price)}</span>
      </div>
      <span class="muted">${order.status} - ${new Date(order.created_at).toLocaleString()}</span>
      <span>${order.city}, ${order.country}</span>
    </article>
  `).join('');
}

function setCheckoutStep(step) {
  document.querySelectorAll('[data-checkout-step]').forEach((button) => {
    button.classList.toggle('active', button.dataset.checkoutStep === step);
  });
  document.querySelectorAll('[data-checkout-pane]').forEach((pane) => {
    pane.classList.toggle('active', pane.dataset.checkoutPane === step);
  });
}

function validateAddressFields() {
  const requiredNames = ['full_name', 'address_line1', 'city', 'state', 'postal_code', 'country', 'telephone'];
  return requiredNames.every((name) => {
    const input = els.checkoutForm.elements[name];
    return input && input.value.trim();
  });
}

async function loadItems() {
  state.items = await api('/api/it/items/');
  renderItems();
}

async function loadCart() {
  if (!state.token) {
    state.cart = [];
    renderCart();
    return;
  }
  state.cart = await api('/api/ca/cart/');
  renderCart();
}

async function loadOrders() {
  if (!state.token) {
    state.orders = [];
    renderOrders();
    return;
  }
  state.orders = await api('/api/or/orders/');
  renderOrders();
}

async function refreshPrivateData() {
  await Promise.all([loadCart(), loadOrders()]);
}

els.signinTab.addEventListener('click', () => setAuthMode('signin'));
els.signupTab.addEventListener('click', () => setAuthMode('signup'));
els.openAuthBtn.addEventListener('click', () => openLayer(els.authModal));
els.openFeedbackBtn.addEventListener('click', () => openLayer(els.feedbackModal));
els.openCartBtn.addEventListener('click', async () => {
  await loadCart().catch((error) => showToast(error.message));
  setCheckoutStep('cart');
  openLayer(els.cartDrawer);
});
els.openOrdersBtn.addEventListener('click', async () => {
  if (!state.token) {
    openLayer(els.authModal);
    showToast('Sign in to view orders.');
    return;
  }
  await loadOrders().catch((error) => showToast(error.message));
  openLayer(els.ordersDrawer);
});

document.querySelectorAll('[data-close-modal]').forEach((button) => {
  button.addEventListener('click', () => closeLayer(document.querySelector(`#${button.dataset.closeModal}`)));
});

[els.authModal, els.cartDrawer, els.ordersDrawer, els.feedbackModal].forEach((layer) => {
  layer.addEventListener('click', (event) => {
    if (event.target === layer) closeLayer(layer);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    [els.authModal, els.cartDrawer, els.ordersDrawer, els.feedbackModal].forEach(closeLayer);
  }
});

document.querySelectorAll('[data-category]').forEach((button) => {
  button.addEventListener('click', () => setCategory(button.dataset.category));
});

document.querySelectorAll('[data-sort]').forEach((button) => {
  button.addEventListener('click', () => setSort(button.dataset.sort));
});

els.sortSelect.addEventListener('change', (event) => setSort(event.target.value));

document.querySelectorAll('[data-checkout-step]').forEach((button) => {
  button.addEventListener('click', () => setCheckoutStep(button.dataset.checkoutStep));
});

document.querySelectorAll('[data-next-step]').forEach((button) => {
  button.addEventListener('click', () => {
    const nextStep = button.dataset.nextStep;
    if (nextStep === 'payment' && !validateAddressFields()) {
      showToast('Please complete the address first.');
      setCheckoutStep('address');
      return;
    }
    setCheckoutStep(nextStep);
  });
});

els.signinForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  setBusy(button, true);
  try {
    const data = await api('/api/us/signin/', {
      method: 'POST',
      body: JSON.stringify(formData(els.signinForm)),
    });
    state.token = data.token;
    state.user = data.username || data.email || '';
    localStorage.setItem('ecomToken', state.token);
    localStorage.setItem('ecomUser', state.user);
    updateSession();
    await refreshPrivateData();
    closeLayer(els.authModal);
    showToast('Signed in.');
  } catch (error) {
    showToast(error.message);
  } finally {
    setBusy(button, false);
  }
});

els.signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  setBusy(button, true);
  try {
    const data = await api('/api/us/signup/', {
      method: 'POST',
      body: JSON.stringify(formData(els.signupForm)),
    });
    state.token = data.token;
    state.user = data.username || data.email || '';
    localStorage.setItem('ecomToken', state.token);
    localStorage.setItem('ecomUser', state.user);
    updateSession();
    setAuthMode('signin');
    await refreshPrivateData();
    closeLayer(els.authModal);
    showToast('Account created.');
  } catch (error) {
    showToast(error.message);
  } finally {
    setBusy(button, false);
  }
});

els.signOutBtn.addEventListener('click', () => {
  state.token = '';
  state.user = '';
  state.cart = [];
  state.orders = [];
  localStorage.removeItem('ecomToken');
  localStorage.removeItem('ecomUser');
  updateSession();
  renderCart();
  renderOrders();
  showToast('Signed out.');
});


els.feedbackForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  setBusy(button, true);
  try {
    await api('/api/ad/feedback/', {
      method: 'POST',
      body: JSON.stringify(formData(els.feedbackForm)),
    });
    els.feedbackForm.reset();
    closeLayer(els.feedbackModal);
    showToast('Feedback sent.');
  } catch (error) {
    showToast(error.message);
  } finally {
    setBusy(button, false);
  }
});

els.itemsGrid.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  if (!state.token) {
    openLayer(els.authModal);
    showToast('Sign in before adding items.');
    return;
  }

  const itemId = button.dataset.add;
  const quantity = Number(document.querySelector(`#qty-${itemId}`).value || 1);
  setBusy(button, true);
  try {
    await api('/api/ca/cart/add/', {
      method: 'POST',
      body: JSON.stringify({ item: Number(itemId), quantity }),
    });
    await loadCart();
    showToast('Added to bag.');
  } catch (error) {
    showToast(error.message);
  } finally {
    setBusy(button, false);
  }
});

els.cartList.addEventListener('click', async (event) => {
  const updateButton = event.target.closest('[data-update]');
  const deleteButton = event.target.closest('[data-delete]');
  const button = updateButton || deleteButton;
  if (!button) return;

  setBusy(button, true);
  try {
    if (updateButton) {
      const rowId = updateButton.dataset.update;
      const quantity = Number(document.querySelector(`#cart-qty-${rowId}`).value || 1);
      await api(`/api/ca/cart/update/${rowId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });
      showToast('Bag updated.');
    }

    if (deleteButton) {
      await api(`/api/ca/cart/delete/${deleteButton.dataset.delete}/`, { method: 'DELETE' });
      showToast('Item removed.');
    }

    await loadCart();
  } catch (error) {
    showToast(error.message);
  } finally {
    setBusy(button, false);
  }
});

els.checkoutForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!state.token) {
    openLayer(els.authModal);
    showToast('Sign in before checkout.');
    return;
  }

  const button = event.submitter;
  setBusy(button, true);
  try {
    await api('/api/or/orders/add/', {
      method: 'POST',
      body: JSON.stringify(formData(els.checkoutForm)),
    });
    els.checkoutForm.reset();
    await refreshPrivateData();
    showToast('Order placed.');
  } catch (error) {
    showToast(error.message);
  } finally {
    setBusy(button, false);
  }
});

els.refreshItemsBtn.addEventListener('click', () => loadItems().catch((error) => showToast(error.message)));
els.refreshCartBtn.addEventListener('click', () => loadCart().catch((error) => showToast(error.message)));
els.refreshOrdersBtn.addEventListener('click', () => loadOrders().catch((error) => showToast(error.message)));
els.itemSearch.addEventListener('input', (event) => {
  state.search = event.target.value;
  renderItems();
});

updateSession();
renderCart();
renderOrders();
loadItems().catch((error) => showToast(error.message));
if (state.token) {
  refreshPrivateData().catch((error) => showToast(error.message));
}
