/**
 * Image Optimization JavaScript for Evaluate-conditions.html
 * Handles: Lazy loading, error handling, progressive loading, responsive images
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    lazyLoadOffset: 200, // pixels before viewport
    retryAttempts: 3,
    retryDelay: 1000, // milliseconds
    placeholderDelay: 300, // milliseconds before showing skeleton
  };

  // Image URL optimizations - shortened and CDN-optimized
  const OPTIMIZED_URLS = {
    banks: {
      fecredit: 'https://storage.googleapis.com/housezy-2f8ee.appspot.com/images/entities/500/1694489220481.jpg',
      vietcombank: 'https://inkythuatso.com/uploads/thumbnails/800/2021/11/logo-vietcombank-inkythuatso-10-01-13-11-42.jpg',
      vietinbank: 'https://i.pinimg.com/564x/0e/33/49/0e3349ab85ae5ebf604df3cb380f9c8f.jpg',
      bidv: 'https://play-lh.googleusercontent.com/g9KCglN_UhMUgccQxVg112tz3AAa0-ZqrgOkoKLtPe34-a6ZiOdzyW26hSWcqa-1sQ',
      techcombank: 'https://techcombank.com/content/dam/techcombank/public-site/seo/techcombank_logo_svg_86201e50d1.svg',
      agribank: 'https://inkythuatso.com/uploads/thumbnails/800/2021/11/logo-agribank-inkythuatso-01-23-08-33-35.jpg',
      mbbank: 'https://inkythuatso.com/uploads/thumbnails/800/2021/11/logo-mb-bank-inkythuatso-01-00-45-26.jpg',
      vpbank: 'https://inkythuatso.com/uploads/thumbnails/800/2021/12/logo-vpbank-inkythuatso-01-11-09-51.jpg',
      vib: 'https://inkythuatso.com/uploads/thumbnails/800/2021/12/logo-vib-inkythuatso-3-21-13-44-34.jpg',
      hdbank: 'https://inkythuatso.com/uploads/thumbnails/800/2022/03/logo-hdbank-inkythuatso-01-12-13-10-51.jpg'
    },
    paymentMethods: {
      bank: 'https://www.vban.vn/Resources/images/navcard2.png', // ATM/Bank Account
      visa: 'https://www.vban.vn/Resources/images/navcard3.png',
      momo: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png',
      zalopay: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png'
    },
    fallback: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"%3E%3Crect fill="%23f5f5f5" width="28" height="28"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="%23999"%3E?%3C/text%3E%3C/svg%3E'
  };

  /**
   * Initialize image optimization
   */
  function init() {
    // Detect WebP support
    detectWebPSupport();
    
    // Setup lazy loading
    setupLazyLoading();
    
    // Setup error handling
    setupErrorHandling();
    
    // Setup progressive loading for hero images
    setupProgressiveLoading();
    
    // Optimize bank logos
    optimizeBankLogos();
    
    // Optimize payment method icons
    optimizePaymentMethodIcons();
    
    // Setup responsive image loading
    setupResponsiveImages();
  }

  /**
   * Detect WebP support
   */
  function detectWebPSupport() {
    const webp = new Image();
    webp.onload = webp.onerror = function() {
      const isSupported = webp.height === 2;
      document.documentElement.classList.add(isSupported ? 'webp' : 'no-webp');
    };
    webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  }

  /**
   * Setup lazy loading with Intersection Observer
   */
  function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            loadImage(img);
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: `${CONFIG.lazyLoadOffset}px`
      });

      // Observe all lazy images
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      lazyImages.forEach(img => {
        img.classList.add('lazy-loading');
        imageObserver.observe(img);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      lazyImages.forEach(img => loadImage(img));
    }
  }

  /**
   * Load image with retry logic
   */
  function loadImage(img, attempt = 1) {
    const src = img.dataset.src || img.src;
    
    if (!src || src === OPTIMIZED_URLS.fallback) {
      img.classList.add('loaded', 'error');
      return;
    }

    const tempImg = new Image();
    
    tempImg.onload = function() {
      img.src = src;
      img.classList.add('loaded');
      img.classList.remove('lazy-loading', 'loading', 'skeleton');
      img.removeAttribute('data-loading');
      img.setAttribute('data-loaded', 'true');
    };
    
    tempImg.onerror = function() {
      if (attempt < CONFIG.retryAttempts) {
        // Retry loading
        setTimeout(() => {
          loadImage(img, attempt + 1);
        }, CONFIG.retryDelay * attempt);
      } else {
        // Max attempts reached, use fallback
        handleImageError(img);
      }
    };
    
    img.setAttribute('data-loading', 'true');
    tempImg.src = src;
  }

  /**
   * Handle image loading errors
   */
  function handleImageError(img) {
    img.classList.add('error');
    img.classList.remove('loading', 'skeleton');
    img.setAttribute('data-error', 'true');
    
    // Use fallback image
    const fallbackSrc = img.dataset.fallback || OPTIMIZED_URLS.fallback;
    if (img.src !== fallbackSrc) {
      img.src = fallbackSrc;
    }
    
    // Log error if Logger is available
    if (window.Logger) {
      window.Logger.warn('Image failed to load', { 
        src: img.dataset.src || img.src,
        alt: img.alt 
      });
    }
  }

  /**
   * Setup error handling for all images
   */
  function setupErrorHandling() {
    const allImages = document.querySelectorAll('img');
    
    allImages.forEach(img => {
      img.addEventListener('error', function(e) {
        if (!this.hasAttribute('data-error-handled')) {
          this.setAttribute('data-error-handled', 'true');
          handleImageError(this);
        }
      });
      
      img.addEventListener('load', function() {
        this.classList.add('loaded');
        this.removeAttribute('data-loading');
        this.setAttribute('data-loaded', 'true');
      });
    });
  }

  /**
   * Setup progressive loading for hero banner images
   */
  function setupProgressiveLoading() {
    const sliderItems = document.querySelectorAll('.slider-item');
    
    sliderItems.forEach((item, index) => {
      const img = item.querySelector('img');
      
      if (!img) return;
      
      // Add loading class
      item.classList.add('loading');
      
      // Show skeleton after delay if image hasn't loaded
      const skeletonTimer = setTimeout(() => {
        if (!img.classList.contains('loaded')) {
          item.classList.add('skeleton');
        }
      }, CONFIG.placeholderDelay);
      
      // Remove loading states when image loads
      img.addEventListener('load', function() {
        clearTimeout(skeletonTimer);
        item.classList.remove('loading', 'skeleton');
        item.removeAttribute('data-loading');
      });
      
      // Preload first slide image
      if (index === 0) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Optimize bank logos
   */
  function optimizeBankLogos() {
    const bankOptions = document.querySelectorAll('.custom-select-option[data-value]');
    
    bankOptions.forEach(option => {
      const img = option.querySelector('.bank-logo');
      if (!img) return;
      
      const bankValue = option.getAttribute('data-value');
      const optimizedUrl = OPTIMIZED_URLS.banks[bankValue];
      
      if (optimizedUrl) {
        // Store original URL as fallback
        if (!img.dataset.fallback) {
          img.dataset.fallback = img.src;
        }
        
        // Set optimized URL
        img.dataset.src = optimizedUrl;
        
        // Add loading class
        img.classList.add('loading');
        
        // Load optimized image
        loadImage(img);
      }
      
      // Set proper alt text
      const bankName = option.textContent.trim();
      if (!img.alt || img.alt === 'Bank Logo') {
        img.alt = `Logo ${bankName}`;
      }
      
      // Set consistent size
      img.width = 28;
      img.height = 28;
    });
    
    // Also optimize the toggle image
    const toggleImg = document.querySelector('.custom-select-toggle .bank-logo');
    if (toggleImg) {
      toggleImg.width = 28;
      toggleImg.height = 28;
    }
  }

  /**
   * Optimize payment method icons
   */
  function optimizePaymentMethodIcons() {
    const methodOptions = document.querySelectorAll('.custom-method-option[data-value]');
    
    methodOptions.forEach(option => {
      const img = option.querySelector('.method-logo');
      if (!img) return;
      
      const methodValue = option.getAttribute('data-value');
      const optimizedUrl = OPTIMIZED_URLS.paymentMethods[methodValue];
      
      if (optimizedUrl) {
        // Store original URL as fallback
        if (!img.dataset.fallback) {
          img.dataset.fallback = img.src;
        }
        
        // Set optimized URL
        img.src = optimizedUrl;
      }
      
      // Set proper alt text based on method
      const altTexts = {
        bank: 'Biểu tượng Thẻ ATM và Tài khoản Ngân hàng',
        visa: 'Biểu tượng Thẻ Visa, Mastercard, JCB',
        momo: 'Biểu tượng Ví điện tử MoMo',
        zalopay: 'Biểu tượng Ví điện tử ZaloPay'
      };
      
      if (!img.alt || img.alt === 'Payment Method') {
        img.alt = altTexts[methodValue] || option.textContent.trim();
      }
      
      // Set consistent size
      img.width = 28;
      img.height = 28;
    });
  }

  /**
   * Setup responsive images based on viewport
   */
  function setupResponsiveImages() {
    const heroImages = document.querySelectorAll('.slider-item img');
    
    heroImages.forEach(img => {
      // Add responsive attributes
      if (!img.hasAttribute('sizes')) {
        img.setAttribute('sizes', '(max-width: 767px) 100vw, (max-width: 1199px) 100vw, 1200px');
      }
      
      // Set proper alt text for hero images
      const altTexts = [
        'FE CREDIT đồng hành cùng người dân vùng lũ - Giải ngân khoản vay nhanh chóng và an toàn',
        'Nhân đôi ưu đãi - Tài chính linh hoạt, ước mơ trong tầm tay',
        'Flexi Buy - Có Flexi Buy, thảnh thơi thanh toán'
      ];
      
      const parent = img.closest('.slider-item');
      const index = Array.from(document.querySelectorAll('.slider-item')).indexOf(parent);
      
      if (index >= 0 && index < altTexts.length && (!img.alt || img.alt.length < 20)) {
        img.alt = altTexts[index];
      }
    });
    
    // Handle resize events with debouncing
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        adjustImageQuality();
      }, 250);
    });
    
    // Initial adjustment
    adjustImageQuality();
  }

  /**
   * Adjust image quality based on viewport size
   */
  function adjustImageQuality() {
    const viewportWidth = window.innerWidth;
    const heroImages = document.querySelectorAll('.slider-item img');
    
    heroImages.forEach(img => {
      // Add appropriate loading priority
      if (viewportWidth <= 767) {
        img.loading = 'lazy';
      } else {
        // First image should be eager loaded
        const parent = img.closest('.slider-item');
        const isFirst = parent && parent.classList.contains('active');
        img.loading = isFirst ? 'eager' : 'lazy';
      }
    });
  }

  /**
   * Preload critical images
   */
  function preloadCriticalImages() {
    // Preload first hero image
    const firstSlide = document.querySelector('.slider-item.active img');
    if (firstSlide && firstSlide.src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = firstSlide.src;
      document.head.appendChild(link);
    }
    
    // Preload FE Credit logo
    const feCreditOption = document.querySelector('.custom-select-option[data-value="fecredit"] .bank-logo');
    if (feCreditOption && feCreditOption.src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = feCreditOption.src;
      document.head.appendChild(link);
    }
  }

  /**
   * Public API
   */
  window.ImageOptimization = {
    init: init,
    loadImage: loadImage,
    preloadCriticalImages: preloadCriticalImages
  };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Preload critical images
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadCriticalImages);
  } else {
    preloadCriticalImages();
  }

})();
