// src/app/api/commitments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { commitmentUtils } from '@/lib/redis';

// GET /api/commitments/[id] - Get commitment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15, params is a Promise that needs to be awaited
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Commitment ID is required' },
        { status: 400 }
      );
    }
    
    const commitment = await commitmentUtils.getCommitment(id);
    
    if (!commitment) {
      return NextResponse.json(
        { error: 'Commitment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ commitment });
  } catch (error) {
    console.error('Error fetching commitment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commitment' },
      { status: 500 }
    );
  }
}