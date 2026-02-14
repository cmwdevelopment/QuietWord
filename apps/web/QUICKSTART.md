# QuietWord Frontend - Quick Start Guide

Get up and running with QuietWord in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- QuietWord backend running (default: `http://localhost:8080`)

## Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` if your backend is not on `http://localhost:8080`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:43173` (or the port Vite assigns).

### 4. Verify Connection

1. Open the app in your browser
2. You should see the Home page with today's reading
3. If you see an error, check:
   - Backend is running
   - `VITE_API_BASE_URL` is correct
   - CORS is configured on backend

## First Time Setup

If this is your first time running the app:

1. Navigate to `/onboarding`
2. Select your preferred:
   - Bible translation
   - Reading pace
   - Daily reminder time
3. Click "Begin"

## Testing the Full Flow

### Complete Reading Flow
1. **Home** → Click "Gospel" or "Psalm"
2. **Settle** → Calm preparation screen → Click "Begin reading"
3. **Reader** → Navigate through chunks:
   - Use "Next" and "Previous" buttons
   - Progress bar shows your position
   - Checkpoint appears at midpoint (John) or end (Psalm)
4. **Checkpoint** → Save a note or skip
5. **Section Complete** → Click "Complete day now"
6. **Home** → See updated streak and recall quiz

### Other Pages
- **Notes** → View all saved reflections
- **Settings** → Change translation, pace, or reminder time

## Common Tasks

### Change Backend URL
Edit `.env` and restart dev server:
```env
VITE_API_BASE_URL=http://localhost:3000
```

### View API Requests
Open browser DevTools → Network tab → Filter by "Fetch/XHR"

### Clear Browser State
If you encounter issues, clear browser cache and localStorage.

### Debug API Errors
Check console for detailed error messages. API errors will show:
```
API Error: 404 Not Found
```

## Project Structure at a Glance

```
/src
├── /pages          # Main application pages
│   ├── Home.tsx
│   ├── Reader.tsx
│   ├── Settle.tsx
│   └── ...
├── /components     # Reusable UI components
│   ├── PrimaryButton.tsx
│   ├── ChunkPager.tsx
│   └── Checkpoint.tsx
├── /lib           # Business logic
│   ├── api.ts     # API client
│   └── types.ts   # TypeScript types
└── /app           # App configuration
    ├── App.tsx
    └── routes.tsx
```

## Key Features to Test

✅ **Chunked Reading** - Passages split into digestible pieces  
✅ **Auto-save Progress** - Resume exactly where you left off  
✅ **Checkpoints** - Reflection prompts at key moments  
✅ **Notes** - Capture insights (Questions, Promises, etc.)  
✅ **Recall Quizzes** - Daily review to reinforce learning  
✅ **Grace Streaks** - Flexible streak tracking  

## Design Philosophy

QuietWord follows these UX principles:

- **Large, readable type** (18px base font)
- **Generous spacing** (1.75 line-height for body text)
- **Minimal controls** (one primary action per screen)
- **Clear navigation** (always know where you are and how to get back)
- **Low friction** (auto-save, no unnecessary prompts)

## Troubleshooting

### "Unable to connect to the server"
- ✅ Check backend is running
- ✅ Verify `VITE_API_BASE_URL` in `.env`
- ✅ Check browser console for CORS errors

### Page is blank
- ✅ Check browser console for JavaScript errors
- ✅ Ensure all dependencies are installed
- ✅ Try hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

### Types not working
- ✅ Restart TypeScript server in your editor
- ✅ Check `/src/vite-env.d.ts` exists

### Bootstrap data not loading
- ✅ Verify backend `/api/bootstrap` endpoint works
- ✅ Check Network tab in DevTools
- ✅ Ensure backend returns valid JSON

## Next Steps

- Read [API_INTEGRATION.md](./API_INTEGRATION.md) for detailed API docs
- Read [README.md](./README.md) for complete project overview
- Customize colors in `/src/components/PrimaryButton.tsx`
- Adjust typography in `/src/styles/theme.css`

## Need Help?

Check the following files for detailed information:
- **API Integration:** `API_INTEGRATION.md`
- **Project Overview:** `README.md`
- **Type Definitions:** `/src/lib/types.ts`
- **API Client:** `/src/lib/api.ts`

Happy reading! 📖
