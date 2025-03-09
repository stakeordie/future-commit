import { NextResponse } from 'next/server';

// This is a simple endpoint to reset the counter
// In a real application, you might want to use a database to store the counter
export async function POST() {
  try {
    // Get the base URL for the frame
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Return a new frame as the response with reset counter
    return NextResponse.json({
      frames: {
        version: 'vNext',
        image: `${baseUrl}/api/image?count=0`,
        buttons: [
          {
            label: 'Click me!',
            action: 'post',
            target: `${baseUrl}/api/action`,
          },
          {
            label: 'Visit website',
            action: 'link',
            target: 'https://farcaster.xyz',
          },
        ],
        input: {
          text: 'Enter your message',
        },
      },
    });
  } catch (error) {
    console.error('Error resetting counter:', error);
    return NextResponse.json(
      { error: 'Error resetting counter' },
      { status: 500 }
    );
  }
}
