import { NextRequest, NextResponse } from 'next/server';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { commitmentUtils } from '@/lib/redis';

// Initialize Neynar client - we'll use this to validate the frame message
// You'll need to replace this with your actual Neynar API key
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'REPLACE_WITH_YOUR_NEYNAR_API_KEY';
// Create Neynar client instance - uncomment when ready to use
// const neynar = new NeynarAPIClient({ apiKey: NEYNAR_API_KEY });

// Get the base URL for the frame
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Extract frame data from the request
    // In a real implementation, you would validate this with Neynar
    // For example: const { isValid, message } = await neynar.validateFrameAction(body);
    const frameData = body;
    const buttonIndex = frameData.untrustedData?.buttonIndex || 0;
    const inputText = frameData.untrustedData?.inputText || '';
    const fid = frameData.untrustedData?.fid;
    
    // In a production app, you should validate the frame message
    // This is a simplified version for demonstration
    
    // Log the frame data for debugging
    console.log('Frame data received:', { buttonIndex, inputText, fid });
    
    // Handle different button actions based on the button index
    switch (buttonIndex) {
      case 1: // Create Commitment
        return handleCreateCommitment(inputText, fid);
      case 2: // Sign Commitment
        return handleSignCommitment(inputText, fid);
      case 3: // View Commitments
        return handleViewCommitments(inputText);
      default:
        return handleDefault();
    }
  } catch (error) {
    console.error('Error processing frame action:', error);
    return NextResponse.json(
      { error: 'Error processing frame action' },
      { status: 500 }
    );
  }
}

// Handler for creating a new commitment
async function handleCreateCommitment(text: string, fid: number) {
  if (!text) {
    return createErrorFrame('Please enter commitment text');
  }
  
  try {
    // Create a new commitment
    const commitmentId = await commitmentUtils.createCommitment({
      id: '', // Will be set by createCommitment
      text,
      creatorFid: fid,
      createdAt: 0, // Will be set by createCommitment
      participants: {}
    });
    
    // Return success frame
    return NextResponse.json({
      frames: {
        version: 'vNext',
        image: `${baseUrl}/api/image/commitment?id=${commitmentId}`,
        buttons: [
          {
            label: 'View Details',
            action: 'post',
          },
          {
            label: 'Create Another',
            action: 'post',
            target: `${baseUrl}/api/action/create`,
          },
          {
            label: 'View All',
            action: 'post',
            target: `${baseUrl}/api/action/view`,
          }
        ],
      },
    });
  } catch (error) {
    console.error('Error creating commitment:', error);
    return createErrorFrame('Failed to create commitment');
  }
}

// Handler for signing a commitment
async function handleSignCommitment(commitmentId: string, fid: number) {
  if (!commitmentId) {
    return createErrorFrame('Please enter a commitment ID');
  }
  
  try {
    // Sign the commitment
    const success = await commitmentUtils.signCommitment(commitmentId, fid);
    
    if (!success) {
      return createErrorFrame('Commitment not found');
    }
    
    // Return success frame
    return NextResponse.json({
      frames: {
        version: 'vNext',
        image: `${baseUrl}/api/image/commitment?id=${commitmentId}&signed=true`,
        buttons: [
          {
            label: 'View Details',
            action: 'post',
          },
          {
            label: 'Revoke',
            action: 'post',
            target: `${baseUrl}/api/action/revoke`,
          },
          {
            label: 'View All',
            action: 'post',
            target: `${baseUrl}/api/action/view`,
          }
        ],
        input: {
          text: 'Enter reason (for revocation)',
        },
      },
    });
  } catch (error) {
    console.error('Error signing commitment:', error);
    return createErrorFrame('Failed to sign commitment');
  }
}

// Handler for viewing commitments
async function handleViewCommitments(commitmentId?: string) {
  try {
    // If a specific commitment ID is provided, show that one
    if (commitmentId) {
      const commitment = await commitmentUtils.getCommitment(commitmentId);
      
      if (!commitment) {
        return createErrorFrame('Commitment not found');
      }
      
      return NextResponse.json({
        frames: {
          version: 'vNext',
          image: `${baseUrl}/api/image/commitment?id=${commitmentId}`,
          buttons: [
            {
              label: 'Sign',
              action: 'post',
              target: `${baseUrl}/api/action/sign`,
            },
            {
              label: 'View All',
              action: 'post',
              target: `${baseUrl}/api/action/view`,
            },
            {
              label: 'Create New',
              action: 'post',
              target: `${baseUrl}/api/action/create`,
            }
          ],
          input: {
            text: 'Enter commitment ID to sign',
          },
        },
      });
    }
    
    // Otherwise, show all commitments
    return NextResponse.json({
      frames: {
        version: 'vNext',
        image: `${baseUrl}/api/image/commitments`,
        buttons: [
          {
            label: 'View Details',
            action: 'post',
            target: `${baseUrl}/api/action/view`,
          },
          {
            label: 'Sign',
            action: 'post',
            target: `${baseUrl}/api/action/sign`,
          },
          {
            label: 'Create New',
            action: 'post',
            target: `${baseUrl}/api/action/create`,
          }
        ],
        input: {
          text: 'Enter commitment ID',
        },
      },
    });
  } catch (error) {
    console.error('Error viewing commitments:', error);
    return createErrorFrame('Failed to view commitments');
  }
}

// Default handler
function handleDefault() {
  return NextResponse.json({
    frames: {
      version: 'vNext',
      image: `${baseUrl}/api/image/commitments`,
      buttons: [
        {
          label: 'Create Commitment',
          action: 'post',
          target: `${baseUrl}/api/action/create`,
        },
        {
          label: 'Sign Commitment',
          action: 'post',
          target: `${baseUrl}/api/action/sign`,
        },
        {
          label: 'View Commitments',
          action: 'post',
          target: `${baseUrl}/api/action/view`,
        }
      ],
      input: {
        text: 'Enter commitment text or ID',
      },
    },
  });
}

// Helper function to create an error frame
function createErrorFrame(errorMessage: string) {
  return NextResponse.json({
    frames: {
      version: 'vNext',
      image: `${baseUrl}/api/image/error?message=${encodeURIComponent(errorMessage)}`,
      buttons: [
        {
          label: 'Try Again',
          action: 'post',
        },
        {
          label: 'View All',
          action: 'post',
          target: `${baseUrl}/api/action/view`,
        },
        {
          label: 'Create New',
          action: 'post',
          target: `${baseUrl}/api/action/create`,
        }
      ],
    },
  });
}
