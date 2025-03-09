// src/app/api/commitments/sign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { commitmentUtils } from '@/lib/redis';
import { SignCommitmentRequest } from '@/lib/models/commitment';

// POST /api/commitments/sign - Sign up for a commitment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commitmentId, fid } = body as SignCommitmentRequest;
    
    // Validate request
    if (!commitmentId || !fid) {
      return NextResponse.json(
        { error: 'Missing required fields: commitmentId and fid' },
        { status: 400 }
      );
    }
    
    // Sign commitment
    const success = await commitmentUtils.signCommitment(commitmentId, fid);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Commitment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error signing commitment:', error);
    return NextResponse.json(
      { error: 'Failed to sign commitment' },
      { status: 500 }
    );
  }
}