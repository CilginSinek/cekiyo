// Auth Client Utilities for handling cross-domain authentication

export interface UserInfo {
  topluyoId: string;
  nick: string;
  image: string;
  isOwnerMode: boolean;
  groupNick?: string;
  groupName?: string;
}

export interface AuthResponse {
  token: string;
  userInfo: UserInfo;
  redirect?: string;
  timestamp: number;
}

/**
 * Initialize cross-domain auth listener
 * This should be called in the parent window (topluyo.com)
 */
export function initAuthListener(onAuthComplete?: (data: AuthResponse) => void) {
  window.addEventListener('message', (event) => {
    // Only accept messages from our auth page
    if (!event.origin.includes('cekiyo.vercel.app')) return;
    
    try {
      const data = JSON.parse(event.data);
      if (data.action === '<auth-complete' && data.token) {
        // Store token in localStorage of the parent window
        localStorage.setItem('cekiyo-auth-token', data.token);
        localStorage.setItem('cekiyo-user-info', JSON.stringify(data.userInfo || {}));
        localStorage.setItem('cekiyo-auth-timestamp', String(data.timestamp || Date.now()));
        
        console.log('Auth token received and stored in parent window');
        
        // Call the callback if provided
        if (onAuthComplete) {
          onAuthComplete(data);
        }
        
        // Redirect if needed
        if (data.redirect) {
          window.location.href = data.redirect;
        }
      }
    } catch (error) {
      console.error('Error processing auth message:', error);
    }
  });
}

/**
 * Get the current authentication token
 * @returns The token string or null if not authenticated
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('cekiyo-auth-token');
}

/**
 * Get the current user information
 * @returns User info object or null if not available
 */
export function getUserInfo(): UserInfo | null {
  const userInfoStr = localStorage.getItem('cekiyo-user-info');
  if (!userInfoStr) return null;
  
  try {
    return JSON.parse(userInfoStr);
  } catch {
    return null;
  }
}

/**
 * Check if the user is authenticated
 * @returns Boolean indicating if authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  const timestamp = localStorage.getItem('cekiyo-auth-timestamp');
  
  // If no token, not authenticated
  if (!token) return false;
  
  // If token exists but no timestamp, assume valid
  if (!timestamp) return true;
  
  // Check token age - expire after 24 hours
  const tokenAge = Date.now() - Number(timestamp);
  const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
  
  return tokenAge < MAX_AGE;
}

/**
 * Log the user out
 */
export function logout() {
  localStorage.removeItem('cekiyo-auth-token');
  localStorage.removeItem('cekiyo-user-info');
  localStorage.removeItem('cekiyo-auth-timestamp');
}
