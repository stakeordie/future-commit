# Farcaster Frame V2 Example

This is a [Next.js](https://nextjs.org) project that demonstrates how to create interactive Farcaster Frames using the Frame V2 API and Neynar integration.

## What are Farcaster Frames?

Frames are interactive elements that can be embedded in Farcaster posts. They allow users to interact with your application directly within their Farcaster feed, enabling a wide range of interactive experiences.

## Features

- Simple interactive frame with buttons and input field
- Frame image generation with dynamic content
- Frame action handling with state management
- Neynar API integration for message validation

## Prerequisites

- Node.js 18+ installed
- A Neynar API key (sign up at [neynar.com](https://neynar.com))

## Getting Started

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Neynar API key:

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEYNAR_API_KEY=your_neynar_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the frame preview.

## How It Works

### Frame Structure

The frame is defined in `src/app/page.tsx` with metadata that specifies:
- The frame image URL
- Button actions and targets
- Input field configuration

### API Routes

- `/api/image`: Generates the frame image dynamically
- `/api/action`: Handles frame interactions and returns updated frames
- `/api/action/reset`: Resets the interaction counter

## Testing Your Frame

To test your frame in the Farcaster ecosystem:

1. Deploy your application to a public URL (Vercel recommended)
2. Update the `NEXT_PUBLIC_BASE_URL` in your environment variables
3. Share your frame URL on Farcaster
4. Users can now interact with your frame directly in their feed

## Deployment

The easiest way to deploy your Frame is to use the [Vercel Platform](https://vercel.com/new).

## Learn More

- [Farcaster Frame Documentation](https://docs.farcaster.xyz/reference/frames/spec)
- [Neynar API Documentation](https://docs.neynar.com/)
- [Next.js Documentation](https://nextjs.org/docs)
