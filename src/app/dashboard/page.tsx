'use client';

import { useEffect, useState } from 'react';
import { useNeynarContext } from '@neynar/react';
import { useRouter } from 'next/navigation';
import { Commitment } from '@/lib/models/commitment';
import { commitmentUtils } from '@/lib/redis';
import Image from 'next/image';

export default function Dashboard() {
  const { isAuthenticated, user, logoutUser } = useNeynarContext();
  const router = useRouter();
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommitmentText, setNewCommitmentText] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Load commitments
  useEffect(() => {
    async function loadCommitments() {
      try {
        const response = await fetch('/api/commitments');
        const data = await response.json();
        setCommitments(data.commitments || []);
      } catch (err) {
        console.error('Error loading commitments:', err);
        setError('Failed to load commitments');
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadCommitments();
    }
  }, [isAuthenticated]);

  // Create new commitment
  const handleCreateCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommitmentText.trim() || !user?.fid) return;

    setCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/commitments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newCommitmentText,
          creatorFid: user.fid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create commitment');
      }

      const data = await response.json();
      
      // Refresh commitments
      const updatedResponse = await fetch('/api/commitments');
      const updatedData = await updatedResponse.json();
      setCommitments(updatedData.commitments || []);
      
      // Clear form
      setNewCommitmentText('');
    } catch (err) {
      console.error('Error creating commitment:', err);
      setError('Failed to create commitment');
    } finally {
      setCreating(false);
    }
  };

  // Sign a commitment
  const handleSignCommitment = async (commitmentId: string) => {
    if (!user?.fid) return;

    try {
      const response = await fetch('/api/commitments/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commitmentId,
          fid: user.fid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sign commitment');
      }

      // Refresh commitments
      const updatedResponse = await fetch('/api/commitments');
      const updatedData = await updatedResponse.json();
      setCommitments(updatedData.commitments || []);
    } catch (err) {
      console.error('Error signing commitment:', err);
      setError('Failed to sign commitment');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="snes-page snes-container">
      <header className="snes-header">
        <div className="mx-auto max-w-7xl flex justify-between items-center">
          <h1 className="snes-header-title">Commitment Tracker</h1>
          <div className="snes-user-profile">
            {user?.pfp_url && (
              <Image
                src={user.pfp_url}
                width={32}
                height={32}
                alt="User Profile"
                className="snes-avatar"
              />
            )}
            <div>
              <span className="snes-username">@{user?.username}</span>
              <button
                onClick={logoutUser}
                className="snes-button snes-button-small snes-button-danger"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl">
        <div className="snes-panel">
          <h2 className="snes-title">Create New Commitment</h2>
          <form onSubmit={handleCreateCommitment}>
            <div>
              <label htmlFor="commitment-text" className="snes-label">
                Commitment Text
              </label>
              <div>
                <textarea
                  id="commitment-text"
                  name="text"
                  rows={3}
                  className="snes-textarea"
                  placeholder="I commit to..."
                  value={newCommitmentText}
                  onChange={(e) => setNewCommitmentText(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={creating}
                className="snes-button"
              >
                {creating ? (
                  <>
                    <span className="snes-loading"></span>
                    Creating...
                  </>
                ) : 'Create Commitment'}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="snes-alert snes-alert-error">
            {error}
          </div>
        )}

        <div className="snes-panel">
          <h2 className="snes-title">Your Commitments</h2>
          
          {loading ? (
            <div className="snes-panel snes-text">
              <span className="snes-loading"></span>
              Loading commitments...
            </div>
          ) : commitments.length === 0 ? (
            <div className="snes-empty-state">
              No commitments found. Create your first one!
            </div>
          ) : (
            <div className="space-y-4">
              {commitments.map((commitment) => (
                <div key={commitment.id} className="snes-card">
                  <div className="snes-card-header">
                    <h3 className="snes-card-title">{commitment.text}</h3>
                    <span className="snes-card-date">
                      {new Date(commitment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="snes-card-content">
                    <p className="snes-text">
                      Created by: FID {commitment.creatorFid}
                    </p>
                  </div>
                  <div className="snes-card-footer">
                    <span className="snes-text">
                      {Object.keys(commitment.participants || {}).length} participants
                    </span>
                    {user && commitment.creatorFid !== user.fid && (
                      <button
                        onClick={() => handleSignCommitment(commitment.id)}
                        className="snes-button snes-button-small snes-button-secondary"
                      >
                        Sign
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}