'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './providers/auth-provider';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const { auth, isLoading, signIn, verifyAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signingIn, setSigningIn] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for auth token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyAuth(token)
        .then(() => {
          router.push('/dashboard');
        })
        .catch(err => {
          setError('Authentication failed. Please try again.');
          console.error('Auth verification error:', err);
        });
    }
  }, [searchParams, verifyAuth, router]);

  // Redirect if already authenticated
  useEffect(() => {
    if (auth?.isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [auth, isLoading, router]);

  const handleSignIn = async () => {
    setSigningIn(true);
    setError(null);
    try {
      // Get the current URL for the redirect
      const baseUrl = window.location.origin;
      const { url } = await signIn(`${baseUrl}/`);
      setQrCodeUrl(url);
    } catch (err) {
      setError('Failed to generate sign-in link. Please try again.');
      console.error('Sign-in error:', err);
    } finally {
      setSigningIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center">Loading...</h1>
        </div>
      </div>
    );
  }

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

        {qrCodeUrl ? (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-semibold">Scan QR Code with Warpcast</h2>
            <div className="flex justify-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`} 
                alt="QR Code for Farcaster Login" 
                className="border rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-500">
              Open your Warpcast app and scan this QR code to sign in
            </p>
            <button
              onClick={() => setQrCodeUrl(null)}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {signingIn ? 'Generating Sign-In Link...' : 'Sign In with Farcaster'}
          </button>
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