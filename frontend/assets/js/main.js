/**
 * Main JavaScript file
 * 
 * Contains common functionality used across all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize header functionality
    initHeader();
    
    // Update cart and wishlist count badges
    updateCountBadges();
  });
  
  /**
   * Initialize header functionality
   */
  function initHeader() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle && nav) {
      menuToggle.addEventListener('click', function() {
        nav.classList.toggle('mobile-active');
      });
    }
    
    // Dropdown menus
    const categoriesDropdown = document.getElementById('categoriesDropdown');
    const roomsDropdown = document.getElementById('roomsDropdown');
    const categoriesMenu = document.getElementById('categoriesMenu');
    const roomsMenu = document.getElementById('roomsMenu');
    
    if (categoriesDropdown && categoriesMenu) {
      categoriesDropdown.addEventListener('click', function(e) {
        e.preventDefault();
        categoriesMenu.style.display = categoriesMenu.style.display === 'block' ? 'none' : 'block';
        
        if (roomsMenu) {
          roomsMenu.style.display = 'none';
        }
      });
    }
    
    if (roomsDropdown && roomsMenu) {
      roomsDropdown.addEventListener('click', function(e) {
        e.preventDefault();
        roomsMenu.style.display = roomsMenu.style.display === 'block' ? 'none' : 'block';
        
        if (categoriesMenu) {
          categoriesMenu.style.display = 'none';
        }
      });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (categoriesMenu && !categoriesDropdown.contains(e.target) && !categoriesMenu.contains(e.target)) {
        categoriesMenu.style.display = 'none';
      }
      
      if (roomsMenu && !roomsDropdown.contains(e.target) && !roomsMenu.contains(e.target)) {
        roomsMenu.style.display = 'none';
      }
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (searchInput && searchButton) {
      searchButton.addEventListener('click', function() {
        performSearch();
      });
      
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          performSearch();
        }
      });
    }
    
    // Sale link functionality
    const saleLink = document.getElementById('saleLink');
    
    if (saleLink) {
      saleLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '../index.html?onSale=true';
      });
    }
  }
  
  /**
   * Perform product search
   */
  function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query) {
      // If on homepage, filter products
      if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        // Search in current page if on homepage
        filterProductsOnPage(query);
      } else {
        // Redirect to homepage with search query
        window.location.href = `../index.html?search=${encodeURIComponent(query)}`;
      }
    }
  }
  
  /**
   * Filter products on homepage based on search query
   */
  function filterProductsOnPage(query) {
    // This is implemented in products.js
    if (typeof searchProducts === 'function') {
      searchProducts(query);
    }
  }
  
  /**
   * Update cart and wishlist count badges
   */
  function updateCountBadges() {
    updateCartCount();
    updateWishlistCount();
  }
  
  /**
   * Update cart count badge
   */
  async function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    
    if (cartCountElement) {
      try {
        const result = await API.cart.get();
        const count = result.items.length;
        
        cartCountElement.textContent = count;
        API.storage.setCartCount(count);
        
        // Show/hide badge
        if (count === 0) {
          cartCountElement.style.display = 'none';
        } else {
          cartCountElement.style.display = 'flex';
        }
      } catch (error) {
        // If API fails, use cached count
        const cachedCount = API.storage.getCartCount();
        cartCountElement.textContent = cachedCount;
        
        if (cachedCount === '0') {
          cartCountElement.style.display = 'none';
        } else {
          cartCountElement.style.display = 'flex';
        }
      }
    }
  }
  
  /**
   * Update wishlist count badge
   */
  async function updateWishlistCount() {
    const wishlistCountElement = document.getElementById('wishlistCount');
    
    if (wishlistCountElement) {
      try {
        const result = await API.wishlist.get();
        const count = result.length;
        
        wishlistCountElement.textContent = count;
        API.storage.setWishlistCount(count);
        
        // Show/hide badge
        if (count === 0) {
          wishlistCountElement.style.display = 'none';
        } else {
          wishlistCountElement.style.display = 'flex';
        }
      } catch (error) {
        // If API fails, use cached count
        const cachedCount = API.storage.getWishlistCount();
        wishlistCountElement.textContent = cachedCount;
        
        if (cachedCount === '0') {
          wishlistCountElement.style.display = 'none';
        } else {
          wishlistCountElement.style.display = 'flex';
        }
      }
    }
  }
  
  /**
   * Format price with currency
   */
  function formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }
  
  /**
   * Calculate discounted price
   */
  function calculateDiscountedPrice(price, discount) {
    return price * (1 - discount / 100);
  }
  
  /**
   * Get URL parameters
   */
  function getUrlParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    for (const [key, value] of urlParams) {
      params[key] = value;
    }
    
    return params;
  }
  
  /**
   * Show a notification message
   */
  function showNotification(message, type = 'success', duration = 3000) {
    // Check if notification container exists, create if not
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.className = 'notification-container';
      document.body.appendChild(notificationContainer);
      
      // Add styles
      notificationContainer.style.position = 'fixed';
      notificationContainer.style.bottom = '20px';
      notificationContainer.style.right = '20px';
      notificationContainer.style.zIndex = '1000';
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = message;
    
    // Add styles
    notification.style.backgroundColor = type === 'success' ? '#4caf50' : '#f44336';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.marginTop = '10px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    notification.style.transition = 'all 0.3s ease';
    notification.style.opacity = '0';
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
      notification.style.opacity = '0';
      
      setTimeout(() => {
        notificationContainer.removeChild(notification);
      }, 300);
    }, duration);
  }