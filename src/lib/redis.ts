// src/lib/redis.ts
import { createClient } from 'redis';
import { Commitment } from './models/commitment';

// User profile type definition (moved from auth.ts)
export interface UserProfile {
  fid: number;
  username: string;
  displayName?: string;
  avatar?: string;
  isVerified: boolean;
}

// Create Redis client - we'll connect when needed
const getRedisClient = async () => {
  const client = createClient({ 
    url: process.env.NEXT_PUBLIC_REDIS_URL,
    // Add any other options needed
  });
  
  // Connect if not already connected
  if (!client.isOpen) {
    await client.connect();
  }
  
  return client;
};

// Key prefixes for different data types
const COMMITMENT_PREFIX = 'commitment:';
const USER_DATA_PREFIX = 'user:data:';

// TTL values (in seconds)
const USER_DATA_TTL = 60 * 60; // 1 hour

// User data caching functions



/**
 * Cache user data by FID to reduce API calls
 * @param fid Farcaster ID
 * @param userData User data to cache
 * @returns Promise resolving to true if successful
 */
export async function cacheUserData(fid: string | number, userData: UserProfile): Promise<boolean> {
  const client = await getRedisClient();
  const key = `${USER_DATA_PREFIX}${fid}`;
  
  await client.set(key, JSON.stringify(userData), {
    EX: USER_DATA_TTL
  });
  
  return true;
}

/**
 * Get cached user data by FID
 * @param fid Farcaster ID
 * @returns The cached user data or null if not found
 */
export async function getCachedUserData(fid: string | number): Promise<UserProfile | null> {
  const client = await getRedisClient();
  const key = `${USER_DATA_PREFIX}${fid}`;
  
  const data = await client.get(key);
  if (!data) return null;
  
  return JSON.parse(data);
}

// Commitment-related functions
export const commitmentUtils = {
  // Create a new commitment
  async createCommitment(commitment: Commitment): Promise<string> {
    const redis = await getRedisClient();
    
    const id = crypto.randomUUID();
    const key = generateKey(COMMITMENT_PREFIX, id);
    
    // Add metadata
    commitment.id = id;
    commitment.createdAt = Date.now();
    
    // Store in Redis
    await redis.set(key, JSON.stringify(commitment));
    
    // Add to list of all commitments
    await redis.sAdd('commitments', id);
    
    return id;
  },
  
  // Get a commitment by ID
  async getCommitment(id: string): Promise<Commitment | null> {
    const redis = await getRedisClient();
    
    const key = generateKey(COMMITMENT_PREFIX, id);
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  
  // Get all commitments
  async getAllCommitments(): Promise<Commitment[]> {
    const redis = await getRedisClient();
    
    const ids = await redis.sMembers('commitments');
    
    if (!ids.length) return [];
    
    const commitments = await Promise.all(
      ids.map(id => this.getCommitment(id))
    );
    
    return commitments.filter(Boolean) as Commitment[];
  },
  
  // Sign up for a commitment
  async signCommitment(commitmentId: string, fid: number): Promise<boolean> {
    const redis = await getRedisClient();
    
    const key = generateKey(COMMITMENT_PREFIX, commitmentId);
    const data = await redis.get(key);
    const commitment = data ? JSON.parse(data) as Commitment : null;
    
    if (!commitment) return false;
    
    // Add user to participants if not already there
    if (!commitment.participants) {
      commitment.participants = {};
    }
    
    commitment.participants[fid] = {
      joinedAt: Date.now(),
      status: 'active'
    };
    
    await redis.set(key, JSON.stringify(commitment));
    return true;
  },
  
  // Revoke a commitment
  async revokeCommitment(commitmentId: string, fid: number, reason: string): Promise<boolean> {
    const redis = await getRedisClient();
    
    const key = generateKey(COMMITMENT_PREFIX, commitmentId);
    const data = await redis.get(key);
    const commitment = data ? JSON.parse(data) as Commitment : null;
    
    if (!commitment || !commitment.participants || !commitment.participants[fid]) {
      return false;
    }
    
    commitment.participants[fid].status = 'revoked';
    commitment.participants[fid].revokeReason = reason;
    
    await redis.set(key, JSON.stringify(commitment));
    return true;
  }
};

// Helper function to generate keys
const generateKey = (prefix: string, id: string) => `${prefix}${id}`;