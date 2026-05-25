/* ==========================================================================
   SOLSTICE STUDIO — VISUAL CMS CONTROLLER
   Implements inline text edits, catalog modifications, and JSON backup controls
   ========================================================================== */

// --- SESSION STATE CHECKER ---
document.addEventListener("DOMContentLoaded", () => {
  initCmsState();
  setupCmsListeners();
});

// Check if CMS mode was active in current session (retains editor on refresh!)
function initCmsState() {
  const isCmsActive = sessionStorage.getItem("solstice_cms_active");
  if (isCmsActive === "true") {
    // Session persistent
    setTimeout(() => {
      enableCmsMode();
    }, 200); // Give storefront a brief moment to finish initial render
  }
}

// --- CMS SECURITY CONTROLS ---

// Open Staff Portal modal
function openCmsLoginModal() {
  document.getElementById("admin-login-overlay").classList.add("active");
  document.getElementById("admin-login-modal").classList.add("active");
  document.getElementById("admin-username").focus();
}

// Close Staff Portal modal
function closeCmsLoginModal() {
  document.getElementById("admin-login-overlay").classList.remove("active");
  document.getElementById("admin-login-modal").classList.remove("active");
  document.getElementById("admin-login-form").reset();
  document.getElementById("login-error-msg").classList.add("hidden");
}

// Authenticate submitted credentials
function authenticateCmsLogin(e) {
  e.preventDefault();
  const usernameInput = document.getElementById("admin-username").value.trim();
  const passwordInput = document.getElementById("admin-password").value.trim();
  const errorMsg = document.getElementById("login-error-msg");
  
  // Standard Secure Mock Credentials
  if (usernameInput === "demo" && passwordInput === "demo123") {
    closeCmsLoginModal();
    enableCmsMode();
    showToastNotification("CMS Unlocked. Double click elements or use panel to edit.");
  } else {
    errorMsg.classList.remove("hidden");
    document.getElementById("admin-password").focus();
  }
}

// --- ENABLE/DISABLE CMS BUILDER STATE ---
window.enableCmsMode = function() {
  document.body.classList.add("cms-mode-active");
  sessionStorage.setItem("solstice_cms_active", "true");
  
  // Toggle Header Status icons
  document.getElementById("admin-lock-icon").classList.add("hidden");
  document.getElementById("admin-unlock-icon").classList.remove("hidden");
  
  // Reveal Floating Panel
  const cmsPanel = document.getElementById("studio-cms-panel");
  if (cmsPanel) {
    cmsPanel.classList.remove("hidden");
    cmsPanel.classList.remove("collapsed");
  }
  
  // Load settings inputs
  populateCmsSettingsFields();
  
  // Load products list table
  renderCmsProductsTable();
  
  // Bind in-context visual click-to-edit triggers
  bindInlineTextEditListeners();
};

window.disableCmsMode = function() {
  document.body.classList.remove("cms-mode-active");
  sessionStorage.setItem("solstice_cms_active", "false");
  
  // Toggle Header Status icons
  document.getElementById("admin-lock-icon").classList.remove("hidden");
  document.getElementById("admin-unlock-icon").classList.add("hidden");
  
  // Hide Floating Panel
  const cmsPanel = document.getElementById("studio-cms-panel");
  if (cmsPanel) {
    cmsPanel.classList.add("hidden");
  }
  
  // Unbind visual hover/click outline listeners
  unbindInlineTextEditListeners();
};

// --- VISUAL IN-CONTEXT TEXT EDITOR ENGINE ---
let activeEditableNode = null;
let activeCmsKey = null;

// Map click events to all editable nodes
function bindInlineTextEditListeners() {
  const editableItems = document.querySelectorAll(".editable-text");
  editableItems.forEach(node => {
    // Add custom hover highlights and override click/double-click triggers
    node.addEventListener("click", handleInlineElementClick);
    node.addEventListener("dblclick", handleInlineElementClick);
  });
}

// Remove override click handlers from elements
function unbindInlineTextEditListeners() {
  const editableItems = document.querySelectorAll(".editable-text");
  editableItems.forEach(node => {
    node.removeEventListener("click", handleInlineElementClick);
    node.removeEventListener("dblclick", handleInlineElementClick);
  });
}

// Clicking on a text element intercepts standard actions and opens visual editor
function handleInlineElementClick(e) {
  // Check if CMS is explicitly enabled to prevent accidental overrides
  if (!document.body.classList.contains("cms-mode-active")) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  activeEditableNode = e.currentTarget;
  activeCmsKey = activeEditableNode.getAttribute("data-cms-key");
  
  if (!activeCmsKey) return;
  
  const currentVal = window.STORE_STATE.texts[activeCmsKey] || activeEditableNode.innerText;
  
  // Populate editor modal
  document.getElementById("editor-node-key").textContent = `Key Reference: [ ${activeCmsKey} ]`;
  document.getElementById("editor-textarea").value = currentVal;
  
  // Open editor
  document.getElementById("inline-editor-overlay").classList.add("active");
  document.getElementById("inline-editor-modal").classList.add("active");
  document.getElementById("editor-textarea").focus();
}

// Save Inline modifications back to local state
function saveInlineTextChanges() {
  const textVal = document.getElementById("editor-textarea").value;
  
  if (activeCmsKey && activeEditableNode) {
    // Overwrite state properties
    if (activeCmsKey === "storeName") {
      window.STORE_STATE.settings.storeName = textVal;
    }
    
    window.STORE_STATE.texts[activeCmsKey] = textVal;
    window.saveStoreStateToStorage();
    
    // Render immediate changes visually without a reload
    activeEditableNode.innerHTML = textVal;
    
    // If we changed categories, update filter tabs too
    if (activeCmsKey.startsWith("category-")) {
      window.renderProductCatalog();
    }
    
    closeInlineEditorModal();
    showToastNotification(`Store text [${activeCmsKey}] updated successfully.`);
  }
}

function closeInlineEditorModal() {
  document.getElementById("inline-editor-overlay").classList.remove("active");
  document.getElementById("inline-editor-modal").classList.remove("active");
  activeEditableNode = null;
  activeCmsKey = null;
}


// --- CATALOGUE MANAGER (TABLES AND MODAL EDITORS) ---

// Draw products list table inside Panel Catalogue Tab
function renderCmsProductsTable() {
  const tableBody = document.getElementById("cms-products-list-body");
  if (!tableBody) return;
  
  tableBody.innerHTML = "";
  const products = window.STORE_STATE.products || [];
  
  if (products.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No objects in catalog. Click Add Product to begin.</td></tr>`;
    return;
  }
  
  products.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${p.image}" alt="${p.name}" class="cms-prod-table-img"></td>
      <td><strong>${p.name}</strong><br><span style="font-size:0.7rem; color:#aaa;">Qty: ${p.inventory}</span></td>
      <td style="text-transform: capitalize;">${p.category}</td>
      <td>$${Number(p.price).toFixed(2)}</td>
      <td>
        <div class="cms-action-btn-group">
          <button class="cms-edit-row-btn" onclick="openProductFormModal('${p.id}')">Edit</button>
          <button class="cms-delete-row-btn" onclick="deleteCmsProduct('${p.id}')">Delete</button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// Open Product Modal in Add/Edit configurations
window.openProductFormModal = function(productId = null) {
  const form = document.getElementById("cms-product-form");
  const modalTitle = document.getElementById("product-editor-title");
  const submitBtn = document.getElementById("cms-product-form-submit");
  
  if (!form) return;
  form.reset();
  
  if (productId) {
    // EDIT CONFIGURATION
    const p = window.STORE_STATE.products.find(item => item.id === productId);
    if (!p) return;
    
    modalTitle.textContent = "Edit Curated Object";
    submitBtn.textContent = "Save Changes";
    
    document.getElementById("cms-prod-id").value = p.id;
    document.getElementById("cms-prod-name").value = p.name;
    document.getElementById("cms-prod-price").value = p.price;
    document.getElementById("cms-prod-category").value = p.category;
    document.getElementById("cms-prod-inventory").value = p.inventory;
    document.getElementById("cms-prod-desc").value = p.description;
    document.getElementById("cms-prod-image").value = p.image;
    document.getElementById("cms-prod-secondaryImage").value = p.secondaryImage || "";
    document.getElementById("cms-prod-materials").value = p.materials || "";
    document.getElementById("cms-prod-dimensions").value = p.dimensions || "";
    document.getElementById("cms-prod-featured").checked = !!p.isFeatured;
  } else {
    // ADD NEW CONFIGURATION
    modalTitle.textContent = "Add Curated Object";
    submitBtn.textContent = "Save Product to Catalogue";
    
    document.getElementById("cms-prod-id").value = "";
    document.getElementById("cms-prod-featured").checked = true;
  }
  
  document.getElementById("product-editor-modal-overlay").classList.add("active");
  document.getElementById("product-editor-modal").classList.add("active");
};

// Handle submitted Product Add/Edit Form
window.saveCmsProductForm = function() {
  const id = document.getElementById("cms-prod-id").value;
  const name = document.getElementById("cms-prod-name").value.trim();
  const price = parseFloat(document.getElementById("cms-prod-price").value);
  const category = document.getElementById("cms-prod-category").value;
  const inventory = parseInt(document.getElementById("cms-prod-inventory").value, 10);
  const description = document.getElementById("cms-prod-desc").value.trim();
  const image = document.getElementById("cms-prod-image").value.trim();
  const secondaryImage = document.getElementById("cms-prod-secondaryImage").value.trim();
  const materials = document.getElementById("cms-prod-materials").value.trim();
  const dimensions = document.getElementById("cms-prod-dimensions").value.trim();
  const isFeatured = document.getElementById("cms-prod-featured").checked;
  
  const productData = {
    name, price, category, inventory, description, image,
    secondaryImage: secondaryImage || null,
    materials: materials || null,
    dimensions: dimensions || null,
    isFeatured
  };
  
  if (id) {
    // Perform Update
    const idx = window.STORE_STATE.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      window.STORE_STATE.products[idx] = { ...window.STORE_STATE.products[idx], ...productData };
      showToastNotification(`Object "${name}" updated successfully.`);
    }
  } else {
    // Perform Create
    const newId = `prod-${Date.now()}`;
    const newProduct = { id: newId, ...productData };
    window.STORE_STATE.products.push(newProduct);
    showToastNotification(`Object "${name}" added to catalogue.`);
  }
  
  // Sync states
  window.saveStoreStateToStorage();
  window.renderProductCatalog();
  renderCmsProductsTable();
  closeProductFormModal();
};

window.closeProductFormModal = function() {
  document.getElementById("product-editor-modal-overlay").classList.remove("active");
  document.getElementById("product-editor-modal").classList.remove("active");
};

// Delete Product from Catalogue
window.deleteCmsProduct = function(productId) {
  const p = window.STORE_STATE.products.find(item => item.id === productId);
  if (!p) return;
  
  const confirmDel = confirm(`Are you sure you want to remove "${p.name}" from the store catalog permanently?`);
  if (confirmDel) {
    window.STORE_STATE.products = window.STORE_STATE.products.filter(item => item.id !== productId);
    
    // Sync states
    window.saveStoreStateToStorage();
    window.renderProductCatalog();
    renderCmsProductsTable();
    showToastNotification(`Object "${p.name}" deleted.`);
  }
};


// --- GLOBAL STORE THEME SETTINGS ---

// Pre-fill CMS inputs with active settings values
function populateCmsSettingsFields() {
  const settings = window.STORE_STATE.settings;
  if (!settings) return;
  
  document.getElementById("cms-setting-storename").value = settings.storeName || "";
  document.getElementById("cms-setting-tagline").value = settings.storeTagline || "";
  document.getElementById("cms-setting-announcement").value = settings.announcement || "";
  
  const accentHex = settings.accentColor || "#4A533C";
  document.getElementById("cms-setting-color").value = accentHex;
  document.getElementById("cms-setting-color-picker").value = accentHex;
  
  document.getElementById("cms-setting-featured-only").checked = !!settings.featuredOnly;
}

// Bind Accent hex text field to color pickers directly
function setupColorPickerBindings() {
  const picker = document.getElementById("cms-setting-color-picker");
  const input = document.getElementById("cms-setting-color");
  
  if (picker && input) {
    picker.addEventListener("input", (e) => {
      input.value = e.target.value;
    });
    
    input.addEventListener("input", (e) => {
      const val = e.target.value;
      // Confirm standard Hex regex form before overriding picker
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        picker.value = val;
      }
    });
  }
}

// Apply visual brand settings submitted from Panel Store Brand Form
window.saveCmsGlobalSettings = function() {
  const storeName = document.getElementById("cms-setting-storename").value.trim();
  const storeTagline = document.getElementById("cms-setting-tagline").value.trim();
  const announcement = document.getElementById("cms-setting-announcement").value.trim();
  const accentColor = document.getElementById("cms-setting-color").value.trim();
  const featuredOnly = document.getElementById("cms-setting-featured-only").checked;
  
  // Validate accent HEX format
  if (!/^#[0-9A-F]{6}$/i.test(accentColor)) {
    alert("Please specify a valid HEX accent color (e.g. #4A533C)");
    return;
  }
  
  // Calculate warm accent hover shade dynamically (slightly darker variant)
  const hoverShade = darkenHexColor(accentColor, 15);
  
  // Apply state modifications
  window.STORE_STATE.settings.storeName = storeName;
  window.STORE_STATE.settings.storeTagline = storeTagline;
  window.STORE_STATE.settings.announcement = announcement;
  window.STORE_STATE.settings.accentColor = accentColor;
  window.STORE_STATE.settings.accentColorHover = hoverShade;
  window.STORE_STATE.settings.featuredOnly = featuredOnly;
  
  // Sync to texts keys too
  window.STORE_STATE.texts["storeName"] = storeName;
  window.STORE_STATE.texts["hero-eyebrow"] = storeTagline.toUpperCase();
  window.STORE_STATE.texts["announcement"] = announcement;
  
  // Save State
  window.saveStoreStateToStorage();
  
  // Show spinner to make transitions feel extremely polished and satisfying
  const spinner = document.getElementById("global-loading-spinner");
  if (spinner) {
    document.getElementById("global-loading-text").textContent = "Rebuilding design tokens...";
    spinner.classList.remove("hidden");
    
    setTimeout(() => {
      spinner.classList.add("hidden");
      // Trigger full visual layout refreshes
      applyStoreBranding();
      renderStoreTexts();
      window.renderProductCatalog();
      showToastNotification("Theme styling applied successfully.");
    }, 800);
  }
};


// --- JSON BACKUPS & FACTORY RESETS ---

// Export storefront state to Textarea and trigger JSON file download
function exportCmsSiteData() {
  const jsonStr = JSON.stringify(window.STORE_STATE, null, 2);
  const textarea = document.getElementById("cms-json-data-textarea");
  
  if (textarea) {
    textarea.value = jsonStr;
  }
  
  // Trigger local file download
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "solstice-storefront-backup.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  
  showToastNotification("Site JSON file downloaded successfully.");
}

// Trigger hidden file input click
function triggerCmsImportInput() {
  const fileInput = document.getElementById("cms-import-file-input");
  if (fileInput) {
    fileInput.click();
  }
}

// Parse imported JSON and overwrite storage
function handleCmsDataImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const parsed = JSON.parse(evt.target.result);
      
      // Simple schema confirmation checks
      if (!parsed.settings || !parsed.texts || !parsed.products) {
        throw new Error("Invalid store layout schema.");
      }
      
      const confirmImport = confirm("Are you sure you want to overwrite all products, categories, images, and text content with this backup? This cannot be undone.");
      if (confirmImport) {
        window.STORE_STATE = parsed;
        window.saveStoreStateToStorage();
        
        showToastNotification("Importing layouts...");
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      alert("Error parsing file. Ensure this is a valid Solstice backup JSON file.\n" + err.message);
    }
  };
  reader.readAsText(file);
}

// Factory reset double confirmation
function resetStoreStateToDefaults() {
  const c1 = confirm("Are you sure you want to reset the website catalog, texts, and accent styling to defaults?");
  if (c1) {
    const c2 = confirm("This will permanently delete all customizations, newly added products, and edits. Proceed?");
    if (c2) {
      localStorage.removeItem("solstice_store_data");
      sessionStorage.setItem("solstice_cms_active", "false");
      showToastNotification("Resetting storefront...");
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }
}


// --- GENERAL CMS LISTENERS ---
function setupCmsListeners() {
  // Staff Portal Login triggers
  const indicator = document.getElementById("admin-status-indicator");
  const footerPortal = document.getElementById("cms-portal-footer-link");
  const loginClose = document.getElementById("admin-login-close");
  const loginForm = document.getElementById("admin-login-form");
  const loginOverlay = document.getElementById("admin-login-overlay");
  
  if (indicator) {
    indicator.addEventListener("click", () => {
      // If already logged in, toggle off easily!
      if (document.body.classList.contains("cms-mode-active")) {
        const confirmExit = confirm("Do you want to log out of Studio CMS Mode and secure the editing panel?");
        if (confirmExit) {
          disableCmsMode();
          showToastNotification("CMS Secured. Editor exited.");
        }
      } else {
        openCmsLoginModal();
      }
    });
  }
  
  if (footerPortal) {
    footerPortal.addEventListener("click", (e) => {
      e.preventDefault();
      openCmsLoginModal();
    });
  }
  
  if (loginClose) loginClose.addEventListener("click", closeCmsLoginModal);
  if (loginOverlay) loginOverlay.addEventListener("click", closeCmsLoginModal);
  if (loginForm) loginForm.addEventListener("submit", authenticateCmsLogin);
  
  // Collapsed Panel Ribbon Toggles
  const collapseBtn = document.getElementById("studio-panel-collapse-btn");
  const toggleHeader = document.getElementById("studio-panel-toggle-header");
  const panel = document.getElementById("studio-cms-panel");
  
  if (toggleHeader && panel) {
    toggleHeader.addEventListener("click", (e) => {
      // Prevent collapse toggling if clicking minimize icon directly or inside buttons
      if (e.target.closest(".panel-minimize-btn") || e.target.closest("button")) return;
      panel.classList.toggle("collapsed");
    });
  }
  
  if (collapseBtn && panel) {
    collapseBtn.addEventListener("click", () => {
      panel.classList.toggle("collapsed");
    });
  }
  
  // Panel Tab Switching logic
  const tabs = document.querySelectorAll(".studio-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const targetContentId = tab.getAttribute("data-tab");
      const contents = document.querySelectorAll(".studio-tab-content");
      contents.forEach(content => {
        if (content.id === targetContentId) {
          content.classList.add("active");
        } else {
          content.classList.remove("active");
        }
      });
    });
  });
  
  // Inline text editor actions
  const inlineCancel = document.getElementById("inline-editor-cancel");
  const inlineSave = document.getElementById("inline-editor-save");
  
  if (inlineCancel) inlineCancel.addEventListener("click", closeInlineEditorModal);
  if (inlineSave) inlineSave.addEventListener("click", saveInlineTextChanges);
  
  // Catalogue form triggers & cancels
  const addProductBtn = document.getElementById("cms-add-product-btn");
  const productFormCancel = document.getElementById("cms-product-form-cancel");
  const productFormClose = document.getElementById("product-editor-modal-close");
  
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => openProductFormModal());
  }
  if (productFormCancel) productFormCancel.addEventListener("click", closeProductFormModal);
  if (productFormClose) productFormClose.addEventListener("click", closeProductFormModal);
  
  // Local File Upload Event Listeners for Catalogue Form
  const uploadPrimary = document.getElementById("cms-upload-primary-btn");
  const uploadSecondary = document.getElementById("cms-upload-secondary-btn");
  
  if (uploadPrimary) {
    uploadPrimary.addEventListener("change", (e) => handleProductImageUpload(e, "cms-prod-image"));
  }
  if (uploadSecondary) {
    uploadSecondary.addEventListener("change", (e) => handleProductImageUpload(e, "cms-prod-secondaryImage"));
  }
  
  // Import/Export Actions listeners
  const exportBtn = document.getElementById("cms-export-btn");
  const importTrigger = document.getElementById("cms-import-trigger-btn");
  const fileInput = document.getElementById("cms-import-file-input");
  const resetBtn = document.getElementById("cms-reset-btn");
  const copyBtn = document.getElementById("cms-copy-json-btn");
  const logoutBtn = document.getElementById("cms-logout-btn");
  
  if (exportBtn) exportBtn.addEventListener("click", exportCmsSiteData);
  if (importTrigger) importTrigger.addEventListener("click", triggerCmsImportInput);
  if (fileInput) fileInput.addEventListener("change", handleCmsDataImport);
  if (resetBtn) resetBtn.addEventListener("click", resetStoreStateToDefaults);
  
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const textarea = document.getElementById("cms-json-data-textarea");
      if (textarea && textarea.value) {
        textarea.select();
        document.execCommand("copy");
        showToastNotification("JSON backup copied to clipboard.");
      } else {
        alert("Please click Export Site Data first to generate JSON content.");
      }
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      const confirmLogout = confirm("Are you sure you want to secure the Visual CMS and return to standard customer view?");
      if (confirmLogout) {
        disableCmsMode();
        showToastNotification("Logged out successfully.");
      }
    });
  }
  
  // Global variable bindings & color picker listeners
  setupColorPickerBindings();
}

// Convert uploaded local image files into base64 Data URLs for local persistence
function handleProductImageUpload(e, inputId) {
  const file = e.target.files[0];
  if (!file) return;
  
  if (file.size > 2.0 * 1024 * 1024) {
    alert("This image is rather large (over 2MB). To ensure your website saves correctly in LocalStorage, please consider uploading a smaller or compressed image.");
  }
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const input = document.getElementById(inputId);
    if (input) {
      input.value = event.target.result;
      showToastNotification("Local image converted and loaded.");
    }
  };
  reader.readAsDataURL(file);
}

// --- MATH COLOR HELPERS ---

// Darken a hex color dynamically by X percent
function darkenHexColor(hex, percent) {
  // strip hash
  hex = hex.replace(/^\s*#|\s*$/g, '');
  
  // parse r, g, b
  let r = parseInt(hex.substr(0, 2), 16);
  let g = parseInt(hex.substr(2, 2), 16);
  let b = parseInt(hex.substr(4, 2), 16);
  
  // calculate darkened values
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent / 100))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent / 100))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent / 100))));
  
  // reconstruct back to hex
  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
}
