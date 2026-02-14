# QuietWord Frontend

*Built for busy minds. One passage at a time.*

A minimal, focused scripture reading application built with React, TypeScript, and Tailwind CSS.

## 🚀 Quick Start (Demo Mode)

**Try it immediately without a backend:**

```bash
# The app runs in demo mode by default!
pnpm install
pnpm dev
```

Visit `http://localhost:5173` and explore the full UI with realistic mock data.

📖 **See [QUICKSTART_DEMO.md](./QUICKSTART_DEMO.md) for a guided tour of all features!**

## ✨ What's New

All improvements implemented:
- ✅ **Demo Mode** - Full UI/UX exploration without a backend
- ✅ **Toast Notifications** - User-friendly feedback for all actions
- ✅ **Keyboard Shortcuts** - `← →` to navigate, `ESC` to exit (in Reader)
- ✅ **Loading Spinners** - Consistent loading states throughout
- ✅ **Network Detection** - Automatic online/offline notifications
- ✅ **Environment Setup** - Easy `.env` configuration

See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for complete details.

## Getting Started

1. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   **For Demo Mode (default):**
   ```bash
   VITE_DEMO_MODE=true
   ```
   
   **For Backend Connection:**
   ```bash
   # VITE_DEMO_MODE=true  # Comment this out
   VITE_API_BASE_URL=http://localhost:8080
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Run Development Server**
   ```bash
   pnpm dev
   ```

## Project Structure

```
/src
├── /lib
│   ├── api.ts           # API client for backend integration
│   └── types.ts         # TypeScript type definitions
├── /components
│   ├── PrimaryButton.tsx    # Main CTA button component
│   ├── ChunkPager.tsx       # Passage navigation control
│   └── Checkpoint.tsx       # Reflection/response prompts
├── /pages
│   ├── Home.tsx            # Main dashboard
│   ├── Onboarding.tsx      # Initial setup
│   ├── Settle.tsx          # Pre-reading preparation
│   ├── Reader.tsx          # Main reading experience
│   ├── Notes.tsx           # View saved notes
│   └── Settings.tsx        # User preferences
└── /app
    ├── App.tsx             # Application entry point
    └── routes.tsx          # Route configuration
```

## Routes

- `/` - Home dashboard
- `/onboarding` - Initial setup
- `/settle/:section` - Pre-reading (john | psalm)
- `/reader/:section` - Reading experience (john | psalm)
- `/notes` - View notes
- `/settings` - User settings

## Features

- **Chunked Reading**: Break passages into manageable chunks
- **Progress Tracking**: Save and resume reading position
- **Checkpoints**: Reflection prompts at key moments
- **Notes**: Capture questions, promises, convictions, actions, and comforts
- **Recall System**: Daily review to reinforce learning
- **Grace Streaks**: Maintain momentum with flexible streak tracking

## Design Principles

- Large, readable typography (18px base)
- Generous spacing and line-height
- Soft, pastoral color palette (sage green, warm grays)
- Minimal controls and clear next actions
- Low friction, high focus

## API Integration

The frontend communicates with a backend API using the client in `/src/lib/api.ts`. All endpoints are under `/api` and require:

- Bootstrap data on app load
- Passage fetching with translation support
- State persistence for resume functionality
- Notes creation and retrieval
- Settings management
- Day completion and recall system

See the API client for full endpoint documentation.

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:8080`)
- `VITE_DEMO_MODE` - Enable demo mode (default: `true`)

## Technology Stack

- **React 18** with TypeScript
- **React Router 7** for routing
- **Tailwind CSS v4** for styling
- **Vite** for build tooling