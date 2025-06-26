// 🚀 PERFORMANCE: Optimized Configuration Settings

export const PERFORMANCE_CONFIG = {
  // Debounce delays (in milliseconds)
  DEBOUNCE: {
    FAST: 300,        // For immediate UI feedback
    NORMAL: 500,      // For API calls
    SLOW: 1000,       // For heavy operations
    SEARCH: 200,      // For search inputs
  },

  // Toast durations (in milliseconds)
  TOAST_DURATION: {
    SUCCESS: 1000,    // Quick success messages
    INFO: 1500,       // Informational messages
    WARNING: 3000,    // Warning messages
    ERROR: 5000,      // Error messages
  },

  // API timeouts (in milliseconds)
  API_TIMEOUT: {
    FAST: 5000,       // 5 seconds for quick operations
    NORMAL: 10000,    // 10 seconds for normal operations
    SLOW: 30000,      // 30 seconds for heavy operations
  },

  // Pagination settings
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    ROLES_PER_PAGE: 25,
    USERS_PER_PAGE: 50,
  },

  // Cache settings
  CACHE: {
    PERMISSIONS_TTL: 5 * 60 * 1000,    // 5 minutes
    ROLES_TTL: 2 * 60 * 1000,          // 2 minutes
    USERS_TTL: 1 * 60 * 1000,          // 1 minute
  },

  // Performance thresholds
  PERFORMANCE_THRESHOLDS: {
    SLOW_RENDER_MS: 16,      // 60fps threshold
    SLOW_API_CALL_MS: 1000,  // 1 second
    MEMORY_WARNING_MB: 100,   // 100MB
  },

  // Feature flags for optimization
  FEATURES: {
    ENABLE_PERFORMANCE_TRACKING: process.env.NODE_ENV === 'development',
    ENABLE_CONSOLE_LOGGING: process.env.NODE_ENV === 'development',
    ENABLE_MEMOIZATION: true,
    ENABLE_VIRTUAL_SCROLLING: false, // For future implementation
    ENABLE_LAZY_LOADING: true,
  },

  // UI optimization settings
  UI: {
    ANIMATION_DURATION: 200,     // Fast animations
    SKELETON_LOADING: true,      // Show skeleton loaders
    PROGRESSIVE_LOADING: true,   // Load content progressively
    BATCH_UPDATES: true,         // Batch state updates
  }
};

// 🚀 PERFORMANCE: Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  // Production optimizations
  PERFORMANCE_CONFIG.DEBOUNCE.FAST = 200;
  PERFORMANCE_CONFIG.TOAST_DURATION.SUCCESS = 800;
  PERFORMANCE_CONFIG.FEATURES.ENABLE_CONSOLE_LOGGING = false;
}

// 🚀 PERFORMANCE: Utility functions
export const getOptimizedDelay = (type: keyof typeof PERFORMANCE_CONFIG.DEBOUNCE): number => {
  return PERFORMANCE_CONFIG.DEBOUNCE[type];
};

export const getToastDuration = (type: keyof typeof PERFORMANCE_CONFIG.TOAST_DURATION): number => {
  return PERFORMANCE_CONFIG.TOAST_DURATION[type];
};

export const isFeatureEnabled = (feature: keyof typeof PERFORMANCE_CONFIG.FEATURES): boolean => {
  return PERFORMANCE_CONFIG.FEATURES[feature];
};

// 🚀 PERFORMANCE: Performance monitoring helpers
export const createOptimizedLogger = () => {
  const isDev = PERFORMANCE_CONFIG.FEATURES.ENABLE_CONSOLE_LOGGING;
  
  return {
    info: (message: string, ...args: any[]) => {
      if (isDev) console.log(`ℹ️ ${message}`, ...args);
    },
    success: (message: string, ...args: any[]) => {
      if (isDev) console.log(`✅ ${message}`, ...args);
    },
    warning: (message: string, ...args: any[]) => {
      if (isDev) console.warn(`⚠️ ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
      console.error(`❌ ${message}`, ...args); // Always log errors
    },
    debug: (message: string, ...args: any[]) => {
      if (isDev && window.location.search.includes('debug=true')) {
        console.log(`🔧 ${message}`, ...args);
      }
    },
    performance: (message: string, duration: number) => {
      if (isDev) {
        const emoji = duration > PERFORMANCE_CONFIG.PERFORMANCE_THRESHOLDS.SLOW_API_CALL_MS ? '🐌' : '⚡';
        console.log(`${emoji} ${message}: ${duration.toFixed(2)}ms`);
      }
    }
  };
}; 