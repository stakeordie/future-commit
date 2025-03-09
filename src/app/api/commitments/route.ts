// src/app/api/commitments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { commitmentUtils } from '@/lib/redis';
import { CreateCommitmentRequest } from '@/lib/models/commitment';

// GET /api/commitments - Get all commitments
export async function GET() {
  try {
    const commitments = await commitmentUtils.getAllCommitments();
    return NextResponse.json({ commitments });
  } catch (error) {
    console.error('Error fetching commitments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commitments' },
      { status: 500 }
    );
  }
}

// POST /api/commitments - Create a new commitment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, creatorFid } = body as CreateCommitmentRequest;
    
    // Validate request
    if (!text || !creatorFid) {
      return NextResponse.json(
        { error: 'Missing required fields: text and creatorFid' },
        { status: 400 }
      );
    }
    
    // Create commitment
    const commitmentId = await commitmentUtils.createCommitment({
      id: '', // Will be set by createCommitment
      text,
      creatorFid,
      createdAt: 0, // Will be set by createCommitment
      participants: {}
    });
    
    return NextResponse.json({ 
      success: true, 
      commitmentId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating commitment:', error);
    return NextResponse.json(
      { error: 'Failed to create commitment' },
      { status: 500 }
    );
  }
}