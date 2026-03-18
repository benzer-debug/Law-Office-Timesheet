/**
 * Session Timeout Management
 * Automatically logs out users after 3 minutes of inactivity
 */

class SessionTimeoutManager {
  constructor(inactivityMinutes = 3) {
    this.inactivityMillis = inactivityMinutes * 60 * 1000;
    this.inactivityTimeout = null;
    this.warningTimeout = null;
    this.warningShownAt = null;
    this.isActive = true;
    this.events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    this.boundActivityHandler = this.handleUserActivity.bind(this);
  }

  /**
   * Handle user activity events
   * Ignore interactions inside warning modal so button actions are not interrupted
   */
  handleUserActivity(event) {
    if (this.shouldIgnoreActivity(event)) {
      return;
    }
    this.resetTimer();
  }

  /**
   * Check if activity should be ignored
   */
  shouldIgnoreActivity(event) {
    const warningEl = document.getElementById('inactivityWarningModal');
    if (!warningEl || warningEl.style.display === 'none') {
      return false;
    }

    const target = event && event.target;
    return !!(target && warningEl.contains(target));
  }

  /**
   * Initialize session timeout tracking
   * @param {Function} logoutCallback - Function to call when logging out
   * @param {Function} warningCallback - Optional function to call before logout
   */
  init(logoutCallback, warningCallback = null) {
    this.logoutCallback = logoutCallback;
    this.warningCallback = warningCallback;

    // Add event listeners for user activity
    this.events.forEach(event => {
      document.addEventListener(event, this.boundActivityHandler, true);
    });

    // Start the initial timer
    this.resetTimer();

    console.warn('Session timeout: 3 minutes of inactivity');
  }

  /**
   * Reset the inactivity timer
   */
  resetTimer() {
    // Clear existing timeouts
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
    }

    this.isActive = true;
    this.warningShownAt = null;

    // Dismiss warning if visible
    this.dismissWarning();

    // Show warning after 2.5 minutes (30 seconds before logout)
    if (this.warningCallback) {
      this.warningTimeout = setTimeout(() => {
        this.showWarning();
      }, this.inactivityMillis - 30000);
    }

    // Logout after 3 minutes
    this.inactivityTimeout = setTimeout(() => {
      this.logout();
    }, this.inactivityMillis);
  }

  /**
   * Show warning before logout
   */
  showWarning() {
    this.warningShownAt = Date.now();
    if (this.warningCallback) {
      this.warningCallback();
    }
  }

  /**
   * Dismiss the warning
   */
  dismissWarning() {
    const warningEl = document.getElementById('inactivityWarningModal');
    if (warningEl) {
      warningEl.style.display = 'none';
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.isActive = false;
    if (this.logoutCallback) {
      this.logoutCallback();
    }
  }

  /**
   * Destroy session manager
   */
  destroy() {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
    }
    this.events.forEach(event => {
      document.removeEventListener(event, this.boundActivityHandler, true);
    });
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionTimeoutManager;
}
