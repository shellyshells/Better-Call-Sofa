/**
 * Product Details JavaScript file
 * 
 * Handles the product details page functionality
 */

// Global variables
let currentProduct = null;
let selectedColor = null;
let selectedSize = null;
let currentImageIndex = 0;
let productImages = [];

document.addEventListener('DOMContentLoaded', function() {
  // Initialize product details page
  initProductDetailsPage();
});

/**
 * Initialize product details page
 */
async function initProductDetailsPage() {
  // Get product ID from URL
  const params = getUrlParams();
  const productId = params.id;
  
  if (!productId) {
    showError('Product ID not provided');
    return;
  }
  
  // Load product details
  await loadProductDetails(productId);
  
  // Initialize image gallery
  initImageGallery();
  
  // Add event listeners
  addEventListeners();
  
  // Load similar products
  loadSimilarProducts(productId);
}

/**
 * Load product details
 */
async function loadProductDetails(productId) {
  try {
    // Show loading
    document.getElementById('productLoading').style.display = 'flex';
    document.getElementById('productContainer').style.display = 'none';
    
    // Fetch product details
    currentProduct = await API.products.getById(productId);
    
    // If product not found
    if (!currentProduct) {
      showError('Product not found');
      return;
    }
    
    // Update product details in UI
    updateProductDetails();
    
    // Hide loading, show content
    document.getElementById('productLoading').style.display = 'none';
    document.getElementById('productContainer').style.display = 'grid';
  } catch (error) {
    console.error('Error loading product details:', error);
    showError('Failed to load product details');
  }
}

/**
 * Update product details in UI
 */
function updateProductDetails() {
  if (!currentProduct) return;
  
  // Update breadcrumbs
  const categoryBreadcrumb = document.getElementById('categoryBreadcrumb');
  const productBreadcrumb = document.getElementById('productBreadcrumb');
  
  if (categoryBreadcrumb) {
    categoryBreadcrumb.textContent = capitalizeFirstLetter(currentProduct.category);
    categoryBreadcrumb.href = `../index.html?category=${currentProduct.category}`;
  }
  
  if (productBreadcrumb) {
    productBreadcrumb.textContent = currentProduct.name;
  }
  
  // Update product name
  const productName = document.getElementById('productName');
  if (productName) {
    productName.textContent = currentProduct.name;
  }
  
  // Update prices
  const originalPrice = document.getElementById('originalPrice');
  const discountedPrice = document.getElementById('discountedPrice');
  const discountBadge = document.getElementById('discountBadge');
  
  if (originalPrice && discountedPrice && discountBadge) {
    if (currentProduct.discount > 0) {
      const discountedValue = calculateDiscountedPrice(currentProduct.price, currentProduct.discount);
      
      originalPrice.textContent = formatPrice(currentProduct.price, currentProduct.currency);
      discountedPrice.textContent = formatPrice(discountedValue, currentProduct.currency);
      discountBadge.textContent = `-${currentProduct.discount}%`;
      discountBadge.style.display = 'block';
    } else {
      originalPrice.style.display = 'none';
      discountedPrice.textContent = formatPrice(currentProduct.price, currentProduct.currency);
      discountBadge.style.display = 'none';
    }
  }
  
  // Update availability
  const availability = document.getElementById('availability');
  if (availability) {
    if (currentProduct.stock > 10) {
      availability.className = 'availability in-stock';
      availability.innerHTML = `<i class="fas fa-check-circle"></i> In Stock (${currentProduct.stock} available)`;
    } else if (currentProduct.stock > 0) {
      availability.className = 'availability low-stock';
      availability.innerHTML = `<i class="fas fa-exclamation-circle"></i> Low Stock (Only ${currentProduct.stock} left)`;
    } else {
      availability.className = 'availability out-of-stock';
      availability.innerHTML = `<i class="fas fa-times-circle"></i> Out of Stock`;
    }
  }
  
  // Update description
  const shortDescription = document.getElementById('shortDescription');
  const fullDescription = document.getElementById('fullDescription');
  const readMoreBtn = document.getElementById('readMoreBtn');
  
  if (shortDescription && fullDescription && readMoreBtn) {
    const description = currentProduct.description;
    
    // Truncate to 150 characters
    if (description.length > 150) {
      shortDescription.textContent = description.substring(0, 150) + '...';
      fullDescription.textContent = description;
      
      readMoreBtn.style.display = 'inline-block';
      readMoreBtn.addEventListener('click', function() {
        shortDescription.style.display = 'none';
        fullDescription.style.display = 'block';
        readMoreBtn.style.display = 'none';
      });
    } else {
      shortDescription.textContent = description;
      readMoreBtn.style.display = 'none';
    }
  }
  
  // Update color options
  const colorOptionsContainer = document.getElementById('colorOptions');
  if (colorOptionsContainer && currentProduct.colors) {
    colorOptionsContainer.innerHTML = '';
    
    currentProduct.colors.forEach(color => {
      const colorOption = document.createElement('div');
      colorOption.className = 'color-option';
      colorOption.setAttribute('data-color', color);
      colorOption.style.backgroundColor = getColorHex(color);
      
      // Set first color as default
      if (!selectedColor) {
        selectedColor = color;
        colorOption.classList.add('active');
      }
      
      colorOption.addEventListener('click', function() {
        // Update selected color
        selectedColor = color;
        
        // Update active class
        document.querySelectorAll('.color-option').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        
        // Update images based on color
        updateImagesForColor(color);
      });
      
      colorOptionsContainer.appendChild(colorOption);
    });
  }
  
  // Update size options
  const sizeOptionsContainer = document.getElementById('sizeOptions');
  if (sizeOptionsContainer && currentProduct.sizes) {
    sizeOptionsContainer.innerHTML = '';
    
    currentProduct.sizes.forEach(size => {
      const sizeOption = document.createElement('div');
      sizeOption.className = 'size-option';
      sizeOption.setAttribute('data-size', size);
      sizeOption.textContent = size;
      
      // Set first size as default
      if (!selectedSize) {
        selectedSize = size;
        sizeOption.classList.add('active');
      }
      
      sizeOption.addEventListener('click', function() {
        // Update selected size
        selectedSize = size;
        
        // Update active class
        document.querySelectorAll('.size-option').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
      });
      
      sizeOptionsContainer.appendChild(sizeOption);
    });
  }
  
  // Update attributes list
  const attributesList = document.getElementById('attributesList');
  if (attributesList) {
    attributesList.innerHTML = '';
    
    // Add category
    const categoryItem = document.createElement('li');
    categoryItem.textContent = `Category: ${capitalizeFirstLetter(currentProduct.category)}`;
    attributesList.appendChild(categoryItem);
    
    // Add room type
    const roomItem = document.createElement('li');
    roomItem.textContent = `Room: ${capitalizeFirstLetter(currentProduct.roomType)}`;
    attributesList.appendChild(roomItem);
    
    // Add material
    const materialItem = document.createElement('li');
    materialItem.textContent = `Material: ${capitalizeFirstLetter(currentProduct.material)}`;
    attributesList.appendChild(materialItem);
    
    // Add available colors
    const colorsItem = document.createElement('li');
    colorsItem.textContent = `Available Colors: ${currentProduct.colors.map(color => capitalizeFirstLetter(color)).join(', ')}`;
    attributesList.appendChild(colorsItem);
    
    // Add available sizes
    const sizesItem = document.createElement('li');
    sizesItem.textContent = `Available Sizes: ${currentProduct.sizes.map(size => size).join(', ')}`;
    attributesList.appendChild(sizesItem);
  }
  
  // Set up image gallery
  setupImageGallery();
}

/**
 * Initialize image gallery
 */
function initImageGallery() {
  // Add event listeners for gallery navigation
  const prevButton = document.querySelector('.gallery-nav.prev');
  const nextButton = document.querySelector('.gallery-nav.next');
  
  if (prevButton && nextButton) {
    prevButton.addEventListener('click', () => navigateGallery('prev'));
    nextButton.addEventListener('click', () => navigateGallery('next'));
  }
}

/**
 * Set up image gallery with product images
 */
function setupImageGallery() {
  if (!currentProduct || !currentProduct.images) return;
  
  // Filter images for selected color
  updateImagesForColor(selectedColor || currentProduct.colors[0]);
}

/**
 * Update gallery images for selected color
 */
function updateImagesForColor(color) {
  if (!currentProduct || !currentProduct.images) return;
  
  // Filter images for selected color
  productImages = currentProduct.images.filter(img => img.includes(`/${color}/`));
  
  // If no images for this color, use all images
  if (productImages.length === 0) {
    productImages = currentProduct.images;
  }
  
  // Reset current index
  currentImageIndex = 0;
  
  // Update main image
  updateMainImage();
  
  // Update thumbnails
  updateThumbnails();
}

/**
 * Update main image in gallery
 */
function updateMainImage() {
  const mainImageContainer = document.getElementById('mainImageContainer');
  if (!mainImageContainer) return;
  
  // Clear container
  mainImageContainer.innerHTML = '';
  
  // Create and add image
  if (productImages.length > 0) {
    const img = document.createElement('img');
    img.src = `/backend/public${productImages[currentImageIndex]}`;
    img.alt = currentProduct.name;
    mainImageContainer.appendChild(img);
  }
}

/**
 * Update thumbnail gallery
 */
function updateThumbnails() {
  const thumbnailGallery = document.getElementById('thumbnailGallery');
  if (!thumbnailGallery) return;
  
  // Clear gallery
  thumbnailGallery.innerHTML = '';
  
  // Add thumbnails
  productImages.forEach((imagePath, index) => {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'thumbnail';
    if (index === currentImageIndex) {
      thumbnail.classList.add('active');
    }
    
    const img = document.createElement('img');
    img.src = `/backend/public${imagePath}`;
    img.alt = `${currentProduct.name} - Thumbnail ${index + 1}`;
    
    thumbnail.appendChild(img);
    
    // Add click event
    thumbnail.addEventListener('click', () => {
      currentImageIndex = index;
      updateMainImage();
      
      // Update active thumbnail
      document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
      thumbnail.classList.add('active');
    });
    
    thumbnailGallery.appendChild(thumbnail);
  });
}

/**
 * Navigate gallery (prev/next)
 */
function navigateGallery(direction) {
  if (productImages.length <= 1) return;
  
  if (direction === 'prev') {
    currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
  } else {
    currentImageIndex = (currentImageIndex + 1) % productImages.length;
  }
  
  // Update main image
  updateMainImage();
  
  // Update active thumbnail
  const thumbnails = document.querySelectorAll('.thumbnail');
  thumbnails.forEach(thumb => thumb.classList.remove('active'));
  
  if (thumbnails[currentImageIndex]) {
    thumbnails[currentImageIndex].classList.add('active');
    
    // Scroll thumbnail into view if needed
    thumbnails[currentImageIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

/**
 * Add event listeners for product interactions
 */
function addEventListeners() {
  // Quantity selector
  const decreaseBtn = document.getElementById('decreaseQuantity');
  const increaseBtn = document.getElementById('increaseQuantity');
  const quantityInput = document.getElementById('quantityInput');
  
  if (decreaseBtn && increaseBtn && quantityInput) {
    decreaseBtn.addEventListener('click', () => {
      const currentVal = parseInt(quantityInput.value);
      if (currentVal > 1) {
        quantityInput.value = currentVal - 1;
      }
    });
    
    increaseBtn.addEventListener('click', () => {
      const currentVal = parseInt(quantityInput.value);
      if (currentVal < 99) {
        quantityInput.value = currentVal + 1;
      }
    });
    
    quantityInput.addEventListener('change', () => {
      let val = parseInt(quantityInput.value);
      
      // Validate value
      if (isNaN(val) || val < 1) {
        val = 1;
      } else if (val > 99) {
        val = 99;
      }
      
      quantityInput.value = val;
    });
  }
  
  // Add to cart button
  const addToCartBtn = document.getElementById('addToCartBtn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async () => {
      if (!currentProduct) return;
      
      // Check if product is in stock
      if (currentProduct.stock <= 0) {
        showNotification('This product is out of stock', 'error');
        return;
      }
      
      const quantity = parseInt(document.getElementById('quantityInput').value);
      
      try {
        addToCartBtn.disabled = true;
        addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        
        // Add to cart with selected options
        await API.cart.addItem(currentProduct.id, quantity, selectedColor, selectedSize);
        
        // Update cart count
        updateCartCount();
        
        addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
        setTimeout(() => {
          addToCartBtn.disabled = false;
          addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        }, 2000);
        
        showNotification('Product added to cart!', 'success');
      } catch (error) {
        console.error('Error adding to cart:', error);
        
        addToCartBtn.disabled = false;
        addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        
        showNotification('Failed to add product to cart', 'error');
      }
    });
  }
  
  // Add to wishlist button
  const addToWishlistBtn = document.getElementById('addToWishlistBtn');
  if (addToWishlistBtn) {
    addToWishlistBtn.addEventListener('click', async () => {
      if (!currentProduct) return;
      
      try {
        addToWishlistBtn.disabled = true;
        addToWishlistBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        
        // Add to wishlist
        await API.wishlist.addItem(currentProduct.id);
        
        // Update wishlist count
        updateWishlistCount();
        
        addToWishlistBtn.innerHTML = '<i class="fas fa-heart"></i> Added to Wishlist';
        setTimeout(() => {
          addToWishlistBtn.disabled = false;
          addToWishlistBtn.innerHTML = '<i class="far fa-heart"></i> Add to Wishlist';
        }, 2000);
        
        showNotification('Product added to wishlist!', 'success');
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        
        addToWishlistBtn.disabled = false;
        addToWishlistBtn.innerHTML = '<i class="far fa-heart"></i> Add to Wishlist';
        
        // If product already in wishlist
        if (error.message && error.message.includes('already in wishlist')) {
          showNotification('Product already in wishlist', 'error');
        } else {
          showNotification('Failed to add product to wishlist', 'error');
        }
      }
    });
  }
}

/**
 * Load similar products
 */
async function loadSimilarProducts(productId) {
  try {
    const similarProductsGrid = document.getElementById('similarProductsGrid');
    const similarProductsLoading = document.getElementById('similarProductsLoading');
    
    if (!similarProductsGrid || !similarProductsLoading) return;
    
    // Fetch similar products
    const similarProducts = await API.products.getSimilar(productId);
    
    // Hide loading
    similarProductsLoading.style.display = 'none';
    
    // If no similar products
    if (!similarProducts || similarProducts.length === 0) {
      similarProductsGrid.innerHTML = '<p class="no-similar">No similar products found.</p>';
      return;
    }
    
    // Create template
    const template = document.getElementById('productCardTemplate');
    
    // Clear grid
    similarProductsGrid.innerHTML = '';
    
    // Add similar products
    similarProducts.forEach(product => {
      const productElement = createProductElement(product, template);
      if (productElement) {
        similarProductsGrid.appendChild(productElement);
      }
    });
  } catch (error) {
    console.error('Error loading similar products:', error);
    
    const similarProductsGrid = document.getElementById('similarProductsGrid');
    const similarProductsLoading = document.getElementById('similarProductsLoading');
    
    if (similarProductsLoading) {
      similarProductsLoading.style.display = 'none';
    }
    
    if (similarProductsGrid) {
      similarProductsGrid.innerHTML = '<p class="error-message">Failed to load similar products.</p>';
    }
  }
}

/**
 * Create product element for similar products
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
    mainImage.src = `/backend/public${product.images[0]}`;
    mainImage.alt = product.name;
  }
  
  if (hoverImage && product.images && product.images.length > 1) {
    hoverImage.src = `/backend/public${product.images[1]}`;
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
    viewDetailsLink.href = `product-details.html?id=${product.id}`;
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
 * Show error message
 */
function showError(message) {
  const container = document.querySelector('.product-details');
  
  if (container) {
    container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>${message}</p>
        <a href="../index.html" class="btn">Back to Products</a>
      </div>
    `;
  }
}

/**
 * Get color hex code from color name
 */
function getColorHex(colorName) {
  // Map common color names to hex values
  const colorMap = {
    'black': '#000000',
    'white': '#FFFFFF',
    'gray': '#808080',
    'gray-stained': '#A0A0A0',
    'blue': '#0058A3',
    'dark-blue': '#003E8C',
    'green': '#377E22',
    'beige': '#F5F5DC',
    'brown': '#A52A2A',
    'light-brown': '#C4A484',
    'dark-brown': '#5D4037',
    'black-brown': '#3B2F2F',
    'dark-gray': '#666666',
    'oak': '#D4A76A',
    'oak-veneer': '#D4A76A',
    'ash-veneer': '#E8DCC9',
    'brown-walnut': '#714B23',
    'brown-orange': '#D2691E',
    'birch': '#F0DAB5',
    'bamboo': '#D2BE8E',
    'white-stained': '#F2F2F2',
    'light-green': '#8FBC8F',
    'viarp-beige': '#E8D0A9',
    'light-beige': '#F5F5DC',
    'yellow': '#FFDB00',
    'stubbarp-black': '#121212',
    'stubbarp-white': '#FAFAFA',
    'wood': '#A0522D',
    'multicolor': 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)'
  };
  
  // Convert color name to lowercase and remove spaces
  const normalizedColorName = colorName.toLowerCase().trim();
  
  // Return matching hex code or a default color
  return colorMap[normalizedColorName] || '#CCCCCC';
}

/**
 * Capitalize first letter of string
 */
function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}