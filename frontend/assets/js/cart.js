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
let paymentInfo = null;
let map;
let marker;
let geocoder;

document.addEventListener('DOMContentLoaded', function() {
  // Initialize cart page
  initCartPage();
  
  // Initialize map if element exists
  const mapElement = document.getElementById('map');
  if (mapElement) {
    initMap();
    
    // Set a minimum height for the map container
    mapElement.style.minHeight = '300px';
    
    // Add use current location button handler
    const useCurrentLocationBtn = document.getElementById('use-current-location');
    if (useCurrentLocationBtn) {
      useCurrentLocationBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function(position) {
              const userCoords = [position.coords.latitude, position.coords.longitude];
              map.setView(userCoords, 15);
              updateMarker(userCoords);
              reverseGeocode(userCoords[0], userCoords[1]);
            },
            function(error) {
              alert("Unable to get your location. Please enable location services.");
            }
          );
        } else {
          alert("Geolocation is not supported by your browser.");
        }
      });
    }
  }
});

/**
 * Initialize map
 */
function initMap() {
  try {
    // Default to Paris coordinates
    const defaultCoords = [48.8566, 2.3522];
    
    // Initialize map
    map = L.map('map', {
      tap: false, // Fixes touch issues on mobile
      zoomControl: true // Ensure zoom controls are visible
    }).setView(defaultCoords, 13);
    
    // Add tile layer - make sure URL is correct
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Add click event to map
    map.on('click', function(e) {
      updateMarker([e.latlng.lat, e.latlng.lng]);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });
    
    // Add initial marker
    updateMarker(defaultCoords);
    
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          const userCoords = [position.coords.latitude, position.coords.longitude];
          map.setView(userCoords, 15);
          updateMarker(userCoords);
          reverseGeocode(userCoords[0], userCoords[1]);
        },
        function(error) {
          console.log("Geolocation error:", error);
        },
        { timeout: 10000 } // 10 second timeout
      );
    }
    
    // Force map to resize in case it was hidden initially
    setTimeout(() => {
      map.invalidateSize();
    }, 250);
    
  } catch (error) {
    console.error("Map initialization failed:", error);
  }
}

/**
 * Update marker on map
 */
function updateMarker(coords) {
  if (marker) {
    map.removeLayer(marker);
  }
  marker = L.marker(coords).addTo(map);
}

/**
 * Reverse geocoding to get address from coordinates
 */
async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    
    if (data.address) {
      document.getElementById('address').value = data.address.road || '';
      document.getElementById('city').value = data.address.city || data.address.town || '';
      document.getElementById('postalCode').value = data.address.postcode || '';
      document.getElementById('country').value = data.address.country || '';
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
  }
}

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
  
  // Initialize payment form handlers
  initPaymentFormHandlers();
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
    
    // Make sure map is properly sized after becoming visible
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
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
  
  // Hide payment section as well
  const paymentSection = document.getElementById('paymentSection');
  if (paymentSection) {
    paymentSection.style.display = 'none';
  }
}

/**
 * Show payment section
 */
function showPaymentSection() {
  // Hide checkout section
  const checkoutSection = document.getElementById('checkoutSection');
  if (checkoutSection) {
    checkoutSection.style.display = 'none';
  }
  
  // Show payment section
  const paymentSection = document.getElementById('paymentSection');
  if (paymentSection) {
    paymentSection.style.display = 'block';
  }
  
  // Focus on first input
  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.focus();
  }
}

/**
 * Hide payment section
 */
function hidePaymentSection() {
  // Show checkout section
  const checkoutSection = document.getElementById('checkoutSection');
  if (checkoutSection) {
    checkoutSection.style.display = 'block';
    
    // Make sure map is properly sized after becoming visible again
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }
  
  // Hide payment section
  const paymentSection = document.getElementById('paymentSection');
  if (paymentSection) {
    paymentSection.style.display = 'none';
  }
}

/**
 * Validate shipping form
 */
function validateShippingForm() {
  const form = document.getElementById('checkoutForm');
  if (!form) return false;
  
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('error');
      isValid = false;
    } else {
      field.classList.remove('error');
    }
  });
  
  // Special validation for email field
  const emailInput = document.getElementById('email');
  if (emailInput && emailInput.value.trim()) {
    // Check if email format is valid
    if (!/^\S+@\S+\.\S+$/.test(emailInput.value)) {
      emailInput.classList.add('error');
      showNotification('Please enter a valid email address', 'error');
      isValid = false;
    } else {
      emailInput.classList.remove('error');
    }
  }
  
  if (!isValid) {
    showNotification('Please fill in all required fields correctly', 'error');
  }
  
  return isValid;
}

/**
 * Validate payment form
 */
function validatePaymentForm() {
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
  
  // If no payment method is selected
  if (!paymentMethod) {
    showNotification('Please select a payment method', 'error');
    return false;
  }
  
  if (paymentMethod.value === 'paypal') {
    const paypalForm = document.getElementById('paypalForm');
    if (!paypalForm || paypalForm.style.display === 'none') {
      showNotification('Please select PayPal as your payment method', 'error');
      return false;
    }
    
    const paypalEmail = document.getElementById('paypalEmail');
    if (!paypalEmail || !paypalEmail.value.trim() || !/^\S+@\S+\.\S+$/.test(paypalEmail.value)) {
      if (paypalEmail) {
        paypalEmail.classList.add('error');
      }
      showNotification('Please enter a valid PayPal email', 'error');
      return false;
    }
    
    if (paypalEmail) {
      paypalEmail.classList.remove('error');
    }
    return true;
  }
  
  // Credit card validation
  const cardNumber = document.getElementById('cardNumber');
  const cardName = document.getElementById('cardName');
  const expiryDate = document.getElementById('expiryDate');
  const cvv = document.getElementById('cvv');
  
  let isValid = true;
  
  // Validate card number (remove spaces)
  const cleanCardNumber = cardNumber.value.replace(/\s+/g, '');
  if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    cardNumber.classList.add('error');
    isValid = false;
  } else {
    cardNumber.classList.remove('error');
  }
  
  // Validate card name
  if (!cardName.value.trim()) {
    cardName.classList.add('error');
    isValid = false;
  } else {
    cardName.classList.remove('error');
  }
  
  // Validate expiry date (format MM/YY)
  const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!expiryPattern.test(expiryDate.value)) {
    expiryDate.classList.add('error');
    isValid = false;
  } else {
    // Check if date is in the future
    const [month, year] = expiryDate.value.split('/');
    const expiryDate20xx = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    
    if (expiryDate20xx <= now) {
      expiryDate.classList.add('error');
      showNotification('Your card expiry date must be after today', 'error');
      isValid = false;
    } else {
      expiryDate.classList.remove('error');
    }
  }
  
  // Validate CVV (3-4 digits)
  if (cvv.value.length < 3 || cvv.value.length > 4) {
    cvv.classList.add('error');
    isValid = false;
  } else {
    cvv.classList.remove('error');
  }
  
  if (!isValid) {
    showNotification('Please check your payment information', 'error');
  }
  
  return isValid;
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
    // Check if payment form is valid
    if (!validatePaymentForm()) {
      return;
    }
    
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
    
    // Get payment method
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Get payment details based on method
    let paymentDetails = {};
    
    if (paymentMethod === 'creditCard') {
      paymentDetails = {
        type: 'creditCard',
        cardNumber: document.getElementById('cardNumber').value.replace(/\s+/g, ''),
        cardName: document.getElementById('cardName').value,
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value
      };
    } else if (paymentMethod === 'paypal') {
      paymentDetails = {
        type: 'paypal',
        email: document.getElementById('paypalEmail').value || shippingAddress.email
      };
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
    
    // Save payment info if checkbox is checked
    const savePaymentInfoCheckbox = document.getElementById('savePaymentInfo');
    if (savePaymentInfoCheckbox && savePaymentInfoCheckbox.checked) {
      if (paymentMethod === 'creditCard') {
        const lastFour = paymentDetails.cardNumber.slice(-4);
        API.storage.savePaymentInfo({
          type: 'creditCard',
          lastFour,
          cardName: paymentDetails.cardName,
          expiryDate: paymentDetails.expiryDate
        });
      } else if (paymentMethod === 'paypal') {
        API.storage.savePaymentInfo({
          type: 'paypal',
          email: paymentDetails.email
        });
      }
    }
    
    // Process checkout - pass both shipping address and payment details
    const result = await API.cart.checkout({
      shippingAddress,
      paymentDetails // Include the actual payment details here
    });
    
    // Show order confirmation with all details
    showOrderConfirmation({
      shippingAddress,
      paymentDetails
    }, paymentMethod);
    
    // Update cart count
    updateCartCount();
    
    // Clear cart items locally
    cartItems = [];
    updateCartUI();
    
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


 function showOrderConfirmation(orderData, paymentMethod) {
  // Hide payment section
  const paymentSection = document.getElementById('paymentSection');
  if (paymentSection) {
    paymentSection.style.display = 'none';
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
  
  // Set payment method
  const paymentMethodText = paymentMethod === 'creditCard' ? 'Credit Card' : 'PayPal';
  document.getElementById('paymentMethod').textContent = paymentMethodText;
}

// Capitalize first letter of string

function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
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
    // Fix image path if needed
    itemImage.src = item.image;
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
  const paymentTotalElement = document.getElementById('paymentTotal');
  
  if (subtotalElement) {
    subtotalElement.textContent = formatPrice(subtotal);
  }
  
  if (discountElement) {
    discountElement.textContent = `-${formatPrice(discount)}`;
  }
  
  if (totalElement) {
    totalElement.textContent = formatPrice(cartTotal);
  }
  
  if (paymentTotalElement) {
    paymentTotalElement.textContent = formatPrice(cartTotal);
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
    
    // Continue to payment button
    if (e.target.closest('#continueToPaymentBtn')) {
      if (validateShippingForm()) {
        showPaymentSection();
      }
    }
    
    // Back to shipping button
    if (e.target.closest('#backToShippingBtn')) {
      hidePaymentSection();
    }
    
    // Search address button
    if (e.target.closest('#searchAddressBtn')) {
      const searchInput = document.getElementById('addressSearch');
      if (searchInput && searchInput.value.trim()) {
        await searchAddress(searchInput.value.trim());
      }
    }
    
    // Payment method selection
    if (e.target.closest('input[name="paymentMethod"]')) {
      const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
      togglePaymentForms(selectedMethod);
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
  
  // Payment form submit
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (validatePaymentForm()) {
        await placeOrder();
      }
    });
  }
}

/**
 * Initialize payment form handlers
 */
function initPaymentFormHandlers() {
  // Credit card number formatting - ONLY NUMBERS, MAX 19 DIGITS
  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      // Remove any non-digit characters
      let value = e.target.value.replace(/\D/g, '');
      
      // Limit to max 19 digits (for all card types)
      if (value.length > 19) {
        value = value.substring(0, 19);
      }
      
      // Format with spaces every 4 digits
      if (value.length > 0) {
        value = value.match(new RegExp('.{1,4}', 'g')).join(' ');
      }
      
      e.target.value = value;
      
      // Auto-detect card type
      detectCardType(value);
    });
    
    // Prevent non-numeric key presses
    cardNumberInput.addEventListener('keypress', function(e) {
      if (!/^\d*$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
        e.preventDefault();
      }
    });
  }
  
  // Card name - ONLY LETTERS AND SPACES
  const cardNameInput = document.getElementById('cardName');
  if (cardNameInput) {
    cardNameInput.addEventListener('input', function(e) {
      // Only allow letters and spaces
      e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
    });
    
    // Prevent non-letter and non-space key presses
    cardNameInput.addEventListener('keypress', function(e) {
      if (!/^[A-Za-z\s]*$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
        e.preventDefault();
      }
    });
  }
  
  // Expiry date formatting (MM/YY) - ONLY NUMBERS, MAX 4 DIGITS
  const expiryDateInput = document.getElementById('expiryDate');
  if (expiryDateInput) {
    expiryDateInput.addEventListener('input', function(e) {
      // Remove any non-digit characters
      let value = e.target.value.replace(/\D/g, '');
      
      // Limit to max 4 digits
      if (value.length > 4) {
        value = value.substring(0, 4);
      }
      
      // Format as MM/YY
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      
      e.target.value = value;
    });
    
    // Prevent non-numeric key presses
    expiryDateInput.addEventListener('keypress', function(e) {
      if (!/^\d*$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
        e.preventDefault();
      }
    });
  }
  
  // CVV input - ONLY NUMBERS, MAX 4 DIGITS
  const cvvInput = document.getElementById('cvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', function(e) {
      // Remove any non-digit characters
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });
    
    // Prevent non-numeric key presses
    cvvInput.addEventListener('keypress', function(e) {
      if (!/^\d*$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
        e.preventDefault();
      }
    });
  }

  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      // Remove any non-digit characters
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 15);
    });
    
    // Prevent non-numeric key presses
    phoneInput.addEventListener('keypress', function(e) {
      if (!/^\d*$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
        e.preventDefault();
      }
    });
  }

  const nameInput = document.getElementById('fullName');
  if (nameInput) {
    nameInput.addEventListener('input', function(e) {
      // Only allow letters and spaces
      e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
    });
    
    // Prevent non-letter and non-space key presses
    nameInput.addEventListener('keypress', function(e) {
      if (!/^[A-Za-z\s]*$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
        e.preventDefault();
      }
    });
  }

  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('input', function(e) {
      // Basic email validation - highlight error if invalid format
      if (emailInput.value && !/^\S+@\S+\.\S+$/.test(emailInput.value)) {
        emailInput.classList.add('error');
        // Add a custom validation message
        if (!emailInput.nextElementSibling || !emailInput.nextElementSibling.classList.contains('validation-message')) {
          const validationMsg = document.createElement('div');
          validationMsg.className = 'validation-message';
          validationMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please include an \'@\' in the email address.';
          emailInput.parentNode.insertBefore(validationMsg, emailInput.nextElementSibling);
        }
      } else {
        emailInput.classList.remove('error');
        // Remove validation message if exists
        if (emailInput.nextElementSibling && emailInput.nextElementSibling.classList.contains('validation-message')) {
          emailInput.nextElementSibling.remove();
        }
      }
    });
  }
}

/**
 * Detect credit card type based on number
 */
function detectCardType(number) {
  const cardIcons = document.querySelectorAll('.card-icons i');
  const visaPattern = /^4/;
  const mastercardPattern = /^5[1-5]/;
  const amexPattern = /^3[47]/;
  const discoverPattern = /^6(?:011|5)/;
  
  // Remove all active classes
  cardIcons.forEach(icon => icon.classList.remove('active'));
  
  // Clean the number
  const cleanNumber = number.replace(/\s+/g, '');
  
  // Check patterns and highlight the correct icon
  if (visaPattern.test(cleanNumber)) {
    document.querySelector('.card-icons .fa-cc-visa').classList.add('active');
  } else if (mastercardPattern.test(cleanNumber)) {
    document.querySelector('.card-icons .fa-cc-mastercard').classList.add('active');
  } else if (amexPattern.test(cleanNumber)) {
    document.querySelector('.card-icons .fa-cc-amex').classList.add('active');
  } else if (discoverPattern.test(cleanNumber)) {
    document.querySelector('.card-icons .fa-cc-discover').classList.add('active');
  }
}

/**
 * Toggle between payment method forms
 */
function togglePaymentForms(method) {
  const creditCardForm = document.getElementById('creditCardForm');
  const paypalForm = document.getElementById('paypalForm');

  const savePaymentInfoCheckbox = document.getElementById('savePaymentInfo');
  if (savePaymentInfoCheckbox) {
    savePaymentInfoCheckbox.checked = false; // Uncheck by default when switching methods
  } 
  if (method === 'creditCard') {
    if (creditCardForm) creditCardForm.style.display = 'block';
    if (paypalForm) paypalForm.style.display = 'none';
  } else if (method === 'paypal') {
    if (creditCardForm) creditCardForm.style.display = 'none';
    if (paypalForm) paypalForm.style.display = 'block';
    
    // Set focus on the PayPal email field
    const paypalEmail = document.getElementById('paypalEmail');
    if (paypalEmail) {
      paypalEmail.focus();
    }
  }
}