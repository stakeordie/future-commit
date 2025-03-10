import { NextRequest, NextResponse } from 'next/server';
import { createCanvas } from 'canvas';
import { commitmentUtils } from '@/lib/redis';
// import { Commitment } from '@/lib/models/commitment';
import { CanvasRenderingContext2D as NodeCanvasRenderingContext2D } from 'canvas';



// Function to generate images for our commitment tracker frame
export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const commitmentId = searchParams.get('id');
  // const showAll = searchParams.get('all') === 'true';
  const errorMessage = searchParams.get('message');
  const signed = searchParams.get('signed') === 'true';
  
  // Create a canvas with 1.91:1 aspect ratio (standard for frames)
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d') as NodeCanvasRenderingContext2D;
  
  // Fill background
  ctx.fillStyle = '#4F46E5'; // Indigo color
  ctx.fillRect(0, 0, width, height);
  
  // Add header
  ctx.font = 'bold 60px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText('Commitment Tracker', width / 2, 80);
  
  // Handle different image types
  if (errorMessage) {
    // Error message image
    await drawErrorImage(ctx, width, height, errorMessage);
  } else if (commitmentId) {
    // Single commitment image
    await drawCommitmentImage(ctx, width, height, commitmentId, signed);
  } else {
    // All commitments or default image
    await drawAllCommitmentsImage(ctx, width, height);
  }
  
  // Add timestamp
  const timestamp = new Date().toISOString();
  ctx.font = '20px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText(`Generated at: ${timestamp}`, width / 2, height - 20);
  
  // Convert canvas to buffer
  const buffer = canvas.toBuffer('image/png');
  
  // Return the image
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

// Draw an error message image
async function drawErrorImage(
  ctx: NodeCanvasRenderingContext2D,
  width: number,
  height: number,
  errorMessage: string
) {
  // Draw error icon or symbol
  ctx.fillStyle = '#FF4A4A'; // Red color
  ctx.beginPath();
  ctx.arc(width / 2, height / 2 - 60, 70, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw X symbol
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 40, height / 2 - 100);
  ctx.lineTo(width / 2 + 40, height / 2 - 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(width / 2 + 40, height / 2 - 100);
  ctx.lineTo(width / 2 - 40, height / 2 - 20);
  ctx.stroke();
  
  // Draw error message
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText('Error', width / 2, height / 2 + 40);
  
  // Draw error details - handle long messages by wrapping text
  ctx.font = '30px Arial';
  const words = errorMessage.split(' ');
  let line = '';
  let y = height / 2 + 100;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width - 100 && i > 0) {
      ctx.fillText(line, width / 2, y);
      line = words[i] + ' ';
      y += 40;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, width / 2, y);
}

// Draw a single commitment image
async function drawCommitmentImage(
  ctx: NodeCanvasRenderingContext2D,
  width: number,
  height: number,
  commitmentId: string,
  signed: boolean = false
) {
  // Fetch the commitment
  const commitment = await commitmentUtils.getCommitment(commitmentId);
  
  if (!commitment) {
    // Commitment not found
    drawErrorImage(ctx, width, height, 'Commitment not found');
    return;
  }
  
  // Draw commitment ID
  ctx.font = '24px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText(`ID: ${commitment.id}`, width / 2, 130);
  
  // Draw commitment text
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = 'white';
  
  // Handle text wrapping for commitment text
  const words = commitment.text.split(' ');
  let line = '';
  let y = 200;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width - 200 && i > 0) {
      ctx.fillText(line, width / 2, y);
      line = words[i] + ' ';
      y += 50;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, width / 2, y);
  
  // Draw creator info
  y += 70;
  ctx.font = '30px Arial';
  ctx.fillText(`Created by: FID ${commitment.creatorFid}`, width / 2, y);
  
  // Draw creation date
  y += 40;
  const createdDate = new Date(commitment.createdAt).toLocaleString();
  ctx.font = '24px Arial';
  ctx.fillText(`Created on: ${createdDate}`, width / 2, y);
  
  // Draw participants count
  y += 60;
  const participantCount = Object.keys(commitment.participants || {}).length;
  ctx.font = 'bold 32px Arial';
  ctx.fillText(`${participantCount} participants`, width / 2, y);
  
  // Draw signed message if needed
  if (signed) {
    ctx.fillStyle = '#4ADE80'; // Green color
    ctx.beginPath();
    ctx.arc(width / 2, height - 120, 50, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('✓ Signed!', width / 2, height - 110);
  }
}

// Draw all commitments image
async function drawAllCommitmentsImage(
  ctx: NodeCanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Fetch all commitments
  const commitments = await commitmentUtils.getAllCommitments();
  
  if (!commitments || commitments.length === 0) {
    // No commitments found
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('No commitments found', width / 2, height / 2);
    ctx.font = '30px Arial';
    ctx.fillText('Create your first commitment!', width / 2, height / 2 + 60);
    return;
  }
  
  // Draw commitments count
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`${commitments.length} Commitments`, width / 2, 140);
  
  // Draw list of recent commitments (up to 5)
  const recentCommitments = commitments.slice(0, 5);
  let y = 200;
  
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Recent Commitments:', width / 2, y);
  y += 50;
  
  // Draw each commitment in the list
  for (const commitment of recentCommitments) {
    // Draw rounded rectangle background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    roundRect(ctx, 150, y - 30, width - 300, 80, 10, true, false);
    
    // Truncate text if too long
    let text = commitment.text;
    if (text.length > 50) {
      text = text.substring(0, 47) + '...';
    }
    
    // Draw commitment text
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(text, width / 2, y);
    
    // Draw participant count
    const participantCount = Object.keys(commitment.participants || {}).length;
    ctx.font = '20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`${participantCount} participants`, width / 2, y + 30);
    
    y += 100;
  }
  
  // Add instructions
  ctx.font = '28px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText('Enter a commitment ID to view details', width / 2, height - 80);
}

// Helper function to draw rounded rectangles
function roundRect(
  ctx: NodeCanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: boolean,
  stroke: boolean
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
