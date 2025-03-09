import { Metadata } from 'next';

// Define the base URL for the frame
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Define the metadata for the frame
export const metadata: Metadata = {
  title: 'My First Farcaster Frame',
  description: 'A simple interactive frame using Frame V2 API',
  // Frame metadata
  other: {
    // Frame image - what will be displayed in the frame
    'fc:frame': 'vNext',
    'fc:frame:image': `${baseUrl}/api/image`,
    'fc:frame:image:aspect_ratio': '1.91:1',
    
    // Button actions
    'fc:frame:button:1': 'Click me!',
    'fc:frame:button:1:action': 'post',
    'fc:frame:button:1:target': `${baseUrl}/api/action`,
    
    'fc:frame:button:2': 'Visit website',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': 'https://farcaster.xyz',
    
    // Input field
    'fc:frame:input:text': 'Enter your message',
    'fc:frame:post_url': `${baseUrl}/api/action`,
  },
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col items-center justify-center w-full max-w-3xl gap-8 text-center">
        <h1 className="text-4xl font-bold">My First Farcaster Frame</h1>
        <p className="text-xl">
          This is a simple interactive frame using Frame V2 API.
        </p>
        <div className="p-4 mt-8 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Frame Preview</h2>
          <div className="aspect-[1.91/1] w-full bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center border">
            <p className="text-lg font-medium">Frame Image Will Appear Here</p>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex gap-4">
              <button className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                Click me!
              </button>
              <button className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600">
                Visit website
              </button>
            </div>
            <div className="w-full">
              <input
                type="text"
                placeholder="Enter your message"
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
        <div className="p-4 mt-4 text-left border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h2 className="mb-2 text-xl font-semibold">How to Use This Frame</h2>
          <ol className="pl-5 list-decimal">
            <li className="mb-2">Deploy this application to a public URL</li>
            <li className="mb-2">Share the URL on Farcaster</li>
            <li className="mb-2">Users can interact with your frame directly in their Farcaster feed</li>
            <li>Responses will be processed by the API routes</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
