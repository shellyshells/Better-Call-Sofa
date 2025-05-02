/**
 * Products JavaScript file
 * 
 * Handles product listing and filtering on the homepage
 */

// Global variables
let allProducts = []; // Store all products
let currentProducts = []; // Store currently displayed products
let currentPage = 1;
let productsPerPage = 12;
let currentFilters = {};
let totalPages = 1;

document.addEventListener('DOMContentLoaded', function() {
  // Initialize product page
  initProductPage();
});

/**
 * Initialize product page
 */
async function initProductPage() {
  // Initialize filters
  initFilters();
  
  // Load products
  await loadProducts();
  
  // Add event listeners for product interactions
  addProductEventListeners();
  
  // Check URL parameters for initial filters
  applyUrlFilters();
}

/**
 * Initialize filter functionality
 */
function initFilters() {
  // Sort dropdown
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      currentFilters.sortBy = this.value;
      applyFilters();
    });
  }
  
  // Category filter
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
      currentFilters.category = this.value;
      applyFilters();
    });
  }
  
  // Color filter
  const colorFilter = document.getElementById('colorFilter');
  if (colorFilter) {
    colorFilter.addEventListener('change', function() {
      currentFilters.color = this.value;
      applyFilters();
    });
  }
  
  // Price filter
  const priceFilter = document.getElementById('priceFilter');
  const priceValue = document.getElementById('priceValue');
  if (priceFilter && priceValue) {
    priceFilter.addEventListener('input', function() {
      priceValue.textContent = `$${this.value}`;
      
      // Debounce to improve performance
      clearTimeout(priceFilter.timeout);
      priceFilter.timeout = setTimeout(() => {
        currentFilters.maxPrice = this.value;
        applyFilters();
      }, 300);
    });
  }
  
  // Sale filter
  const saleFilter = document.getElementById('saleFilter');
  if (saleFilter) {
    saleFilter.addEventListener('change', function() {
      currentFilters.onSale = this.checked ? 'true' : '';
      applyFilters();
    });
  }
  
  // Category links in dropdown
  const categoryLinks = document.querySelectorAll('#categoriesMenu a');
  categoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const category = this.getAttribute('data-category');
      
      // Update category filter dropdown
      if (categoryFilter) {
        categoryFilter.value = category;
      }
      
      currentFilters.category = category;
      applyFilters();
    });
  });
  
  // Room links in dropdown
  const roomLinks = document.querySelectorAll('#roomsMenu a');
  roomLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const room = this.getAttribute('data-room');
      currentFilters.roomType = room;
      applyFilters();
    });
  });
  
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  if (prevPageBtn && nextPageBtn) {
    prevPageBtn.addEventListener('click', function() {
      if (currentPage > 1) {
        currentPage--;
        displayProducts();
      }
    });
    
    nextPageBtn.addEventListener('click', function() {
      if (currentPage < totalPages) {
        currentPage++;
        displayProducts();
      }
    });
  }
}

/**
 * Load products from API
 */
async function loadProducts() {
  try {
    const productGrid = document.getElementById('productGrid');
    
    if (productGrid) {
      // Show loading
      productGrid.innerHTML = `
        <div class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading products...</p>
        </div>
      `;
      
      // Fetch products
      allProducts = await API.products.getAll();
      currentProducts = [...allProducts];
      
      // Initialize display
      displayProducts();
    }
  } catch (error) {
    console.error('Error loading products:', error);
    
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load products. Please try again later.</p>
          <button id="retryBtn" class="btn">Retry</button>
        </div>
      `;
      
      // Add retry button functionality
      const retryBtn = document.getElementById('retryBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', loadProducts);
      }
    }
  }
}

/**
 * Display products in grid
 */
function displayProducts() {
  const productGrid = document.getElementById('productGrid');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const pageNumbersContainer = document.getElementById('pageNumbers');
  
  if (productGrid) {
    // Clear loading message if first page
    if (currentPage === 1) {
      productGrid.innerHTML = '';
    } else {
      productGrid.innerHTML = '';
    }
    
    // Calculate total pages
    totalPages = Math.ceil(currentProducts.length / productsPerPage);
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = currentProducts.slice(startIndex, endIndex);
    
    // Update pagination controls
    if (prevPageBtn && nextPageBtn && pageNumbersContainer) {
      // Previous button
      prevPageBtn.disabled = currentPage === 1;
      
      // Next button
      nextPageBtn.disabled = currentPage === totalPages;
      
      // Page numbers
      pageNumbersContainer.innerHTML = '';
      
      // Show max 5 page numbers around current page
      const maxVisiblePages = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust if we're at the end
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // First page
      if (startPage > 1) {
        const firstPageBtn = document.createElement('button');
        firstPageBtn.className = 'btn-page';
        firstPageBtn.textContent = '1';
        firstPageBtn.addEventListener('click', () => {
          currentPage = 1;
          displayProducts();
        });
        pageNumbersContainer.appendChild(firstPageBtn);
        
        if (startPage > 2) {
          const ellipsis = document.createElement('span');
          ellipsis.textContent = '...';
          pageNumbersContainer.appendChild(ellipsis);
        }
      }
      
      // Middle pages
      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `btn-page ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
          currentPage = i;
          displayProducts();
        });
        pageNumbersContainer.appendChild(pageBtn);
      }
      
      // Last page
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          const ellipsis = document.createElement('span');
          ellipsis.textContent = '...';
          pageNumbersContainer.appendChild(ellipsis);
        }
        
        const lastPageBtn = document.createElement('button');
        lastPageBtn.className = 'btn-page';
        lastPageBtn.textContent = totalPages;
        lastPageBtn.addEventListener('click', () => {
          currentPage = totalPages;
          displayProducts();
        });
        pageNumbersContainer.appendChild(lastPageBtn);
      }
    }
    
    // If no products found
    if (paginatedProducts.length === 0 && currentPage === 1) {
      productGrid.innerHTML = `
        <div class="no-products">
          <i class="fas fa-search"></i>
          <p>No products found matching your criteria.</p>
          <button id="clearFiltersBtn" class="btn">Clear Filters</button>
        </div>
      `;
      
      const clearFiltersBtn = document.getElementById('clearFiltersBtn');
      if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
          resetFilters();
        });
      }
      
      return;
    }
    
    // Create template
    const template = document.getElementById('productTemplate');
    
    // Append products
    paginatedProducts.forEach(product => {
      const productElement = createProductElement(product, template);
      if (productElement) {
        productGrid.appendChild(productElement);
      }
    });
  }
}
/**
 * Create product element
 */
function createProductElement(product, template) {
  if (!template) return null;
  
  // Clone template
  const productElement = template.content.cloneNode(true);
  
  // Calculate discounted price
  const originalPrice = product.price;
  const discountPercentage = product.discount;
  const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercentage);
  
  // Set images
  const mainImage = productElement.querySelector('.main-image');
  const hoverImage = productElement.querySelector('.hover-image');
  
  if (mainImage && product.images && product.images.length > 0) {
    mainImage.src = product.images[0].replace(/^\/public/, '/backend/public');
    mainImage.alt = product.name;
  }
  
  if (hoverImage && product.images && product.images.length > 1) {
    hoverImage.src = product.images[1].replace(/^\/public/, '/backend/public');
    hoverImage.alt = product.name;
  }
  
  // Set product name
  const nameElement = productElement.querySelector('.product-name');
  if (nameElement) {
    nameElement.textContent = product.name;
  }
  
  // Set prices
  const originalPriceElement = productElement.querySelector('.original-price');
  const discountedPriceElement = productElement.querySelector('.discounted-price');
  
  if (originalPriceElement && discountedPriceElement) {
    if (discountPercentage > 0) {
      originalPriceElement.textContent = formatPrice(originalPrice, product.currency);
      discountedPriceElement.textContent = formatPrice(discountedPrice, product.currency);
    } else {
      originalPriceElement.style.display = 'none';
      discountedPriceElement.textContent = formatPrice(originalPrice, product.currency);
    }
  }
  
  // Set discount badge
  const discountBadge = productElement.querySelector('.discount-badge');
  if (discountBadge) {
    if (discountPercentage > 0) {
      discountBadge.textContent = `-${discountPercentage}%`;
    } else {
      discountBadge.style.display = 'none';
    }
  }
  
  // Set action buttons URLs and data
  const viewDetailsLink = productElement.querySelector('.btn-view-details');
  if (viewDetailsLink) {
    viewDetailsLink.href = `pages/product-details.html?id=${product.id}`;
  }
  
  const addToCartBtn = productElement.querySelector('.btn-add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.setAttribute('data-product-id', product.id);
  }
  
  const addToWishlistBtn = productElement.querySelector('.btn-add-to-wishlist');
  if (addToWishlistBtn) {
    addToWishlistBtn.setAttribute('data-product-id', product.id);
  }
  
  return productElement;
}

/**
 * Add event listeners for product interactions
 */
function addProductEventListeners() {
  // Use event delegation for dynamic elements
  document.addEventListener('click', async function(e) {
    // Add to cart button
    if (e.target.closest('.btn-add-to-cart')) {
      const button = e.target.closest('.btn-add-to-cart');
      const productId = button.getAttribute('data-product-id');
      
      if (productId) {
        try {
          button.disabled = true;
          button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
          
          await API.cart.addItem(productId, 1);
          
          // Update cart count
          updateCartCount();
          
          button.innerHTML = '<i class="fas fa-check"></i> Added';
          setTimeout(() => {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
          }, 2000);
          
          showNotification('Product added to cart!', 'success');
        } catch (error) {
          console.error('Error adding to cart:', error);
          
          button.disabled = false;
          button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
          
          showNotification('Failed to add product to cart', 'error');
        }
      }
    }
    
    // Add to wishlist button
    if (e.target.closest('.btn-add-to-wishlist')) {
      const button = e.target.closest('.btn-add-to-wishlist');
      const productId = button.getAttribute('data-product-id');
      
      if (productId) {
        try {
          button.disabled = true;
          button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
          
          await API.wishlist.addItem(productId);
          
          // Update wishlist count
          updateWishlistCount();
          
          button.innerHTML = '<i class="fas fa-heart"></i>';
          setTimeout(() => {
            button.disabled = false;
            button.innerHTML = '<i class="far fa-heart"></i>';
          }, 2000);
          
          showNotification('Product added to wishlist!', 'success');
        } catch (error) {
          console.error('Error adding to wishlist:', error);
          
          button.disabled = false;
          button.innerHTML = '<i class="far fa-heart"></i>';
          
          // If product already in wishlist
          if (error.message && error.message.includes('already in wishlist')) {
            showNotification('Product already in wishlist', 'error');
          } else {
            showNotification('Failed to add product to wishlist', 'error');
          }
        }
      }
    }
  });
}

/**
 * Apply filters from URL parameters
 */
function applyUrlFilters() {
  const params = getUrlParams();
  
  // Initialize currentFilters with URL params
  if (params.category) {
    currentFilters.category = params.category;
    
    // Update category dropdown
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.value = params.category;
    }
  }
  
  if (params.color) {
    currentFilters.color = params.color;
    
    // Update color dropdown
    const colorFilter = document.getElementById('colorFilter');
    if (colorFilter) {
      colorFilter.value = params.color;
    }
  }
  
  if (params.roomType) {
    currentFilters.roomType = params.roomType;
  }
  
  if (params.maxPrice) {
    currentFilters.maxPrice = params.maxPrice;
    
    // Update price slider
    const priceFilter = document.getElementById('priceFilter');
    const priceValue = document.getElementById('priceValue');
    
    if (priceFilter && priceValue) {
      priceFilter.value = params.maxPrice;
      priceValue.textContent = `$${params.maxPrice}`;
    }
  }
  
  if (params.sortBy) {
    currentFilters.sortBy = params.sortBy;
    
    // Update sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.value = params.sortBy;
    }
  }
  
  if (params.onSale) {
    currentFilters.onSale = params.onSale;
    
    // Update sale checkbox
    const saleFilter = document.getElementById('saleFilter');
    if (saleFilter) {
      saleFilter.checked = params.onSale === 'true';
    }
  }
  
  if (params.search) {
    // Perform search
    searchProducts(params.search);
    
    // Update search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = params.search;
    }
  } else {
    // Apply filters if any
    if (Object.keys(currentFilters).length > 0) {
      applyFilters();
    }
  }
}

/**
 * Apply current filters
 */
async function applyFilters() {
  try {
    // Reset to page 1
    currentPage = 1;
    
    // Show loading
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Filtering products...</p>
        </div>
      `;
    }
    
    // Check if using API filter or client-side filter
    if (Object.keys(currentFilters).length === 1 && currentFilters.sortBy) {
      // Only sorting, use client-side
      currentProducts = [...allProducts];
      sortProducts(currentFilters.sortBy);
    } else if (
      currentFilters.category || 
      currentFilters.color || 
      currentFilters.roomType || 
      currentFilters.onSale
    ) {
      // Use API filter
      const result = await API.products.filter(currentFilters);
      currentProducts = result;
      
      // Apply client-side sorting if needed
      if (currentFilters.sortBy) {
        sortProducts(currentFilters.sortBy);
      }
      
      // Apply client-side price filter if needed
      if (currentFilters.maxPrice) {
        applyPriceFilter(currentFilters.maxPrice);
      }
    } else {
      // Reset to all products
      currentProducts = [...allProducts];
      
      // Apply client-side price filter if needed
      if (currentFilters.maxPrice) {
        applyPriceFilter(currentFilters.maxPrice);
      }
      
      // Apply client-side sorting if needed
      if (currentFilters.sortBy) {
        sortProducts(currentFilters.sortBy);
      }
    }
    
    // Update URL
    updateUrl();
    
    // Display filtered products
    displayProducts();
  } catch (error) {
    console.error('Error applying filters:', error);
    
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to filter products. Please try again later.</p>
          <button id="retryBtn" class="btn">Retry</button>
        </div>
      `;
      
      // Add retry button functionality
      const retryBtn = document.getElementById('retryBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => applyFilters());
      }
    }
  }
}

/**
 * Apply price filter (client-side)
 */
function applyPriceFilter(maxPrice) {
  if (maxPrice) {
    currentProducts = currentProducts.filter(product => {
      const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
      return discountedPrice <= parseFloat(maxPrice);
    });
  }
}

function createProductElement(product, template) {
  if (!template) return null;
  
  // Clone template
  const productElement = template.content.cloneNode(true);
  
  // Calculate discounted price
  const originalPrice = product.price;
  const discountPercentage = product.discount;
  const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercentage);
  
  // Set images
  const mainImage = productElement.querySelector('.main-image');
  const hoverImage = productElement.querySelector('.hover-image');
  
  if (mainImage && product.images && product.images.length > 0) {
    // Fix the image path by removing /backend from the beginning
    // The path should start with /public/ directly
    mainImage.src = product.images[0];
    mainImage.alt = product.name;
  }
  
  if (hoverImage && product.images && product.images.length > 1) {
    // Fix the image path for hover image as well
    hoverImage.src = product.images[1];
    hoverImage.alt = product.name;
  }
  
  // Set product name
  const nameElement = productElement.querySelector('.product-name');
  if (nameElement) {
    nameElement.textContent = product.name;
  }
  
  // Set prices
  const originalPriceElement = productElement.querySelector('.original-price');
  const discountedPriceElement = productElement.querySelector('.discounted-price');
  
  if (originalPriceElement && discountedPriceElement) {
    if (discountPercentage > 0) {
      originalPriceElement.textContent = formatPrice(originalPrice, product.currency);
      discountedPriceElement.textContent = formatPrice(discountedPrice, product.currency);
    } else {
      originalPriceElement.style.display = 'none';
      discountedPriceElement.textContent = formatPrice(originalPrice, product.currency);
    }
  }
  
  // Set discount badge
  const discountBadge = productElement.querySelector('.discount-badge');
  if (discountBadge) {
    if (discountPercentage > 0) {
      discountBadge.textContent = `-${discountPercentage}%`;
    } else {
      discountBadge.style.display = 'none';
    }
  }
  
  // Set action buttons URLs and data
  const viewDetailsLink = productElement.querySelector('.btn-view-details');
  if (viewDetailsLink) {
    viewDetailsLink.href = `pages/product-details.html?id=${product.id}`;
  }
  
  const addToCartBtn = productElement.querySelector('.btn-add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.setAttribute('data-product-id', product.id);
  }
  
  const addToWishlistBtn = productElement.querySelector('.btn-add-to-wishlist');
  if (addToWishlistBtn) {
    addToWishlistBtn.setAttribute('data-product-id', product.id);
  }
  
  return productElement;
}

/**
 * Sort products (client-side)
 */
function sortProducts(sortBy) {
  if (!sortBy || sortBy === 'default') return;
  
  switch (sortBy) {
    case 'price-asc':
      currentProducts.sort((a, b) => {
        const priceA = calculateDiscountedPrice(a.price, a.discount);
        const priceB = calculateDiscountedPrice(b.price, b.discount);
        return priceA - priceB;
      });
      break;
      
    case 'price-desc':
      currentProducts.sort((a, b) => {
        const priceA = calculateDiscountedPrice(a.price, a.discount);
        const priceB = calculateDiscountedPrice(b.price, b.discount);
        return priceB - priceA;
      });
      break;
      
    case 'name-asc':
      currentProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
      
    case 'name-desc':
      currentProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }
}

/**
 * Update URL with current filters
 */
function updateUrl() {
  const url = new URL(window.location.href);
  
  // Clear existing params
  url.search = '';
  
  // Add current filters
  Object.entries(currentFilters).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  // Update URL without reload
  window.history.replaceState({}, '', url);
}

/**
 * Reset all filters
 */
function resetFilters() {
  // Clear filters object
  currentFilters = {};
  
  // Reset UI elements
  const sortSelect = document.getElementById('sortSelect');
  const categoryFilter = document.getElementById('categoryFilter');
  const colorFilter = document.getElementById('colorFilter');
  const priceFilter = document.getElementById('priceFilter');
  const priceValue = document.getElementById('priceValue');
  const saleFilter = document.getElementById('saleFilter');
  
  if (sortSelect) sortSelect.value = 'default';
  if (categoryFilter) categoryFilter.value = '';
  if (colorFilter) colorFilter.value = '';
  if (priceFilter && priceValue) {
    priceFilter.value = priceFilter.max;
    priceValue.textContent = `$${priceFilter.max}`;
  }
  if (saleFilter) saleFilter.checked = false;
  
  // Reset products and page
  currentProducts = [...allProducts];
  currentPage = 1;
  
  // Update URL
  updateUrl();
  
  // Redisplay products
  displayProducts();
}

/**
 * Search products by query
 */
async function searchProducts(query) {
  if (!query) return;
  
  try {
    // Reset to page 1
    currentPage = 1;
    
    // Show loading
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Searching products...</p>
        </div>
      `;
    }
    
    // Perform search via API
    const result = await API.products.search(query);
    currentProducts = result;
    
    // Update URL
    const url = new URL(window.location.href);
    url.search = `search=${encodeURIComponent(query)}`;
    window.history.replaceState({}, '', url);
    
    // Display search results
    displayProducts();
  } catch (error) {
    console.error('Error searching products:', error);
    
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
      productGrid.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to search products. Please try again later.</p>
          <button id="retryBtn" class="btn">Retry</button>
        </div>
      `;
      
      // Add retry button functionality
      const retryBtn = document.getElementById('retryBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => searchProducts(query));
      }
    }
  }
}