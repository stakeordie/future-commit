import { NextRequest, NextResponse } from 'next/server';
//import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { getAuthState, storeUserSession } from '@/lib/redis';
import crypto from 'crypto';
import { AuthState } from '@/lib/auth';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'REPLACE_WITH_YOUR_NEYNAR_API_KEY';
//const neynar = new NeynarAPIClient({ apiKey: NEYNAR_API_KEY });

export async function POST(request: NextRequest) {
  try {
    // Get token and state from the request
    const { token, state } = await request.json();
    
    // Verify the token with Neynar using direct API call
    const verifyResponse = await fetch('https://api.neynar.com/v2/farcaster/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': NEYNAR_API_KEY
      },
      body: JSON.stringify({ token })
    });
    
    const result = await verifyResponse.json();
    
    if (!result.success || result.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Sign-in not completed' },
        { status: 400 }
      );
    }
    
    // Create user profile object
    const user = {
      fid: result.fid,
      username: result.username,
      displayName: result.displayName || result.username,
      avatar: result.pfp,
      isVerified: true
    };
    
    // Retrieve state data from Redis (if state is provided)
    let redirectUrl = null;
    if (state) {
      const stateData = await getAuthState(state);
      if (stateData) {
        redirectUrl = stateData.redirectUrl;
      }
    }
    
    // Generate a session token
    const sessionToken = crypto.randomUUID();
    
    // Create auth state object
    const authState: AuthState = {
      isAuthenticated: true,
      user,
      authToken: sessionToken
    };
    
    // Store the session in Redis
    await storeUserSession(sessionToken, authState);
    
    // Return user data and session token
    return NextResponse.json({
      success: true,
      user,
      sessionToken,
      redirectUrl
    });
  } catch (error) {
    console.error('Error verifying sign-in:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify sign-in' },
      { status: 500 }
    );
  }
}