// src/lib/auth.ts
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

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
const NEYNAR_API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY || 'REPLACE_WITH_YOUR_NEYNAR_API_KEY';

// Initialize Neynar client
const neynar = new NeynarAPIClient({ apiKey: NEYNAR_API_KEY });

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

// Auth functions
export const generateSignInLink = async (redirectUrl: string) => {
  try {
    const { token, url } = await neynar.generateSignInLink({
      redirectUrl
    });
    return { token, url };
  } catch (error) {
    console.error('Error generating sign-in link:', error);
    throw error;
  }
};

export const verifySignIn = async (token: string): Promise<AuthState> => {
  try {
    const { status, fid, username, displayName, pfp } = await neynar.verifySignInLink(token);
    
    if (status !== 'completed') {
      throw new Error('Sign-in not completed');
    }
    
    const authState: AuthState = {
      isAuthenticated: true,
      user: {
        fid,
        username,
        displayName: displayName || username,
        avatar: pfp,
        isVerified: true, // You might want to check this with Neynar
      },
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
    const { user } = await neynar.fetchUser(fid);
    
    return {
      fid: user.fid,
      username: user.username,
      displayName: user.displayName,
      avatar: user.pfp?.url,
      isVerified: user.verified
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};