/**
 * Wishlist JavaScript file
 * 
 * Handles wishlist functionality
 */

// Global variables
let wishlistItems = [];
let draggedItem = null;

document.addEventListener('DOMContentLoaded', function() {
  // Initialize wishlist page
  initWishlistPage();
});

/**
 * Initialize wishlist page
 */
async function initWishlistPage() {
  // Load wishlist data
  await loadWishlist();
  
  // Add event listeners
  addWishlistEventListeners();
  
  // Initialize drag and drop
  initDragAndDrop();
}

/**
 * Load wishlist data
 */
async function loadWishlist() {
  try {
    // Show loading
    document.getElementById('wishlistLoading').style.display = 'flex';
    document.getElementById('wishlistContent').style.display = 'none';
    
    // Fetch wishlist data
    wishlistItems = await API.wishlist.get();
    
    // Update wishlist UI
    updateWishlistUI();
    
    // Hide loading, show content
    document.getElementById('wishlistLoading').style.display = 'none';
    document.getElementById('wishlistContent').style.display = 'block';
  } catch (error) {
    console.error('Error loading wishlist:', error);
    
    document.getElementById('wishlistLoading').style.display = 'none';
    document.getElementById('wishlistContent').style.display = 'block';
    document.getElementById('wishlistContent').innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load wishlist. Please try again later.</p>
        <button id="retryBtn" class="btn">Retry</button>
      </div>
    `;
    
    // Add retry button functionality
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', loadWishlist);
    }
  }
}

/**
 * Update wishlist UI
 */
function updateWishlistUI() {
  const wishlistItemsContainer = document.getElementById('wishlistItems');
  const emptyWishlist = document.getElementById('emptyWishlist');
  const wishlistActions = document.getElementById('wishlistActions');
  
  // If wishlist is empty
  if (wishlistItems.length === 0) {
    if (emptyWishlist) emptyWishlist.style.display = 'flex';
    if (wishlistItemsContainer) wishlistItemsContainer.style.display = 'none';
    if (wishlistActions) wishlistActions.style.display = 'none';
    return;
  }
  
  // Wishlist has items
  if (emptyWishlist) emptyWishlist.style.display = 'none';
  if (wishlistItemsContainer) wishlistItemsContainer.style.display = 'block';
  if (wishlistActions) wishlistActions.style.display = 'flex';
  
  // Clear current items
  if (wishlistItemsContainer) {
    wishlistItemsContainer.innerHTML = '';
    
    // Sort by priority if needed
    wishlistItems.sort((a, b) => a.priority - b.priority);
    
    // Create wishlist items
    wishlistItems.forEach((item, index) => {
      const itemElement = createWishlistItemElement(item, index + 1);
      if (itemElement) {
        wishlistItemsContainer.appendChild(itemElement);
      }
    });
  }
  
  // Update wishlist count
  updateWishlistCount();
}

/**
 * Create wishlist item element
 */
function createWishlistItemElement(item, priorityNumber) {
  // Get template
  const template = document.getElementById('wishlistItemTemplate');
  if (!template) return null;
  
  // Clone template
  const itemElement = template.content.cloneNode(true);
  
  // Set item ID
  itemElement.querySelector('.wishlist-item').setAttribute('data-item-id', item.id);
  itemElement.querySelector('.wishlist-item').setAttribute('data-priority', item.priority);
  
  // Set priority number
  const priorityNumberElement = itemElement.querySelector('.priority-number');
  if (priorityNumberElement) {
    priorityNumberElement.textContent = priorityNumber;
  }
  
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
  
  // Set action buttons
  const addToCartBtn = itemElement.querySelector('.add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.setAttribute('data-product-id', item.productId);
  }
  
  const viewDetailsBtn = itemElement.querySelector('.view-details-btn');
  if (viewDetailsBtn) {
    viewDetailsBtn.href = `product-details.html?id=${item.productId}`;
  }
  
  const removeItemBtn = itemElement.querySelector('.remove-item-btn');
  if (removeItemBtn) {
    removeItemBtn.setAttribute('data-item-id', item.id);
  }
  
  return itemElement;
}

/**
 * Add event listeners
 */
function addWishlistEventListeners() {
  // Event delegation for dynamic elements
  document.addEventListener('click', async function(e) {
    // Remove item button
    if (e.target.closest('.remove-item-btn')) {
      const btn = e.target.closest('.remove-item-btn');
      const itemId = btn.getAttribute('data-item-id');
      
      if (itemId) {
        await removeWishlistItem(itemId);
      }
    }
    
    // Add to cart button
    if (e.target.closest('.add-to-cart-btn')) {
      const btn = e.target.closest('.add-to-cart-btn');
      const productId = btn.getAttribute('data-product-id');
      
      if (productId) {
        await addToCart(productId, btn);
      }
    }
    
    // Sort by priority button
    if (e.target.closest('#sortByPriorityBtn')) {
      await sortByPriority();
    }
    
    // Clear wishlist button
    if (e.target.closest('#clearWishlistBtn')) {
      if (confirm('Are you sure you want to clear your wishlist?')) {
        await clearWishlist();
      }
    }
  });
}

/**
 * Initialize drag and drop for priority sorting
 */
function initDragAndDrop() {
  const wishlistItems = document.getElementById('wishlistItems');
  if (!wishlistItems) return;
  
  // Add dragstart event listener to items
  wishlistItems.addEventListener('dragstart', function(e) {
    const item = e.target.closest('.wishlist-item');
    if (!item) return;
    
    draggedItem = item;
    
    // Add drag styling
    setTimeout(() => {
      item.classList.add('dragging');
    }, 0);
  });
  
  // Add dragend event listener to items
  wishlistItems.addEventListener('dragend', function(e) {
    const item = e.target.closest('.wishlist-item');
    if (!item) return;
    
    // Remove drag styling
    item.classList.remove('dragging');
    draggedItem = null;
  });
  
  // Add dragover event listener to container
  wishlistItems.addEventListener('dragover', function(e) {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    // Get all items that are not being dragged
    const items = [...wishlistItems.querySelectorAll('.wishlist-item:not(.dragging)')];
    
    // Find the item we're hovering over
    const afterElement = items.reduce((closest, item) => {
      const box = item.getBoundingClientRect();
      const offset = e.clientY - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: item };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
    
    // Insert before afterElement or at end if null
    if (afterElement) {
      wishlistItems.insertBefore(draggedItem, afterElement);
    } else {
      wishlistItems.appendChild(draggedItem);
    }
  });
  
  // Add drop event listener to container
  wishlistItems.addEventListener('drop', function(e) {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    // Update priorities after drag
    updatePrioritiesAfterDrag();
  });
}

/**
 * Update priorities after drag and drop
 */
async function updatePrioritiesAfterDrag() {
  try {
    // Get all items in new order
    const items = document.querySelectorAll('.wishlist-item');
    
    // Update priorities in UI
    items.forEach((item, index) => {
      const priorityNumber = item.querySelector('.priority-number');
      if (priorityNumber) {
        priorityNumber.textContent = index + 1;
      }
      
      // Update data attribute
      item.setAttribute('data-priority', index + 1);
    });
    
    // Update priorities on server one by one
    const updatePromises = Array.from(items).map((item, index) => {
      const itemId = item.getAttribute('data-item-id');
      return API.wishlist.updatePriority(itemId, index + 1);
    });
    
    await Promise.all(updatePromises);
    
    // Refresh wishlist data
    await loadWishlist();
  } catch (error) {
    console.error('Error updating priorities:', error);
    showNotification('Failed to update priorities', 'error');
  }
}

/**
 * Remove wishlist item
 */
async function removeWishlistItem(itemId) {
  try {
    // Remove from UI immediately for better UX
    const wishlistItem = document.querySelector(`.wishlist-item[data-item-id="${itemId}"]`);
    if (wishlistItem) {
      wishlistItem.remove();
      
      // Remove from our wishlist array
      wishlistItems = wishlistItems.filter(item => item.id !== itemId);
      
      // Show empty wishlist if needed
      if (wishlistItems.length === 0) {
        const emptyWishlist = document.getElementById('emptyWishlist');
        const wishlistItemsContainer = document.getElementById('wishlistItems');
        const wishlistActions = document.getElementById('wishlistActions');
        
        if (emptyWishlist) emptyWishlist.style.display = 'flex';
        if (wishlistItemsContainer) wishlistItemsContainer.style.display = 'none';
        if (wishlistActions) wishlistActions.style.display = 'none';
      } else {
        // Update priorities
        updatePrioritiesAfterRemove();
      }
      
      // Update wishlist count
      updateWishlistCount();
    }
    
    // Remove on server
    await API.wishlist.removeItem(itemId);
    
    showNotification('Item removed from wishlist', 'success');
  } catch (error) {
    console.error('Error removing item:', error);
    showNotification('Failed to remove item', 'error');
    
    // Reload wishlist to ensure consistent state
    await loadWishlist();
  }
}

/**
 * Update priorities after item removal
 */
function updatePrioritiesAfterRemove() {
  // Get all items
  const items = document.querySelectorAll('.wishlist-item');
  
  // Update priorities in UI
  items.forEach((item, index) => {
    const priorityNumber = item.querySelector('.priority-number');
    if (priorityNumber) {
      priorityNumber.textContent = index + 1;
    }
  });
}

/**
 * Add to cart
 */
async function addToCart(productId, button) {
  try {
    // Disable button
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    
    // Add to cart
    await API.cart.addItem(productId, 1);
    
    // Update button
    button.innerHTML = '<i class="fas fa-check"></i> Added';
    setTimeout(() => {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
    }, 2000);
    
    // Update cart count
    updateCartCount();
    
    showNotification('Product added to cart', 'success');
  } catch (error) {
    console.error('Error adding to cart:', error);
    
    // Reset button
    button.disabled = false;
    button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
    
    showNotification('Failed to add product to cart', 'error');
  }
}

/**
 * Sort by priority
 */
async function sortByPriority() {
  try {
    // Show loading
    const wishlistItemsContainer = document.getElementById('wishlistItems');
    if (wishlistItemsContainer) {
      wishlistItemsContainer.innerHTML = `
        <div class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Sorting wishlist...</p>
        </div>
      `;
    }
    
    // Sort on server
    await API.wishlist.sortByPriority();
    
    // Reload wishlist
    await loadWishlist();
    
    showNotification('Wishlist sorted by priority', 'success');
  } catch (error) {
    console.error('Error sorting wishlist:', error);
    showNotification('Failed to sort wishlist', 'error');
    
    // Reload wishlist to ensure consistent state
    await loadWishlist();
  }
}

/**
 * Clear wishlist
 */
async function clearWishlist() {
  try {
    // Clear UI immediately for better UX
    const emptyWishlist = document.getElementById('emptyWishlist');
    const wishlistItemsContainer = document.getElementById('wishlistItems');
    const wishlistActions = document.getElementById('wishlistActions');
    
    if (emptyWishlist) emptyWishlist.style.display = 'flex';
    if (wishlistItemsContainer) {
      wishlistItemsContainer.style.display = 'none';
      wishlistItemsContainer.innerHTML = '';
    }
    if (wishlistActions) wishlistActions.style.display = 'none';
    
    // Clear our wishlist array
    wishlistItems = [];
    
    // Clear on server
    await API.wishlist.clear();
    
    // Update wishlist count
    updateWishlistCount();
    
    showNotification('Wishlist cleared', 'success');
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    showNotification('Failed to clear wishlist', 'error');
    
    // Reload wishlist to ensure consistent state
    await loadWishlist();
  }
}