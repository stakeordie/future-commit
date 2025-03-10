import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { storeAuthState } from '@/lib/redis';
import crypto from 'crypto';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'REPLACE_WITH_YOUR_NEYNAR_API_KEY';
const CLIENT_ID = process.env.NEYNAR_CLIENT_ID || 'REPLACE_WITH_YOUR_CLIENT_ID';
const neynar = new NeynarAPIClient({ apiKey: NEYNAR_API_KEY });

export async function POST(request: NextRequest) {
  try {
    // Get the redirect URL from the request body (if provided)
    const { redirectUrl } = await request.json();
    
    // Generate a unique state ID for CSRF protection
    const stateId = crypto.randomUUID();
    
    // Store the state in Redis with the redirect URL
    await storeAuthState(stateId, { redirectUrl });
    
    // Fetch the authorization URL from Neynar
    const response = await neynar.fetchAuthorizationUrl({
      clientId: CLIENT_ID,
      responseType: 'code' // This is the typical response type for OAuth flows
    });
    
    // Get the base authorization URL
    let authorizationUrl = response.authorization_url;
    
    // Add the state parameter to the URL
    const separator = authorizationUrl.includes('?') ? '&' : '?';
    authorizationUrl = `${authorizationUrl}${separator}state=${stateId}`;
    
    // Return the authorization URL with state
    return NextResponse.json({
      success: true,
      authorizationUrl,
      state: stateId,
      // Include the redirect URL in the response if it was provided
      redirectUrl: redirectUrl || null
    });
  } catch (error) {
    console.error('Error generating sign-in link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate sign-in link' },
      { status: 500 }
    );
  }
}