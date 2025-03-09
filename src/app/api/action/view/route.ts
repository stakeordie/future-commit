import { NextRequest, NextResponse } from 'next/server';
import { commitmentUtils } from '@/lib/kv';

// Get the base URL for the frame
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Extract frame data from the request
    const frameData = body;
    const inputText = frameData.untrustedData?.inputText || '';
    
    // If a specific commitment ID is provided, show that one
    if (inputText) {
      const commitment = await commitmentUtils.getCommitment(inputText);
      
      if (!commitment) {
        return createErrorFrame('Commitment not found');
      }
      
      return NextResponse.json({
        frames: {
          version: 'vNext',
          image: `${baseUrl}/api/image?id=${inputText}`,
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
        image: `${baseUrl}/api/image?all=true`,
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