import { Metadata } from 'next';

// Define the base URL for the frame
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Update your frame metadata to include commitment-related buttons
export const metadata: Metadata = {
  title: 'Commitment Tracker',
  description: 'Track and share your commitments with others',
  // Frame metadata
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${baseUrl}/api/image`,
    'fc:frame:image:aspect_ratio': '1.91:1',
    
    // Button actions for commitments
    'fc:frame:button:1': 'Create Commitment',
    'fc:frame:button:1:action': 'post',
    'fc:frame:button:1:target': `${baseUrl}/api/action/create`,
    
    'fc:frame:button:2': 'Sign Commitment',
    'fc:frame:button:2:action': 'post',
    'fc:frame:button:2:target': `${baseUrl}/api/action/sign`,
    
    'fc:frame:button:3': 'View Commitments',
    'fc:frame:button:3:action': 'post',
    'fc:frame:button:3:target': `${baseUrl}/api/action/view`,
    
    // Input field
    'fc:frame:input:text': 'Enter commitment text or ID',
    'fc:frame:post_url': `${baseUrl}/api/action`,
  },
};

export default function FramePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col items-center justify-center w-full max-w-3xl gap-8 text-center">
        <h1 className="text-4xl font-bold">Commitment Tracker Frame</h1>
        <p className="text-xl">
          This page hosts the Farcaster Frame for the Commitment Tracker.
        </p>
        <div className="p-4 mt-8 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Frame Preview</h2>
          <div className="aspect-[1.91/1] w-full bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center border">
            <p className="text-lg font-medium">Frame Image Will Appear Here</p>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex gap-4">
              <button className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                Create Commitment
              </button>
              <button className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600">
                Sign Commitment
              </button>
              <button className="px-4 py-2 text-white bg-purple-500 rounded-lg hover:bg-purple-600">
                View Commitments
              </button>
            </div>
            <div className="flex w-full mt-2">
              <input
                type="text"
                placeholder="Enter commitment text or ID"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
        <div className="mt-8">
          <a
            href="/dashboard"
            className="px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Go to Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}