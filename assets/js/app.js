/**
 * MODERNEASE - Interactive Product Showcase & Pinterest Integration
 * Products dataset is loaded from assets/js/products.js
 */

// App State
let currentCategory = "all";
let searchQuery = "";

// DOM Elements
const productsContainer = document.getElementById("productsGrid");
const productCountEl = document.getElementById("productCount");
const searchInput = document.getElementById("searchInput");
const categoryTabs = document.querySelectorAll(".category-tab");
const modalOverlay = document.getElementById("quickViewModal");
const toastNotice = document.getElementById("toastNotice");

// Helper: Generate Clean Star SVG Rating
function renderStarRating(rating, count) {
  return `
    <div class="product-rating">
      <div class="star-icons">
        <svg class="star-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <svg class="star-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <svg class="star-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <svg class="star-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <svg class="star-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <span class="rating-num">${rating}</span>
      <span class="reviews-count">(${count.toLocaleString()} reviews)</span>
    </div>
  `;
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Search
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderProducts();
  });

  // Category Tabs
  categoryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      categoryTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentCategory = tab.dataset.category;
      renderProducts();
    });
  });

  // Close Modal on click outside or escape
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// Render Products
function renderProducts() {
  const filtered = PRODUCTS.filter((item) => {
    const matchesCategory = currentCategory === "all" || item.category === currentCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery) ||
      item.categoryLabel.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  productCountEl.textContent = `${filtered.length} Curated Finds`;

  if (filtered.length === 0) {
    productsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <h3 style="font-size: 1.3rem; margin-bottom: 8px;">No finds found</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Try searching for another keyword or select "All Finds".</p>
      </div>
    `;
    return;
  }

  productsContainer.innerHTML = filtered
    .map(
      (p) => `
    <article class="product-card" id="card-${p.id}">
      <div class="product-image-wrap" onclick="openQuickView('${p.id}')" title="Click to view details">
        <span class="product-pill ${p.isViral ? "viral" : ""}">${p.badge}</span>
        <button class="btn-pin-overlay" title="Save to Pinterest" onclick="saveToPinterest('${p.id}', event)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
          </svg>
        </button>
        <img src="${p.image}" alt="${p.title}" class="product-img" loading="lazy" />
      </div>

      <div class="product-details">
        <span class="product-category-meta">${p.categoryLabel}</span>
        <h3 class="product-title" onclick="openQuickView('${p.id}')" title="${p.title}">${p.title}</h3>
        <p class="product-desc" onclick="openQuickView('${p.id}')">${p.description}</p>
        
        ${renderStarRating(p.rating, p.reviews)}

        <div class="product-footer">
          <a href="${p.affiliateUrl}" target="_blank" rel="noopener sponsored" class="btn-affiliate-shop" onclick="event.stopPropagation()">
            <span>Check Price</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <button class="btn-quick-view" title="Quick View" onclick="openQuickView('${p.id}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `
    )
    .join("");
}

// Pinterest Save Integration
function saveToPinterest(productId, event) {
  if (event) event.stopPropagation();

  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const currentUrl = window.location.href.split("#")[0];
  const pinUrl = encodeURIComponent(`${currentUrl}#card-${product.id}`);
  
  const imgUrl = product.image.startsWith("http") 
    ? encodeURIComponent(product.image) 
    : encodeURIComponent(new URL(product.image, window.location.href).href);

  const pinDesc = encodeURIComponent(
    `Viral Amazon Home Find: ${product.title}. Tap the link to check price and details on ModernEase.`
  );

  const pinterestShareUrl = `https://www.pinterest.com/pin/create/button/?url=${pinUrl}&media=${imgUrl}&description=${pinDesc}`;

  const popupWidth = 700;
  const popupHeight = 600;
  const left = window.screen.width / 2 - popupWidth / 2;
  const top = window.screen.height / 2 - popupHeight / 2;

  window.open(
    pinterestShareUrl,
    "PinIt",
    `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );

  showToast(`Opening Pinterest to save "${product.title}"`);
}

// Quick View Modal
function openQuickView(productId) {
  const p = PRODUCTS.find((item) => item.id === productId);
  if (!p) return;

  const contentCol = document.getElementById("modalContentCol");
  const imageCol = document.getElementById("modalImageCol");

  // Mendukung multi-foto galeri (atau fallback ke 1 foto utama jika belum ada)
  const gallery = (p.images && p.images.length > 0) ? p.images : [p.image];

  imageCol.innerHTML = `
    <div class="modal-gallery-container">
      <div class="modal-main-image-wrap">
        <img id="modalMainDisplayImg" src="${gallery[0]}" alt="${p.title}" />
        <span class="product-pill ${p.isViral ? "viral" : ""}" style="top: 16px; left: 16px;">${p.badge}</span>
        ${gallery.length > 1 ? `
          <div class="modal-gallery-counter" id="modalGalleryCounter">1 / ${gallery.length}</div>
        ` : ''}
      </div>
      ${gallery.length > 1 ? `
        <div class="modal-gallery-header">
          <span class="gallery-label">Product Gallery (${gallery.length} Angles)</span>
          <span class="gallery-hint">Click thumbnails to inspect</span>
        </div>
        <div class="modal-thumbs-row">
          ${gallery.map((img, idx) => `
            <button class="modal-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="switchModalPreview('${img}', this, ${idx + 1}, ${gallery.length})" title="View angle ${idx + 1}">
              <img src="${img}" alt="Angle ${idx + 1}" />
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  contentCol.innerHTML = `
    <span class="product-category-meta">${p.categoryLabel}</span>
    <h2 style="font-family: 'Playfair Display', serif; font-size: 1.6rem; margin-bottom: 12px; line-height: 1.25;">${p.title}</h2>
    
    ${renderStarRating(p.rating, p.reviews)}

    <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px;">
      ${p.description}
    </p>

    <div style="background: var(--bg-surface-soft); padding: 18px; border-radius: var(--radius-sm); margin-bottom: 24px;">
      <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; color: var(--text-main);">
        Key Features & Benefits:
      </h4>
      <ul style="padding-left: 20px; font-size: 0.88rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px;">
        ${p.bullets.map((b) => `<li>${b}</li>`).join("")}
      </ul>
    </div>

    <div style="display: flex; gap: 12px; margin-top: auto; padding-top: 16px;">
      <a href="${p.affiliateUrl}" target="_blank" rel="noopener sponsored" class="btn-affiliate-shop" style="padding: 14px 20px;">
        <span>Check Price on Amazon</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
      <button class="btn-pinterest-header" onclick="saveToPinterest('${p.id}')" style="padding: 14px 20px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
        </svg>
        <span>Save Pin</span>
      </button>
    </div>
  `;

  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function switchModalPreview(newImgSrc, btnEl, currentIdx, totalCount) {
  const mainImg = document.getElementById("modalMainDisplayImg");
  const counter = document.getElementById("modalGalleryCounter");
  if (mainImg) {
    mainImg.style.opacity = "0.25";
    setTimeout(() => {
      mainImg.src = newImgSrc;
      mainImg.style.opacity = "1";
    }, 120);
  }
  if (counter && currentIdx && totalCount) {
    counter.textContent = `${currentIdx} / ${totalCount}`;
  }
  document.querySelectorAll(".modal-thumb-btn").forEach((b) => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
}

function closeModal() {
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

// Toast Notification
function showToast(message) {
  toastNotice.textContent = message;
  toastNotice.classList.add("show");
  setTimeout(() => {
    toastNotice.classList.remove("show");
  }, 3200);
}
