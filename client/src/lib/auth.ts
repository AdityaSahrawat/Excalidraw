import axios from 'axios';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';

// Optional shared style token for logout buttons
export const logoutButtonClass = 'bg-red-500 hover:bg-red-600 text-white';

/**
 * Unified logout function that works for both OAuth and manual login users
 * 1. Clears JWT token from backend (removes httpOnly cookie)
 * 2. Clears NextAuth session (for OAuth users)
 * 3. Keeps user on homepage without auth route flicker
 */
export const logout = async () => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (backendUrl) {
      const cleanBase = backendUrl.replace(/\/$/, '');
      const logoutUrl = cleanBase.endsWith('/v1')
        ? `${cleanBase}/user/logout`
        : `${cleanBase}/v1/user/logout`;
      await axios.get(logoutUrl, { withCredentials: true });
      console.log("✅ Backend logout successful - JWT token cleared");
    }
  } catch (error: unknown) {
    console.error("❌ Logout error:", error);
    const err = error as { response?: { data?: { message?: string } } };
    toast.error(err.response?.data?.message || "Failed to log out. Please try again.");
  }
  // Manually clear client-visible cookies regardless of backend result
  if (typeof document !== 'undefined') {
    const expire = 'Max-Age=0; Path=/; SameSite=Lax';
    document.cookie = `ws_token=; ${expire}`;
    document.cookie = `auth_status=; ${expire}`;
    document.cookie = `token=; ${expire}`;
  }
  // Clear NextAuth session silently (no redirect chain)
  await signOut({ redirect: false });
  // Stay on homepage (avoid /auth/* flicker). If already there, force a state-only refresh.
  if (typeof window !== 'undefined') {
    if (window.location.pathname !== '/') {
      window.location.replace('/');
    } else {
      window.location.reload();
    }
  }
};

/**
 * Debug function to log all available cookies
 */
export const debugCookies = () => {
  if (typeof document === 'undefined') {
    console.log('🍪 [DEBUG] Running on server side - no cookies available');
    return;
  }
  
  const allCookies = document.cookie;
  console.log('🍪 [DEBUG] Raw cookies string:', allCookies);
  
  if (!allCookies) {
    console.log('🍪 [DEBUG] No cookies found at all');
    return;
  }
  
  const cookies = allCookies.split(';');
  console.log('🍪 [DEBUG] Parsed cookies:');
  cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    console.log(`   - ${name}: ${value?.substring(0, 20)}${value?.length > 20 ? '...' : ''}`);
  });
};

/**
 * Check if user is authenticated by looking for auth_status cookie
 * The actual JWT token is httpOnly and not accessible to JavaScript
 */
export const getAuthStatusFromCookies = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  // Debug cookies for troubleshooting
  debugCookies();
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth_status' && value === 'authenticated') {
      console.log('🍪 [DEBUG] Found auth_status cookie - user is authenticated!');
      return true;
    }
  }
  
  console.log('🍪 [DEBUG] No auth_status cookie found - user not authenticated');
  return false;
};

/**
 * Legacy function - JWT token is httpOnly and not accessible
 * Use getAuthStatusFromCookies() instead
 * @deprecated
 */
export const getTokenFromCookies = (): string | null => {
  console.warn('⚠️ getTokenFromCookies() is deprecated - JWT token is httpOnly and not accessible');
  console.warn('⚠️ Use getAuthStatusFromCookies() instead to check authentication status');
  return null;
};

/**
 * Check if user is authenticated by looking for auth_status cookie
 * Works for both OAuth and manual login users
 */
export const isAuthenticated = (): boolean => {
  return getAuthStatusFromCookies();
};