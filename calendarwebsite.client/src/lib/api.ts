import { useAuth } from '@/contexts/AuthContext';

/**
 * Utility function to make authenticated API requests
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get the current auth state
  const auth = useAuth();
  
  // Set up headers with authentication if user is logged in
  const headers = new Headers(options.headers || {});
  
  if (auth.isAuthenticated) {
    // Add authorization header if needed
    // Note: For cookie-based auth, this might not be necessary
    // as cookies are automatically included in same-origin requests
  }
  
  // Add default content type if not specified
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important for cookie-based auth
  });
  
  // Handle 401 Unauthorized responses
  if (response.status === 401 && auth.isAuthenticated) {
    // Token might be expired, trigger logout
    auth.logout();
    throw new Error('Your session has expired. Please log in again.');
  }
  
  return response;
}

/**
 * Hook to use the fetchWithAuth function in components
 */
export function useApi() {
  const auth = useAuth();
  
  return {
    fetchWithAuth,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
  };
}