import { NextRequest, NextResponse } from 'next/server';
import { commitmentUtils } from '@/lib/redis';

// Get the base URL for the frame
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Extract frame data from the request
    const frameData = body;
    const inputText = frameData.untrustedData?.inputText || '';
    const fid = frameData.untrustedData?.fid;
    
    // Validate input
    if (!inputText) {
      return createErrorFrame('Please enter a commitment ID');
    }
    
    // Sign the commitment
    const success = await commitmentUtils.signCommitment(inputText, fid);
    
    if (!success) {
      return createErrorFrame('Commitment not found');
    }
    
    // Return success frame
    return NextResponse.json({
      frames: {
        version: 'vNext',
        image: `${baseUrl}/api/image?id=${inputText}&signed=true`,
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

// Helper function to create an error frame
function createErrorFrame(errorMessage: string) {
  return NextResponse.json({
    frames: {
      version: 'vNext',
      image: `${baseUrl}/api/image?message=${encodeURIComponent(errorMessage)}`,
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