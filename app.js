/* ==========================================================================
   SOLSTICE STUDIO — CORE E-COMMERCE CORE LOGIC
   Handles Storefront Rendering, Dynamic Cart, and Checkout Mock Flow
   ========================================================================== */

// --- GLOBAL STATE ORCHESTRATION ---
window.STORE_STATE = null;
window.CART_STATE = [];
window.ACTIVE_CATEGORY = "all";
window.ACTIVE_SEARCH_QUERY = "";

// 1. Initial Launch Bootstrapper
document.addEventListener("DOMContentLoaded", () => {
  initStoreState();
  initCartState();
  applyStoreBranding();
  renderStoreTexts();
  renderProductCatalog();
  updateCartBadge();
  setupEventListeners();
});

// Initialize dynamic storefront state from localStorage or products.js defaults
function initStoreState() {
  const savedState = localStorage.getItem("solstice_store_data");
  if (savedState) {
    try {
      window.STORE_STATE = JSON.parse(savedState);
      // Backwards compatibility validation for new schema variables
      if (!window.STORE_STATE.settings || !window.STORE_STATE.products) {
        throw new Error("Invalid state schema");
      }
    } catch (e) {
      console.warn("Storage data corrupted. Resetting to defaults.", e);
      window.STORE_STATE = JSON.parse(JSON.stringify(window.DEFAULT_STORE_DATA));
      localStorage.setItem("solstice_store_data", JSON.stringify(window.STORE_STATE));
    }
  } else {
    // Fresh launch
    window.STORE_STATE = JSON.parse(JSON.stringify(window.DEFAULT_STORE_DATA));
    localStorage.setItem("solstice_store_data", JSON.stringify(window.STORE_STATE));
  }
}

// Initialize shopping cart state from localStorage
function initCartState() {
  const savedCart = localStorage.getItem("solstice_cart");
  if (savedCart) {
    try {
      window.CART_STATE = JSON.parse(savedCart);
    } catch (e) {
      window.CART_STATE = [];
      localStorage.setItem("solstice_cart", JSON.stringify([]));
    }
  }
}

// Write the global state back to localStorage
window.saveStoreStateToStorage = function() {
  localStorage.setItem("solstice_store_data", JSON.stringify(window.STORE_STATE));
  // Global hooks can bind here if needed
};

// Write cart state to localStorage and re-render visual components
function saveCartState() {
  localStorage.setItem("solstice_cart", JSON.stringify(window.CART_STATE));
  updateCartBadge();
  renderCartDrawer();
}

// Apply CSS custom variables based on loaded active theme settings
function applyStoreBranding() {
  if (!window.STORE_STATE.settings) return;
  const root = document.documentElement;
  const settings = window.STORE_STATE.settings;
  
  if (settings.accentColor) {
    root.style.setProperty("--color-accent", settings.accentColor);
    // Convert hex to rgb for opacity states if needed
    const rgb = hexToRgb(settings.accentColor);
    if (rgb) {
      root.style.setProperty("--color-accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
  }
  
  if (settings.accentColorHover) {
    root.style.setProperty("--color-accent-hover", settings.accentColorHover);
  }
}

// Render dynamic text values across the storefront
function renderStoreTexts() {
  const elements = document.querySelectorAll("[data-cms-key]");
  elements.forEach(element => {
    const key = element.getAttribute("data-cms-key");
    if (window.STORE_STATE.texts && window.STORE_STATE.texts[key] !== undefined) {
      // Retain inner HTML for inline highlights or simple styles
      element.innerHTML = window.STORE_STATE.texts[key];
    }
  });
  
  // Custom updates (e.g. site document title)
  if (window.STORE_STATE.settings && window.STORE_STATE.settings.storeName) {
    const tagline = window.STORE_STATE.texts["hero-eyebrow"] || "Objects for the Slow Home";
    document.title = `${window.STORE_STATE.settings.storeName} — ${tagline}`;
  }
}

// --- RENDER DYNAMIC CATALOGUE GRID ---
window.renderProductCatalog = function() {
  const gridContainer = document.getElementById("products-grid-container");
  if (!gridContainer) return;
  
  let products = window.STORE_STATE.products || [];
  
  // 1. Filter out-of-stock items if setting is active in settings panel
  if (window.STORE_STATE.settings && window.STORE_STATE.settings.featuredOnly) {
    // "featuredOnly" maps to "Hide out of stock items" check
    products = products.filter(p => p.inventory > 0);
  }
  
  // 2. Filter by Category tab selection
  if (window.ACTIVE_CATEGORY !== "all") {
    products = products.filter(p => p.category === window.ACTIVE_CATEGORY);
  }
  
  // 3. Filter by active search query
  if (window.ACTIVE_SEARCH_QUERY.trim() !== "") {
    const query = window.ACTIVE_SEARCH_QUERY.toLowerCase().trim();
    products = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      (p.materials && p.materials.toLowerCase().includes(query))
    );
  }
  
  // 4. Reset Grid and check empty states
  gridContainer.innerHTML = "";
  
  if (products.length === 0) {
    gridContainer.innerHTML = `
      <div class="empty-products-state">
        <h3>No objects found</h3>
        <p>Try clearing active filters or searching for another term.</p>
        <button class="btn secondary-btn sm-btn mt-2" onclick="window.resetCatalogFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }
  
  // 5. Draw product cards
  products.forEach(product => {
    const isOutOfStock = product.inventory <= 0;
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-product-id", product.id);
    
    // Quick Add button layout
    const quickAddButton = isOutOfStock
      ? `<button class="quick-add-btn" disabled style="opacity: 0.5; cursor: not-allowed;">Out of Stock</button>`
      : `<button class="quick-add-btn" onclick="event.stopPropagation(); window.quickAddToCart('${product.id}')">Quick Add</button>`;
      
    // Badges layout
    const badge = isOutOfStock 
      ? `<span class="product-badge out-of-stock">Out of stock</span>`
      : product.isFeatured 
        ? `<span class="product-badge">Featured</span>` 
        : "";

    // Secondary gallery image transition fallback
    const secondaryImgTag = product.secondaryImage 
      ? `<img src="${product.secondaryImage}" alt="${product.name} detail view" class="product-img-secondary" loading="lazy">`
      : "";

    card.innerHTML = `
      <div class="product-img-container">
        ${badge}
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${secondaryImgTag}
        ${quickAddButton}
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <div class="product-title-row">
          <h3 class="product-title">${product.name}</h3>
          <span class="product-price">$${Number(product.price).toFixed(2)}</span>
        </div>
      </div>
    `;
    
    // Add Click listener to open detail slide-out
    card.addEventListener("click", () => {
      // Prevent opening details during CMS editing mode
      if (document.body.classList.contains("cms-mode-active")) return;
      openProductDetails(product.id);
    });
    
    gridContainer.appendChild(card);
  });
};

// Reset search and categories back to defaults
window.resetCatalogFilters = function() {
  window.ACTIVE_CATEGORY = "all";
  window.ACTIVE_SEARCH_QUERY = "";
  
  // Reset nav states
  const filters = document.querySelectorAll("#catalog-filters .filter-btn, #nav-menu-container .nav-link");
  filters.forEach(btn => btn.classList.remove("active"));
  document.querySelector('#catalog-filters [data-filter="all"]').classList.add("active");
  document.querySelector('#nav-menu-container [data-filter="all"]').classList.add("active");
  
  // Reset search box inputs
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";
  document.getElementById("search-bar-container").classList.remove("active");
  document.getElementById("search-clear-btn").style.display = "none";
  document.getElementById("search-banner").classList.add("hidden");
  
  window.renderProductCatalog();
};


// --- SHOPPING CART STATE CONTROLS ---

// Add item quickly from catalog list
window.quickAddToCart = function(productId) {
  addToCart(productId, 1);
  showToastNotification("Item added to your shopping cart.");
};

// Main Add to Cart control
window.addToCart = function(productId, qtyToAdd) {
  const product = window.STORE_STATE.products.find(p => p.id === productId);
  if (!product) return;
  
  // Out of stock warning
  if (product.inventory <= 0) {
    alert("This handcrafted object is currently out of stock.");
    return;
  }
  
  const existingItem = window.CART_STATE.find(item => item.id === productId);
  
  if (existingItem) {
    const totalQty = existingItem.quantity + qtyToAdd;
    if (totalQty > product.inventory) {
      alert(`Cannot add more items. Only ${product.inventory} pieces left in stock.`);
      existingItem.quantity = product.inventory;
    } else {
      existingItem.quantity = totalQty;
    }
  } else {
    window.CART_STATE.push({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: Math.min(qtyToAdd, product.inventory)
    });
  }
  
  saveCartState();
  openCartDrawer();
};

// Remove item from cart list
window.removeCartItem = function(productId) {
  window.CART_STATE = window.CART_STATE.filter(item => item.id !== productId);
  saveCartState();
};

// Update cart product quantity
window.updateCartQuantity = function(productId, delta) {
  const item = window.CART_STATE.find(i => i.id === productId);
  if (!item) return;
  
  const product = window.STORE_STATE.products.find(p => p.id === productId);
  const newQty = item.quantity + delta;
  
  if (newQty <= 0) {
    window.removeCartItem(productId);
    return;
  }
  
  if (product && newQty > product.inventory) {
    alert(`Only ${product.inventory} items are available in inventory.`);
    item.quantity = product.inventory;
  } else {
    item.quantity = newQty;
  }
  
  saveCartState();
};

// Get current cart items total pricing
function getCartSubtotal() {
  return window.CART_STATE.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Get total count of all products in cart
function getCartCount() {
  return window.CART_STATE.reduce((sum, item) => sum + item.quantity, 0);
}

// Toggle header badge count
function updateCartBadge() {
  const badge = document.getElementById("cart-count-badge");
  if (!badge) return;
  const count = getCartCount();
  badge.textContent = count;
  if (count === 0) {
    badge.style.display = "none";
  } else {
    badge.style.display = "flex";
  }
}

// Draw dynamic content in slide-out cart drawer
function renderCartDrawer() {
  const emptyView = document.getElementById("cart-empty-view");
  const activeView = document.getElementById("cart-active-view");
  const itemsContainer = document.getElementById("cart-items-container");
  const subtotalPriceEl = document.getElementById("cart-subtotal-price");
  const shippingCostEl = document.getElementById("cart-shipping-cost");
  
  if (!emptyView || !activeView || !itemsContainer) return;
  
  if (window.CART_STATE.length === 0) {
    emptyView.classList.remove("hidden");
    activeView.classList.add("hidden");
    return;
  }
  
  emptyView.classList.add("hidden");
  activeView.classList.remove("hidden");
  
  // Render list items
  itemsContainer.innerHTML = "";
  window.CART_STATE.forEach(item => {
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <div>
          <h4 class="cart-item-name">${item.name}</h4>
          <span class="cart-item-price">$${Number(item.price).toFixed(2)}</span>
        </div>
        <div class="quantity-control">
          <button onclick="window.updateCartQuantity('${item.id}', -1)" aria-label="Decrease quantity">-</button>
          <span>${item.quantity}</span>
          <button onclick="window.updateCartQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="cart-item-remove-btn" onclick="window.removeCartItem('${item.id}')" aria-label="Remove item">&times;</button>
    `;
    itemsContainer.appendChild(itemEl);
  });
  
  // Sum subtotals
  const subtotal = getCartSubtotal();
  subtotalPriceEl.textContent = `$${subtotal.toFixed(2)}`;
  
  // Dynamic free shipping calculations ($150 target)
  const shippingThreshold = 150;
  if (subtotal >= shippingThreshold) {
    shippingCostEl.textContent = "FREE";
    shippingCostEl.style.color = "var(--color-success)";
  } else {
    const remaining = shippingThreshold - subtotal;
    shippingCostEl.textContent = `$15.00 ($${remaining.toFixed(2)} to free)`;
    shippingCostEl.style.color = "var(--color-text-muted)";
  }
}

// --- PRODUCT DETAILS SLIDEOUTDRAWER ---
function openProductDetails(productId) {
  const product = window.STORE_STATE.products.find(p => p.id === productId);
  if (!product) return;
  
  const contentContainer = document.getElementById("detail-drawer-content-container");
  if (!contentContainer) return;
  
  const isOutOfStock = product.inventory <= 0;
  const secondaryImageSrc = product.secondaryImage || product.image;
  
  contentContainer.innerHTML = `
    <!-- Top Gallery showcasing primary image -->
    <div class="detail-img-showcase">
      <img src="${product.image}" id="detail-active-photo" alt="${product.name}">
    </div>
    
    <!-- Narrative details block -->
    <div class="detail-info-block">
      <span class="detail-category">${product.category}</span>
      <h2 class="detail-title">${product.name}</h2>
      <div class="detail-price">$${Number(product.price).toFixed(2)}</div>
      
      <p class="detail-desc">${product.description}</p>
      
      <!-- Craft Materials and Dimensions specifications table -->
      <div class="detail-specs-table">
        <div class="spec-row">
          <span class="spec-label">Materials</span>
          <span class="spec-val">${product.materials || "Natural clay, artisanal firing"}</span>
        </div>
        <div class="spec-row">
          <span class="spec-label">Dimensions</span>
          <span class="spec-val">${product.dimensions || "Handcrafted standard"}</span>
        </div>
        <div class="spec-row">
          <span class="spec-label">Availability</span>
          <span class="spec-val" style="color: ${isOutOfStock ? 'var(--color-error)' : 'var(--color-success)'}">
            ${isOutOfStock ? 'Sold Out' : `${product.inventory} pieces left in stock`}
          </span>
        </div>
      </div>
      
      <!-- Checkout Actions Row -->
      <div class="detail-actions-row">
        <div class="quantity-control">
          <button onclick="adjustDetailQty(-1)" aria-label="Decrease detail quantity">-</button>
          <span id="detail-qty-counter">1</span>
          <button onclick="adjustDetailQty(1)" aria-label="Increase detail quantity">+</button>
        </div>
        <button class="btn primary-btn detail-add-btn" 
                onclick="window.submitDetailAddToCart('${product.id}')"
                ${isOutOfStock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
          ${isOutOfStock ? 'Sold Out' : 'Add to collection'}
        </button>
      </div>
    </div>
  `;
  
  // Set current active product context on body details
  document.body.setAttribute("data-active-detail-product-id", productId);
  
  // Slide out drawer open
  document.getElementById("detail-drawer-overlay").classList.add("active");
  document.getElementById("detail-drawer").classList.add("active");
  document.getElementById("detail-drawer").setAttribute("aria-hidden", "false");
}

// Adjust local detail qty counter
window.adjustDetailQty = function(delta) {
  const counterEl = document.getElementById("detail-qty-counter");
  if (!counterEl) return;
  
  const currentVal = parseInt(counterEl.textContent, 10);
  const productId = document.body.getAttribute("data-active-detail-product-id");
  const product = window.STORE_STATE.products.find(p => p.id === productId);
  
  if (!product) return;
  
  const newVal = currentVal + delta;
  
  if (newVal <= 0) return;
  
  if (newVal > product.inventory) {
    alert(`Only ${product.inventory} items are available in stock.`);
    counterEl.textContent = product.inventory;
  } else {
    counterEl.textContent = newVal;
  }
};

// Submit Add to Cart from Details Drawer View
window.submitDetailAddToCart = function(productId) {
  const counterEl = document.getElementById("detail-qty-counter");
  const qty = counterEl ? parseInt(counterEl.textContent, 10) : 1;
  
  window.addToCart(productId, qty);
  closeDetailDrawer();
};


// --- CART / DETAIL SLIDEOUT CLOSE ACTIONS ---
function openCartDrawer() {
  renderCartDrawer();
  document.getElementById("cart-drawer-overlay").classList.add("active");
  document.getElementById("cart-drawer").classList.add("active");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "false");
}

function closeCartDrawer() {
  document.getElementById("cart-drawer-overlay").classList.remove("active");
  document.getElementById("cart-drawer").classList.remove("active");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "true");
}

function closeDetailDrawer() {
  document.getElementById("detail-drawer-overlay").classList.remove("active");
  document.getElementById("detail-drawer").classList.remove("active");
  document.getElementById("detail-drawer").setAttribute("aria-hidden", "true");
}


// --- CHECKOUT PROCESS MODAL FLOW ---
function openCheckoutModal() {
  if (window.CART_STATE.length === 0) {
    alert("Please add items to your cart before proceeding.");
    return;
  }
  
  // Close cart drawer first
  closeCartDrawer();
  
  // Populate elements
  const summaryList = document.getElementById("checkout-summary-items");
  const subtotalEl = document.getElementById("checkout-subtotal");
  const shippingEl = document.getElementById("checkout-shipping");
  const totalEl = document.getElementById("checkout-total");
  
  if (!summaryList || !subtotalEl || !shippingEl || !totalEl) return;
  
  summaryList.innerHTML = "";
  window.CART_STATE.forEach(item => {
    const el = document.createElement("div");
    el.className = "checkout-item-summary";
    el.innerHTML = `
      <div class="checkout-item-name-qty">
        ${item.name} <span>&times; ${item.quantity}</span>
      </div>
      <div class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
    `;
    summaryList.appendChild(el);
  });
  
  const subtotal = getCartSubtotal();
  const shippingThreshold = 150;
  const shippingCost = subtotal >= shippingThreshold ? 0 : 15.00;
  const grandTotal = subtotal + shippingCost;
  
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  shippingEl.textContent = shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`;
  totalEl.textContent = `$${grandTotal.toFixed(2)}`;
  
  // Reveal views
  document.getElementById("checkout-form-container").classList.remove("hidden");
  document.getElementById("checkout-success-container").classList.add("hidden");
  
  document.getElementById("checkout-modal-overlay").classList.add("active");
  document.getElementById("checkout-modal").classList.add("active");
}

function closeCheckoutModal() {
  document.getElementById("checkout-modal-overlay").classList.remove("active");
  document.getElementById("checkout-modal").classList.remove("active");
}

// Simulated mock purchase submission
window.submitMockCheckout = function() {
  const spinner = document.getElementById("global-loading-spinner");
  const spinnerText = document.getElementById("global-loading-text");
  
  if (spinner && spinnerText) {
    spinnerText.textContent = "Processing secure payment...";
    spinner.classList.remove("hidden");
  }
  
  // Simulate delay
  setTimeout(() => {
    if (spinner) spinner.classList.add("hidden");
    
    // Decrement catalogue stock locally! (Adds extreme realism and functional depth)
    window.CART_STATE.forEach(cartItem => {
      const product = window.STORE_STATE.products.find(p => p.id === cartItem.id);
      if (product) {
        product.inventory = Math.max(0, product.inventory - cartItem.quantity);
      }
    });
    
    // Save updated stock to storage
    window.saveStoreStateToStorage();
    
    // Render dynamic updates
    window.renderProductCatalog();
    
    // Empty Cart state
    window.CART_STATE = [];
    saveCartState();
    
    // Switch to success view in modal
    document.getElementById("checkout-form-container").classList.add("hidden");
    document.getElementById("checkout-success-container").classList.remove("hidden");
  }, 1500);
};


// --- EVENT LISTENERS INITIALIZATION ---
function setupEventListeners() {
  // Navigation filters click handling
  const catalogNavLinks = document.querySelectorAll("#nav-menu-container .nav-link, #catalog-filters .filter-btn");
  catalogNavLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      // Only filter if they clicked product categories
      const filter = link.getAttribute("data-filter");
      if (filter) {
        e.preventDefault();
        
        // Update selection states
        window.ACTIVE_CATEGORY = filter;
        
        // Align active visual states on header AND catalog filters
        catalogNavLinks.forEach(item => {
          if (item.getAttribute("data-filter") === filter) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
        
        // Scroll to catalog section if they click footer/header links and are not in section
        if (link.closest("#nav-menu-container") || link.closest(".footer-links-col")) {
          const catSection = document.getElementById("catalog-section");
          if (catSection) catSection.scrollIntoView({ behavior: "smooth" });
        }
        
        window.renderProductCatalog();
      }
    });
  });

  // Expandable Search Bar toggle event
  const searchToggle = document.getElementById("search-toggle-btn");
  const searchContainer = document.getElementById("search-bar-container");
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear-btn");
  const searchBanner = document.getElementById("search-banner");
  const searchQueryDisplay = document.getElementById("search-query-display");
  const clearSearchBannerBtn = document.getElementById("clear-search-banner-btn");

  if (searchToggle && searchContainer && searchInput) {
    searchToggle.addEventListener("click", () => {
      searchContainer.classList.toggle("active");
      if (searchContainer.classList.contains("active")) {
        searchInput.focus();
      }
    });

    searchInput.addEventListener("input", (e) => {
      const val = e.target.value;
      window.ACTIVE_SEARCH_QUERY = val;
      
      // Toggle clear button visible
      if (val.length > 0) {
        searchClear.style.display = "block";
        searchBanner.classList.remove("hidden");
        searchQueryDisplay.textContent = val;
      } else {
        searchClear.style.display = "none";
        searchBanner.classList.add("hidden");
      }
      
      window.renderProductCatalog();
    });

    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      window.ACTIVE_SEARCH_QUERY = "";
      searchClear.style.display = "none";
      searchBanner.classList.add("hidden");
      window.renderProductCatalog();
      searchInput.focus();
    });
    
    if (clearSearchBannerBtn) {
      clearSearchBannerBtn.addEventListener("click", () => {
        window.resetCatalogFilters();
      });
    }
  }

  // Toggle Cart Drawer Controls
  const cartToggle = document.getElementById("cart-toggle-btn");
  const cartClose = document.getElementById("cart-drawer-close");
  const cartOverlay = document.getElementById("cart-drawer-overlay");
  const cartEmptyBrowse = document.getElementById("cart-empty-continue-btn");

  if (cartToggle) cartToggle.addEventListener("click", openCartDrawer);
  if (cartClose) cartClose.addEventListener("click", closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCartDrawer);
  if (cartEmptyBrowse) cartEmptyBrowse.addEventListener("click", closeCartDrawer);

  // Toggle Details Drawer Controls
  const detailClose = document.getElementById("detail-drawer-close");
  const detailOverlay = document.getElementById("detail-drawer-overlay");

  if (detailClose) detailClose.addEventListener("click", closeDetailDrawer);
  if (detailOverlay) detailOverlay.addEventListener("click", closeDetailDrawer);

  // Checkout Actions Listeners
  const proceedCheckout = document.getElementById("proceed-checkout-btn");
  const checkoutClose = document.getElementById("checkout-modal-close");
  const checkoutOverlay = document.getElementById("checkout-modal-overlay");
  const successClose = document.getElementById("checkout-success-close-btn");

  if (proceedCheckout) proceedCheckout.addEventListener("click", openCheckoutModal);
  if (checkoutClose) checkoutClose.addEventListener("click", closeCheckoutModal);
  if (checkoutOverlay) checkoutOverlay.addEventListener("click", closeCheckoutModal);
  if (successClose) {
    successClose.addEventListener("click", () => {
      closeCheckoutModal();
    });
  }

  // Mobile Menu Navigation panel toggle
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const navMenu = document.getElementById("nav-menu-container");

  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      mobileMenuToggle.classList.toggle("open");
    });
    
    // Close nav panel if they click any mobile link
    const mobileLinks = navMenu.querySelectorAll("a");
    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        mobileMenuToggle.classList.remove("open");
      });
    });
  }
}

// --- UTILITY HELPER FUNCTIONS ---

// Displays dynamic feedback notifications in the bottom left
window.showToastNotification = function(message) {
  const toast = document.getElementById("toast-message-box");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("active");
  
  // Slide out close delay
  setTimeout(() => {
    toast.classList.remove("active");
  }, 3000);
};

// Convert hex colors to rgb values
function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
