# Lumina - Video Streaming Platform

A professional, clean, and fully functional frontend for a Video Streaming Platform built with React and Next.js. The platform supports two types of users—Viewers and Creators—and focuses on core video streaming functionality, secure authentication, user interaction, and watch history persistence.

## Features

### Authentication
- JWT-based authentication (mock implementation ready for backend integration)
- Role-based access control (Viewer / Creator)
- Protected routes with automatic redirects

### For Viewers
- Browse and search videos
- Filter by categories
- Watch videos with custom HTML5 player
- Auto-resume playback from last position
- Like/dislike videos
- Comment on videos
- Track watch history

### For Creators
- All viewer permissions
- Upload videos with thumbnails
- Manage uploaded videos (view/delete)
- View performance stats (views, likes)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

Using shadcn CLI (Recommended):
```bash
npx shadcn@latest add "https://v0.app/chat/YOUR_CHAT_ID"
```

Or clone and install manually:
```bash
git clone <repository-url>
cd lumina
npm install
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
# API Base URL (when backend is ready)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Project Structure

```
/app
  /login              # Login page
  /register           # Registration page
  /video/[id]         # Video playback page
  /creator/dashboard  # Creator dashboard (upload & manage)
  /channel/[id]       # Creator channel page
  /search             # Search & browse page
  /profile            # User profile & watch history
/components
  navbar.tsx          # Main navigation
  video-card.tsx      # Video thumbnail card
  video-player.tsx    # Custom video player
  upload-form.tsx     # Video upload form
  comment-list.tsx    # Comments display
  protected-route.tsx # Auth guard component
  role-guard.tsx      # Role-based guard
/contexts
  auth-context.tsx    # Authentication state
/services
  api.ts              # API service layer (mock data)
/types
  index.ts            # TypeScript interfaces
/utils
  format.ts           # Formatting utilities
```

## API Integration

The frontend is designed to work with these REST endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | User registration |
| GET | /api/videos | List all videos |
| GET | /api/videos/:id | Get video by ID |
| POST | /api/videos/upload | Upload new video |
| POST | /api/videos/:id/like | Like a video |
| POST | /api/videos/:id/dislike | Dislike a video |
| POST | /api/videos/:id/comment | Add comment |
| POST | /api/videos/:id/progress | Save watch progress |
| GET | /api/users/history | Get watch history |
| GET | /api/creators/:id/videos | Get creator's videos |

Currently uses mock data for demonstration. Replace the API service layer to connect to your backend.

## Demo Accounts

Use any email/password to login. For creator access, include "creator" in the email (e.g., creator@example.com).

## License

MIT
