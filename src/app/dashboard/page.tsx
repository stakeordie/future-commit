'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Commitment } from '@/lib/models/commitment';
import { commitmentUtils } from '@/lib/redis';

export default function Dashboard() {
  const { auth, signOut } = useAuth();
  const router = useRouter();
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommitmentText, setNewCommitmentText] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!auth?.isAuthenticated) {
      router.push('/');
    }
  }, [auth, router]);

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

    if (auth?.isAuthenticated) {
      loadCommitments();
    }
  }, [auth]);

  // Create new commitment
  const handleCreateCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommitmentText.trim() || !auth?.user?.fid) return;

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
          creatorFid: auth.user.fid,
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
    if (!auth?.user?.fid) return;

    try {
      const response = await fetch('/api/commitments/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commitmentId,
          fid: auth.user.fid,
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

  if (!auth?.isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Commitment Tracker</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">@{auth.user?.username}</span>
            </div>
            <button
              onClick={signOut}
              className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="px-4 py-6 bg-white shadow sm:p-6 sm:rounded-lg">
          <h2 className="text-lg font-medium text-gray-900">Create New Commitment</h2>
          <form onSubmit={handleCreateCommitment} className="mt-4">
            <div>
              <label htmlFor="commitment-text" className="block text-sm font-medium text-gray-700">
                Commitment Text
              </label>
              <div className="mt-1">
                <textarea
                  id="commitment-text"
                  name="text"
                  rows={3}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="I commit to..."
                  value={newCommitmentText}
                  onChange={(e) => setNewCommitmentText(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {creating ? 'Creating...' : 'Create Commitment'}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="px-4 py-3 mt-6 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Your Commitments</h2>
          
          {loading ? (
            <p className="mt-4 text-gray-500">Loading commitments...</p>
          ) : commitments.length === 0 ? (
            <p className="mt-4 text-gray-500">No commitments found. Create your first one!</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {commitments.map((commitment) => (
                <li key={commitment.id} className="p-4 bg-white rounded-lg shadow">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium">{commitment.text}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(commitment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Created by: FID {commitment.creatorFid}
                  </p>
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-700">
                      {Object.keys(commitment.participants || {}).length} participants
                    </span>
                  </div>
                  
                  {auth.user && !commitment.participants?.[auth.user.fid] && (
                    <button
                      onClick={() => handleSignCommitment(commitment.id)}
                      className="px-3 py-1 mt-3 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      Sign This Commitment
                    </button>
                  )}
                  
                  {auth.user && commitment.participants?.[auth.user.fid] && (
                    <div className="px-3 py-1 mt-3 text-sm text-white bg-gray-500 rounded-md inline-block">
                      You've signed this commitment
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}