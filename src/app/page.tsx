'use client';

import { useState } from 'react';
import { NeynarAuthButton, useNeynarContext } from '@neynar/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useNeynarContext();
  const [error, setError] = useState<string | null>(null);

  // Handle dashboard navigation when user is authenticated
  const handleDashboardClick = () => {
    try {
      if (isAuthenticated && user) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Failed to navigate to dashboard. Please try again.');
      console.error('Navigation error:', err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Commitment Tracker</h1>
          <p className="mt-2 text-gray-600">Track and share your commitments with others</p>
        </div>

        {error && (
          <div className="p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {isAuthenticated && user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {user.pfp_url && (
                <Image
                  src={user.pfp_url}
                  width={40}
                  height={40}
                  alt="User Profile Picture"
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">{user.display_name}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={handleDashboardClick}
              className="w-full px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="flex justify-center py-4">
            <NeynarAuthButton />
          </div>
        )}

        <div className="pt-4 text-center border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Don&apos;t have a Farcaster account?{' '}
            <a 
              href="https://www.farcaster.xyz/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}