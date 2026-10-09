/**
 * Feature Flags Helper
 * Utility để load và check feature flags
 * Version: 1.0.0
 * Date: 2025-11-10
 */

class FeatureFlagsManager {
  constructor() {
    this.flags = null;
    this.userId = null;
    this.userGroups = [];
  }

  /**
   * Load feature flags từ server
   * @returns {Promise<Object>}
   */
  async load() {
    try {
      const response = await fetch('/lib/feature-flags.json');
      this.flags = await response.json();
      console.log('[FeatureFlags] Loaded:', this.flags);
      return this.flags;
    } catch (error) {
      console.error('[FeatureFlags] Failed to load:', error);
      this.flags = { features: {}, ab_tests: {} };
      return this.flags;
    }
  }

  /**
   * Set user context
   * @param {string} userId 
   * @param {Array<string>} groups 
   */
  setUser(userId, groups = []) {
    this.userId = userId;
    this.userGroups = groups;
  }

  /**
   * Check if feature is enabled for current user
   * @param {string} featureName 
   * @returns {boolean}
   */
  isEnabled(featureName) {
    if (!this.flags || !this.flags.features) {
      console.warn('[FeatureFlags] Flags not loaded');
      return false;
    }

    // Check kill switch
    if (this.flags.kill_switches?.ekyc_all_features?.enabled === false) {
      console.warn('[FeatureFlags] All features killed');
      return false;
    }

    const feature = this.flags.features[featureName];
    if (!feature) {
      console.warn(`[FeatureFlags] Feature not found: ${featureName}`);
      return false;
    }

    // Check if feature is globally enabled
    if (!feature.enabled) {
      return false;
    }

    // Check rollout percentage
    if (feature.rollout_percentage < 100) {
      // Deterministic rollout based on userId
      const userHash = this.hashUserId(this.userId || 'anonymous');
      const bucket = userHash % 100;
      
      if (bucket >= feature.rollout_percentage) {
        return false;
      }
    }

    // Check target groups
    if (feature.target_groups && feature.target_groups.length > 0) {
      if (!feature.target_groups.includes('all')) {
        const hasAccess = feature.target_groups.some(group => 
          this.userGroups.includes(group)
        );
        
        if (!hasAccess) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get feature config
   * @param {string} featureName 
   * @returns {Object|null}
   */
  getConfig(featureName) {
    if (!this.isEnabled(featureName)) {
      return null;
    }

    const feature = this.flags.features[featureName];
    return feature?.config || {};
  }

  /**
   * Get A/B test variant
   * @param {string} testName 
   * @returns {string|null} 'control' or 'treatment'
   */
  getABTestVariant(testName) {
    if (!this.flags || !this.flags.ab_tests) {
      return null;
    }

    const test = this.flags.ab_tests[testName];
    if (!test || !test.active) {
      return null;
    }

    // Deterministic assignment based on userId
    const userHash = this.hashUserId(this.userId || 'anonymous');
    const bucket = userHash % 100;

    let cumulative = 0;
    for (const [variant, config] of Object.entries(test.variants)) {
      cumulative += config.percentage;
      if (bucket < cumulative) {
        return variant;
      }
    }

    return 'control'; // Fallback
  }

  /**
   * Get A/B test config
   * @param {string} testName 
   * @returns {Object|null}
   */
  getABTestConfig(testName) {
    const variant = this.getABTestVariant(testName);
    if (!variant) {
      return null;
    }

    const test = this.flags.ab_tests[testName];
    return test.variants[variant]?.config || {};
  }

  /**
   * Hash userId for deterministic rollout
   * @param {string} userId 
   * @returns {number}
   */
  hashUserId(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Log feature usage (for analytics)
   * @param {string} featureName 
   * @param {Object} data 
   */
  logUsage(featureName, data = {}) {
    console.log('[FeatureFlags] Usage:', {
      feature: featureName,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      data
    });

    // Send to analytics endpoint if available
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('feature_used', {
        feature: featureName,
        ...data
      });
    }
  }

  /**
   * Get all enabled features for current user
   * @returns {Array<string>}
   */
  getEnabledFeatures() {
    if (!this.flags || !this.flags.features) {
      return [];
    }

    return Object.keys(this.flags.features).filter(name => 
      this.isEnabled(name)
    );
  }

  /**
   * Reload flags from server
   * @returns {Promise<Object>}
   */
  async reload() {
    return this.load();
  }
}

// Singleton instance
let instance = null;

/**
 * Get singleton instance
 * @returns {FeatureFlagsManager}
 */
function getFeatureFlags() {
  if (!instance) {
    instance = new FeatureFlagsManager();
  }
  return instance;
}

// Export for browser
if (typeof window !== 'undefined') {
  window.FeatureFlagsManager = FeatureFlagsManager;
  window.getFeatureFlags = getFeatureFlags;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FeatureFlagsManager,
    getFeatureFlags
  };
}
