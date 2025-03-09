// src/lib/models/commitment.ts

// Commitment status types
export type CommitmentStatus = 'active' | 'revoked';

// Participant in a commitment
export interface CommitmentParticipant {
  joinedAt: number;
  status: CommitmentStatus;
  revokeReason?: string;
}

// Main commitment interface
export interface Commitment {
  id: string;           // Unique identifier
  text: string;         // The commitment text
  creatorFid: number;   // Farcaster ID of creator
  createdAt: number;    // Timestamp
  participants: {       // People who signed up
    [fid: string]: CommitmentParticipant
  };
}

// Create commitment request
export interface CreateCommitmentRequest {
  text: string;
  creatorFid: number;
}

// Sign commitment request
export interface SignCommitmentRequest {
  commitmentId: string;
  fid: number;
}

// Revoke commitment request
export interface RevokeCommitmentRequest {
  commitmentId: string;
  fid: number;
  reason: string;
}