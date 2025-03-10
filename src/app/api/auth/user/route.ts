import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient} from '@neynar/nodejs-sdk';
import { User } from '@neynar/nodejs-sdk/build/api/models/user';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'REPLACE_WITH_YOUR_NEYNAR_API_KEY';
const neynar = new NeynarAPIClient({ apiKey: NEYNAR_API_KEY });

async function fetchUserByFid(fid: string): Promise<User | NextResponse<{
  success: boolean;
  error: string;
}>> {
  // Use fetchBulkUsers with an array containing just the single FID
  const fidNumber = typeof fid === 'string' ? parseInt(fid, 10) : fid;

  try {
    const { users } = await neynar.fetchBulkUsers({ 
      fids: [fidNumber]
    });

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];
    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    
    if (!fid) {
      return NextResponse.json(
        { success: false, error: 'Missing fid parameter' },
        { status: 400 }
      );
    }
    
    const userResult = await fetchUserByFid(fid);
    
    // Check if userResult is a NextResponse (error case)
    if (userResult instanceof NextResponse) {
      return userResult;
    }
    
    // If we got here, userResult is a User
    const user = userResult;
    
    return NextResponse.json({
      success: true,
      user: {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        avatar: user.pfp_url,
        // Check if the user has any verifications
        isVerified: user.verifications?.length > 0 || user.verified_accounts?.length > 0
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}