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
    const fid = frameData.untrustedData?.fid;
    
    // Validate input
    if (!inputText) {
      return createErrorFrame('Please enter commitment text');
    }
    
    // Create a new commitment
    const commitmentId = await commitmentUtils.createCommitment({
      id: '', // Will be set by createCommitment
      text: inputText,
      creatorFid: fid,
      createdAt: 0, // Will be set by createCommitment
      participants: {}
    });
    
    // Return success frame
    return NextResponse.json({
      frames: {
        version: 'vNext',
        image: `${baseUrl}/api/image?id=${commitmentId}`,
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