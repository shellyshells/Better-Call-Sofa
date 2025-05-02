/**
 * API Client
 * 
 * Handles all API requests to the backend
 */

// API Base URL - Change this to match your backend URL
const API_BASE_URL = '/api';

// Storage keys
const STORAGE_KEYS = {
  CART_COUNT: 'bcs_cart_count',
  WISHLIST_COUNT: 'bcs_wishlist_count'
};

// API Client
const API = {
  /**
   * Products API
   */
  products: {
    // Get all products
    getAll: async function() {
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Get product by ID
    getById: async function(id) {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Search products
    search: async function(query) {
      try {
        const response = await fetch(`${API_BASE_URL}/products/search/query?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Filter products
    filter: async function(filters) {
      try {
        // Build query string
        const params = new URLSearchParams();
        
        if (filters.category) params.append('category', filters.category);
        if (filters.roomType) params.append('roomType', filters.roomType);
        if (filters.color) params.append('color', filters.color);
        if (filters.size) params.append('size', filters.size);
        if (filters.onSale) params.append('onSale', filters.onSale);
        
        const response = await fetch(`${API_BASE_URL}/products/filter/options?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Sort products
    sort: async function(sortBy) {
      try {
        const response = await fetch(`${API_BASE_URL}/products/sort/options?sortBy=${sortBy}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Get similar products
    getSimilar: async function(id) {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${id}/similar`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
  },
  
  /**
   * Cart API
   */
  cart: {
    // Get cart
    get: async function() {
      try {
        const response = await fetch(`${API_BASE_URL}/cart`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Add item to cart
    addItem: async function(productId, quantity = 1, color, size) {
      try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            productId,
            quantity,
            color,
            size
          })
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Update item quantity
    updateItem: async function(itemId, quantity) {
      try {
        const response = await fetch(`${API_BASE_URL}/cart/update/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity })
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Remove item from cart
    removeItem: async function(itemId) {
      try {
        const response = await fetch(`${API_BASE_URL}/cart/remove/${itemId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Clear cart
    clear: async function() {
      try {
        const response = await fetch(`${API_BASE_URL}/cart/clear`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Checkout
    checkout: async function(shippingAddress) {
      try {
        // Add payment processing logic here (mock implementation)
        // In a real app, this would interact with a payment gateway API
        console.log('Processing payment for order', shippingAddress);

        const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ shippingAddress })
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
  },
  
  /**
   * Wishlist API
   */
  wishlist: {
    // Get wishlist
    get: async function() {
      try {
        const response = await fetch(`${API_BASE_URL}/wishlist`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Add item to wishlist
    addItem: async function(productId) {
      try {
        const response = await fetch(`${API_BASE_URL}/wishlist/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId })
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Remove item from wishlist
    removeItem: async function(itemId) {
      try {
        const response = await fetch(`${API_BASE_URL}/wishlist/remove/${itemId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Update item priority
    updatePriority: async function(itemId, priority) {
      try {
        const response = await fetch(`${API_BASE_URL}/wishlist/priority/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ priority })
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Sort wishlist by priority
    sortByPriority: async function() {
      try {
        const response = await fetch(`${API_BASE_URL}/wishlist/sort`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    },
    
    // Clear wishlist
    clear: async function() {
      try {
        const response = await fetch(`${API_BASE_URL}/wishlist/clear`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
  },

  /**
   * Address API (mock implementation)
   */
  address: {
    // Search for addresses (mock implementation)
    search: async function(query) {
      return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
          // Generate mock addresses based on query
          const mockAddresses = [
            {
              id: '1',
              street: query + ' Main Street',
              city: 'New York',
              postalCode: '10001',
              country: 'United States'
            },
            {
              id: '2',
              street: query + ' Broadway Avenue',
              city: 'Chicago',
              postalCode: '60601',
              country: 'United States'
            },
            {
              id: '3',
              street: query + ' Market Street',
              city: 'San Francisco',
              postalCode: '94103',
              country: 'United States'
            }
          ];
          
          resolve(mockAddresses);
        }, 800);
      });
    }
  },
  
  /**
   * Local Storage API for caching
   */
  storage: {
    // Set cart count
    setCartCount: function(count) {
      localStorage.setItem(STORAGE_KEYS.CART_COUNT, count.toString());
    },
    
    // Get cart count
    getCartCount: function() {
      return localStorage.getItem(STORAGE_KEYS.CART_COUNT) || '0';
    },
    
    // Set wishlist count
    setWishlistCount: function(count) {
      localStorage.setItem(STORAGE_KEYS.WISHLIST_COUNT, count.toString());
    },
    
    // Get wishlist count
    getWishlistCount: function() {
      return localStorage.getItem(STORAGE_KEYS.WISHLIST_COUNT) || '0';
    },

    /**
     * Save address
     */
    saveAddress: function(address) {
      try {
        localStorage.setItem('bcs_saved_address', JSON.stringify(address));
        return true;
      } catch (error) {
        console.error('Error saving address to local storage:', error);
        return false;
      }
    },

    /**
     * Get saved address
     */
    getSavedAddress: function() {
      try {
        const savedAddress = localStorage.getItem('bcs_saved_address');
        return savedAddress ? JSON.parse(savedAddress) : null;
      } catch (error) {
        console.error('Error getting saved address from local storage:', error);
        return null;
      }
    },

    /**
     * Save payment info
     */
    savePaymentInfo: function(paymentInfo) {
      try {
        localStorage.setItem('bcs_saved_payment', JSON.stringify(paymentInfo));
        return true;
      } catch (error) {
        console.error('Error saving payment info to local storage:', error);
        return false;
      }
    },

    /**
     * Get saved payment info
     */
    getSavedPaymentInfo: function() {
      try {
        const savedPaymentInfo = localStorage.getItem('bcs_saved_payment');
        return savedPaymentInfo ? JSON.parse(savedPaymentInfo) : null;
      } catch (error) {
        console.error('Error getting saved payment info from local storage:', error);
        return null;
      }
    }
  }
};

// Export API
window.API = API;