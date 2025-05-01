/**
 * Cart JavaScript file
 * 
 * Handles cart functionality
 */

// Global variables
let cartItems = [];
let cartTotal = 0;
let subtotal = 0;
let discount = 0;
let shippingAddress = null;

document.addEventListener('DOMContentLoaded', function() {
  // Initialize cart page
  initCartPage();
});

/**
 * Initialize cart page
 */
async function initCartPage() {
  // Load cart data
  await loadCart();
  
  // Add event listeners
  addCartEventListeners();
  
  // Check for saved address
  loadSavedAddress();
}

/**
 * Load cart data
 */
async function loadCart() {
  try {
    // Show loading
    document.getElementById('cartLoading').style.display = 'flex';
    document.getElementById('cartContent').style.display = 'none';
    
    // Fetch cart data
    const cartData = await API.cart.get();
    cartItems = cartData.items || [];
    cartTotal = cartData.total || 0;
    
    // Calculate subtotal and discount
    calculateCartTotals();
    
    // Update cart UI
    updateCartUI();
    
    // Hide loading, show content
    document.getElementById('cartLoading').style.display = 'none';
    document.getElementById('cartContent').style.display = 'block';
  } catch (error) {
    console.error('Error loading cart:', error);
    
    document.getElementById('cartLoading').style.display = 'none';
    document.getElementById('cartContent').style.display = 'block';
    document.getElementById('cartContent').innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load cart. Please try again later.</p>
        <button id="retryBtn" class="btn">Retry</button>
      </div>
    `;
    
    // Add retry button functionality
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', loadCart);
    }
  }
}

/**
 * Update cart UI
 */
function updateCartUI() {
  const cartItemsContainer = document.getElementById('cartItems');
  const emptyCart = document.getElementById('emptyCart');
  const cartSummary = document.getElementById('cartSummary');
  
  // If cart is empty
  if (cartItems.length === 0) {
    if (emptyCart) emptyCart.style.display = 'flex';
    if (cartItemsContainer) cartItemsContainer.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'none';
    return;
  }
  
  // Cart has items
  if (emptyCart) emptyCart.style.display = 'none';
  if (cartItemsContainer) cartItemsContainer.style.display = 'block';
  if (cartSummary) cartSummary.style.display = 'block';
  
  // Clear current items
  if (cartItemsContainer) {
    cartItemsContainer.innerHTML = '';
    
    // Get template
    const template = document.getElementById('cartItemTemplate');
    
    // Add cart items
    cartItems.forEach(item => {
      const itemElement = createCartItemElement(item, template);
      if (itemElement) {
        cartItemsContainer.appendChild(itemElement);
      }
    });
  }
  
  // Update totals
  updateCartTotals();
}

/**
 * Create cart item element
 */
function createCartItemElement(item, template) {
  if (!template) return null;
  
  // Clone template
  const itemElement = template.content.cloneNode(true);
  
  // Set item ID
  itemElement.querySelector('.cart-item').setAttribute('data-item-id', item.id);
  
  // Set image
  const itemImage = itemElement.querySelector('.item-image img');
  if (itemImage && item.image) {
    itemImage.src = `/backend/public${item.image}`;
    itemImage.alt = item.name;
  }
  
  // Set name
  const itemName = itemElement.querySelector('.item-name');
  if (itemName) {
    itemName.textContent = item.name;
  }
  
  // Set attributes
  const itemAttributes = itemElement.querySelector('.item-attributes');
  if (itemAttributes) {
    // Add color
    if (item.color) {
      const colorSpan = document.createElement('span');
      colorSpan.className = 'item-color';
      colorSpan.textContent = `Color: ${capitalizeFirstLetter(item.color)}`;
      itemAttributes.appendChild(colorSpan);
    }
    
    // Add size
    if (item.size) {
      const sizeSpan = document.createElement('span');
      sizeSpan.className = 'item-size';
      sizeSpan.textContent = `Size: ${item.size}`;
      itemAttributes.appendChild(sizeSpan);
    }
  }
  
  // Set prices
  const originalPrice = itemElement.querySelector('.original-price');
  const discountedPrice = itemElement.querySelector('.discounted-price');
  
  if (originalPrice && discountedPrice) {
    if (item.discount > 0) {
      const discountedValue = calculateDiscountedPrice(item.price, item.discount);
      
      originalPrice.textContent = formatPrice(item.price);
      discountedPrice.textContent = formatPrice(discountedValue);
    } else {
      originalPrice.style.display = 'none';
      discountedPrice.textContent = formatPrice(item.price);
    }
  }
  
  // Set quantity
  const quantityInput = itemElement.querySelector('.quantity-input');
  if (quantityInput) {
    quantityInput.value = item.quantity;
    quantityInput.setAttribute('data-item-id', item.id);
  }
  
  // Set total
  const itemTotal = itemElement.querySelector('.item-total');
  if (itemTotal) {
    const price = item.discount > 0 
      ? calculateDiscountedPrice(item.price, item.discount)
      : item.price;
    
    itemTotal.textContent = formatPrice(price * item.quantity);
  }
  
  // Set remove button
  const removeBtn = itemElement.querySelector('.remove-item');
  if (removeBtn) {
    removeBtn.setAttribute('data-item-id', item.id);
  }
  
  return itemElement;
}

/**
 * Calculate cart totals
 */
function calculateCartTotals() {
  subtotal = 0;
  discount = 0;
  
  cartItems.forEach(item => {
    const originalTotal = item.price * item.quantity;
    subtotal += originalTotal;
    
    if (item.discount > 0) {
      const discountAmount = originalTotal * (item.discount / 100);
      discount += discountAmount;
    }
  });
  
  cartTotal = subtotal - discount;
}

/**
 * Update cart totals in UI
 */
function updateCartTotals() {
  const subtotalElement = document.getElementById('subtotal');
  const discountElement = document.getElementById('discount');
  const totalElement = document.getElementById('total');
  
  if (subtotalElement) {
    subtotalElement.textContent = formatPrice(subtotal);
  }
  
  if (discountElement) {
    discountElement.textContent = `-${formatPrice(discount)}`;
  }
  
  if (totalElement) {
    totalElement.textContent = formatPrice(cartTotal);
  }
  
  // Update cart count badge
  updateCartCount();
}

/**
 * Add event listeners
 */
function addCartEventListeners() {
  // Event delegation for dynamic elements
  document.addEventListener('click', async function(e) {
    // Decrease quantity button
    if (e.target.closest('.quantity-btn.decrease')) {
      const btn = e.target.closest('.quantity-btn.decrease');
      const input = btn.nextElementSibling;
      const itemId = input.getAttribute('data-item-id');
      
      let quantity = parseInt(input.value);
      if (quantity > 1) {
        quantity--;
        input.value = quantity;
        await updateItemQuantity(itemId, quantity);
      }
    }
    
    // Increase quantity button
    if (e.target.closest('.quantity-btn.increase')) {
      const btn = e.target.closest('.quantity-btn.increase');
      const input = btn.previousElementSibling;
      const itemId = input.getAttribute('data-item-id');
      
      let quantity = parseInt(input.value);
      if (quantity < 99) {
        quantity++;
        input.value = quantity;
        await updateItemQuantity(itemId, quantity);
      }
    }
    
    // Remove item button
    if (e.target.closest('.remove-item')) {
      const btn = e.target.closest('.remove-item');
      const itemId = btn.getAttribute('data-item-id');
      
      if (itemId) {
        await removeCartItem(itemId);
      }
    }
    
    // Clear cart button
    if (e.target.closest('#clearCartBtn')) {
      if (confirm('Are you sure you want to clear your cart?')) {
        await clearCart();
      }
    }
    
    // Checkout button
    if (e.target.closest('#checkoutBtn')) {
      showCheckoutSection();
    }
    
    // Back to cart button
    if (e.target.closest('#backToCartBtn')) {
      hideCheckoutSection();
    }
    
    // Search address button
    if (e.target.closest('#searchAddressBtn')) {
      const searchInput = document.getElementById('addressSearch');
      if (searchInput && searchInput.value.trim()) {
        await searchAddress(searchInput.value.trim());
      }
    }
  });
  
  // Quantity input change
  document.addEventListener('change', async function(e) {
    if (e.target.classList.contains('quantity-input')) {
      const input = e.target;
      const itemId = input.getAttribute('data-item-id');
      
      let val = parseInt(input.value);
      
      // Validate value
      if (isNaN(val) || val < 1) {
        val = 1;
      } else if (val > 99) {
        val = 99;
      }
      
      input.value = val;
      
      if (itemId) {
        await updateItemQuantity(itemId, val);
      }
    }
  });
  
  // Address result click
  const addressResults = document.getElementById('addressResults');
  if (addressResults) {
    addressResults.addEventListener('click', function(e) {
      const addressItem = e.target.closest('.address-item');
      if (addressItem) {
        const addressId = addressItem.getAttribute('data-address-id');
        selectAddress(addressId);
      }
    });
  }
  
  // Checkout form submit
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      await placeOrder();
    });
  }
}

/**
 * Update item quantity
 */
async function updateItemQuantity(itemId, quantity) {
  try {
    // Update UI immediately for better UX
    const cartItem = document.querySelector(`.cart-item[data-item-id="${itemId}"]`);
    if (cartItem) {
      // Find the item in our cart array
      const item = cartItems.find(item => item.id === itemId);
      if (item) {
        // Update quantity
        item.quantity = quantity;
        
        // Update item total
        const price = item.discount > 0 
          ? calculateDiscountedPrice(item.price, item.discount)
          : item.price;
        
        const itemTotal = cartItem.querySelector('.item-total');
        if (itemTotal) {
          itemTotal.textContent = formatPrice(price * quantity);
        }
        
        // Update cart totals
        calculateCartTotals();
        updateCartTotals();
      }
    }
    
    // Update on server
    await API.cart.updateItem(itemId, quantity);
    
    // Refresh cart data
    const cartData = await API.cart.get();
    cartItems = cartData.items || [];
    cartTotal = cartData.total || 0;
    
    // Recalculate and update
    calculateCartTotals();
    updateCartTotals();
  } catch (error) {
    console.error('Error updating item quantity:', error);
    showNotification('Failed to update quantity', 'error');
    
    // Reload cart to ensure consistent state
    await loadCart();
  }
}

/**
 * Remove cart item
 */
async function removeCartItem(itemId) {
  try {
    // Remove from UI immediately for better UX
    const cartItem = document.querySelector(`.cart-item[data-item-id="${itemId}"]`);
    if (cartItem) {
      cartItem.remove();
      
      // Remove from our cart array
      cartItems = cartItems.filter(item => item.id !== itemId);
      
      // Update cart totals
      calculateCartTotals();
      updateCartTotals();
      
      // Show empty cart if needed
      if (cartItems.length === 0) {
        const emptyCart = document.getElementById('emptyCart');
        const cartItemsContainer = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        
        if (emptyCart) emptyCart.style.display = 'flex';
        if (cartItemsContainer) cartItemsContainer.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'none';
      }
    }
    
    // Remove on server
    await API.cart.removeItem(itemId);
    
    // Update cart count
    updateCartCount();
    
    showNotification('Item removed from cart', 'success');
  } catch (error) {
    console.error('Error removing item:', error);
    showNotification('Failed to remove item', 'error');
    
    // Reload cart to ensure consistent state
    await loadCart();
  }
}

/**
 * Clear cart
 */
async function clearCart() {
  try {
    // Clear UI immediately for better UX
    const emptyCart = document.getElementById('emptyCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if (emptyCart) emptyCart.style.display = 'flex';
    if (cartItemsContainer) {
      cartItemsContainer.style.display = 'none';
      cartItemsContainer.innerHTML = '';
    }
    if (cartSummary) cartSummary.style.display = 'none';
    
    // Clear our cart array
    cartItems = [];
    subtotal = 0;
    discount = 0;
    cartTotal = 0;
    
    // Clear on server
    await API.cart.clear();
    
    // Update cart count
    updateCartCount();
    
    showNotification('Cart cleared', 'success');
  } catch (error) {
    console.error('Error clearing cart:', error);
    showNotification('Failed to clear cart', 'error');
    
    // Reload cart to ensure consistent state
    await loadCart();
  }
}

/**
 * Show checkout section
 */
function showCheckoutSection() {
  // Hide cart section
  document.querySelector('.cart-section').style.display = 'none';
  
  // Show checkout section
  const checkoutSection = document.getElementById('checkoutSection');
  if (checkoutSection) {
    checkoutSection.style.display = 'block';
  }
  
  // Focus on first input
  const firstInput = document.getElementById('fullName');
  if (firstInput) {
    firstInput.focus();
  }
}

/**
 * Hide checkout section
 */
function hideCheckoutSection() {
  // Show cart section
  document.querySelector('.cart-section').style.display = 'block';
  
  // Hide checkout section
  const checkoutSection = document.getElementById('checkoutSection');
  if (checkoutSection) {
    checkoutSection.style.display = 'none';
  }
}

/**
 * Search for address
 */
async function searchAddress(query) {
  const addressResults = document.getElementById('addressResults');
  if (!addressResults) return;
  
  try {
    // Show loading
    addressResults.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
    addressResults.style.display = 'block';
    
    // Fetch addresses
    const addresses = await API.address.search(query);
    
    // If no results
    if (addresses.length === 0) {
      addressResults.innerHTML = '<div class="no-results">No addresses found</div>';
      return;
    }
    
    // Display results
    addressResults.innerHTML = '';
    
    addresses.forEach(address => {
      const addressItem = document.createElement('div');
      addressItem.className = 'address-item';
      addressItem.setAttribute('data-address-id', address.id);
      
      const fullAddress = `${address.street}, ${address.city}, ${address.postalCode}, ${address.country}`;
      addressItem.textContent = fullAddress;
      
      addressResults.appendChild(addressItem);
    });
  } catch (error) {
    console.error('Error searching addresses:', error);
    
    addressResults.innerHTML = '<div class="error">Failed to search addresses</div>';
  }
}

/**
 * Select address from search results
 */
function selectAddress(addressId) {
  // Hide results
  const addressResults = document.getElementById('addressResults');
  if (addressResults) {
    addressResults.style.display = 'none';
  }
  
  // Find selected address
  const addressItem = document.querySelector(`.address-item[data-address-id="${addressId}"]`);
  if (addressItem) {
    const fullAddress = addressItem.textContent;
    
    // Parse address
    const addressParts = fullAddress.split(', ');
    
    // Fill form fields
    document.getElementById('address').value = addressParts[0] || '';
    document.getElementById('city').value = addressParts[1] || '';
    document.getElementById('postalCode').value = addressParts[2] || '';
    document.getElementById('country').value = addressParts[3] || '';
  }
}

/**
 * Load saved address
 */
function loadSavedAddress() {
  const savedAddress = API.storage.getSavedAddress();
  
  if (savedAddress) {
    // Fill address fields
    document.getElementById('fullName').value = savedAddress.fullName || '';
    document.getElementById('email').value = savedAddress.email || '';
    document.getElementById('phone').value = savedAddress.phone || '';
    document.getElementById('address').value = savedAddress.address || '';
    document.getElementById('city').value = savedAddress.city || '';
    document.getElementById('postalCode').value = savedAddress.postalCode || '';
    document.getElementById('country').value = savedAddress.country || '';
    
    // Check save address checkbox
    document.getElementById('saveAddress').checked = true;
  }
}

/**
 * Place order
 */
async function placeOrder() {
  try {
    // Get shipping address
    const shippingAddress = {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      postalCode: document.getElementById('postalCode').value,
      country: document.getElementById('country').value
    };
    
    // Validate address
    if (!shippingAddress.fullName || !shippingAddress.email || !shippingAddress.phone || 
        !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || 
        !shippingAddress.country) {
      showNotification('Please fill in all address fields', 'error');
      return;
    }
    
    // Disable place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    
    // Save address if checkbox is checked
    const saveAddressCheckbox = document.getElementById('saveAddress');
    if (saveAddressCheckbox && saveAddressCheckbox.checked) {
      API.storage.saveAddress(shippingAddress);
    }
    
    // Process checkout
    const result = await API.cart.checkout(shippingAddress);
    
    // Show order confirmation
    showOrderConfirmation(result);
    
    // Update cart count
    updateCartCount();
  } catch (error) {
    console.error('Error placing order:', error);
    
    // Show error notification
    showNotification('Failed to place order. Please try again.', 'error');
    
    // Re-enable place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
      placeOrderBtn.disabled = false;
      placeOrderBtn.innerHTML = 'Place Order';
    }
  }
}

/**
 * Show order confirmation
 */
function showOrderConfirmation(orderData) {
  // Hide checkout section
  const checkoutSection = document.getElementById('checkoutSection');
  if (checkoutSection) {
    checkoutSection.style.display = 'none';
  }
  
  // Show confirmation section
  const orderConfirmation = document.getElementById('orderConfirmation');
  if (orderConfirmation) {
    orderConfirmation.style.display = 'block';
  }
  
  // Set order details
  document.getElementById('orderId').textContent = `BCS-${Date.now()}`;
  document.getElementById('orderDate').textContent = new Date().toLocaleDateString();
  
  const address = orderData.shippingAddress;
  document.getElementById('shippingAddress').textContent = 
    `${address.fullName}, ${address.address}, ${address.city}, ${address.postalCode}, ${address.country}`;
}

/**
 * Capitalize first letter of string
 */
function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}