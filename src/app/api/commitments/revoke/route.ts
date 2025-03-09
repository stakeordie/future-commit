// src/app/api/commitments/revoke/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { commitmentUtils } from '@/lib/redis';
import { RevokeCommitmentRequest } from '@/lib/models/commitment';

// POST /api/commitments/revoke - Revoke a commitment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commitmentId, fid, reason } = body as RevokeCommitmentRequest;
    
    // Validate request
    if (!commitmentId || !fid) {
      return NextResponse.json(
        { error: 'Missing required fields: commitmentId and fid' },
        { status: 400 }
      );
    }
    
    // Revoke commitment
    const success = await commitmentUtils.revokeCommitment(commitmentId, fid, reason || 'No reason provided');
    
    if (!success) {
      return NextResponse.json(
        { error: 'Commitment not found or user not participating' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking commitment:', error);
    return NextResponse.json(
      { error: 'Failed to revoke commitment' },
      { status: 500 }
    );
  }
}