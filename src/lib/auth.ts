// src/lib/auth.ts
// No server-side imports!

// Types
export interface UserProfile {
  fid: number;
  username: string;
  displayName?: string;
  avatar?: string;
  isVerified: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  authToken?: string;
}

// Constants
const AUTH_STORAGE_KEY = 'commitment_tracker_auth';

// Local storage utilities
export const saveAuthToStorage = (auth: AuthState): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  }
};

export const loadAuthFromStorage = (): AuthState | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse auth from storage', e);
      }
    }
  }
  return null;
};

export const clearAuthFromStorage = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

// Auth functions that call API routes
export const generateSignInLink = async (redirectUrl: string) => {
  try {
    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ redirectUrl })
    });
    return await response.json();
  } catch (error) {
    console.error('Error generating sign-in link:', error);
    throw error;
  }
};

export const verifySignIn = async (token: string): Promise<AuthState> => {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Sign-in failed');
    }
    
    const authState: AuthState = {
      isAuthenticated: true,
      user: data.user,
      authToken: token
    };
    
    // Save to local storage
    saveAuthToStorage(authState);
    
    return authState;
  } catch (error) {
    console.error('Error verifying sign-in:', error);
    throw error;
  }
};

export const signOut = (): void => {
  clearAuthFromStorage();
  // If you're using client-side routing, you might want to redirect here
  window.location.href = '/';
};

// User data functions
export const getUserProfile = async (fid: number): Promise<UserProfile> => {
  try {
    const response = await fetch(`/api/auth/user?fid=${fid}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch user profile');
    }
    
    return data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};