
// src/lib/kv.ts
import { kv } from '@vercel/kv';
import { Commitment } from './models/commitment';

// Key prefixes for different data types
const COMMITMENT_PREFIX = 'commitment:';
const USER_PREFIX = 'user:';

// Export the kv instance for direct access if needed
export { kv };

// Helper function to generate keys
const generateKey = (prefix: string, id: string) => `${prefix}${id}`;

// Commitment-related functions
export const commitmentUtils = {
  // Create a new commitment
  async createCommitment(commitment: Commitment): Promise<string> {
    const id = crypto.randomUUID();
    const key = generateKey(COMMITMENT_PREFIX, id);
    
    // Add metadata
    commitment.id = id;
    commitment.createdAt = Date.now();
    
    // Store in KV
    await kv.set(key, commitment);
    
    // Add to list of all commitments
    await kv.sadd('commitments', id);
    
    return id;
  },
  
  // Get a commitment by ID
  async getCommitment(id: string): Promise<Commitment | null> {
    const key = generateKey(COMMITMENT_PREFIX, id);
    return await kv.get(key);
  },
  
  // Get all commitments
  async getAllCommitments(): Promise<Commitment[]> {
    const ids = await kv.smembers('commitments') as string[];
    
    if (!ids.length) return [];
    
    const commitments = await Promise.all(
      ids.map(id => this.getCommitment(id))
    );
    
    return commitments.filter(Boolean) as Commitment[];
  },
  
  // Sign up for a commitment
  async signCommitment(commitmentId: string, fid: number): Promise<boolean> {
    const key = generateKey(COMMITMENT_PREFIX, commitmentId);
    const commitment = await kv.get(key) as Commitment | null;
    
    if (!commitment) return false;
    
    // Add user to participants if not already there
    if (!commitment.participants) {
      commitment.participants = {};
    }
    
    commitment.participants[fid] = {
      joinedAt: Date.now(),
      status: 'active'
    };
    
    await kv.set(key, commitment);
    return true;
  },
  
  // Revoke a commitment
  async revokeCommitment(commitmentId: string, fid: number, reason: string): Promise<boolean> {
    const key = generateKey(COMMITMENT_PREFIX, commitmentId);
    const commitment = await kv.get(key) as Commitment | null;
    
    if (!commitment || !commitment.participants || !commitment.participants[fid]) {
      return false;
    }
    
    commitment.participants[fid].status = 'revoked';
    commitment.participants[fid].revokeReason = reason;
    
    await kv.set(key, commitment);
    return true;
  }
};