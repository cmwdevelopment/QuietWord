# QuietWord Demo Mode

Demo Mode allows you to explore the QuietWord UI/UX without connecting to a backend server. All data is mocked and stored in memory.

## Enabling Demo Mode

Demo mode is **enabled by default** when you first clone the project.

### Option 1: Using .env file (Recommended)
```bash
# In your .env file
VITE_DEMO_MODE=true
```

### Option 2: No API URL
If you don't set `VITE_API_BASE_URL`, demo mode activates automatically.

## Features in Demo Mode

All features work with realistic mock data:

✅ **Home Dashboard**
- 3-day streak displayed
- Pending recall quiz with 3 choices
- Resume card showing John 1:1-14, Chunk 3
- Today's reading: John 1:1-14 and Psalm 23:1-6

✅ **Reading Experience**
- Full Gospel of John passage (14 verses, 5 chunks)
- Full Psalm 23 passage (6 verses, 3 chunks)
- Checkpoint prompts at correct positions
- Progress tracking and resume state
- Keyboard shortcuts (← → for navigation, ESC to exit)

✅ **Notes System**
- Create notes at checkpoints
- View saved notes with proper formatting
- 5 note types: Question, Promise, Conviction, Action, Comfort

✅ **Settings**
- Change translation (WEB, KJV, ASV, BBE, DARBY)
- Adjust reading pace (Short, Standard)
- Set reminder time
- All changes persist in memory

✅ **Recall Quizzes**
- Answer multiple-choice questions
- Get feedback on correct/incorrect answers
- New recall generated after completing a day

✅ **Day Completion**
- Complete reading sections
- Advance to next day
- Generate new recall quizzes

## Demo Data

### Mock Passages
- **John 1:1-14**: The Word made flesh (5 chunks)
- **Psalm 23**: The Lord is my shepherd (3 chunks)

### Default Settings
- Translation: World English Bible (WEB)
- Pace: Standard
- Reminder Time: 8:00 AM
- Current Day: Day 1
- Streak: 3 days

### Sample Recall
A pending recall quiz is pre-populated about John the Baptist and the light.

## Switching to Real Backend

When your backend is ready:

1. Update `.env`:
   ```bash
   # Comment out or remove demo mode
   # VITE_DEMO_MODE=true
   
   # Set your backend URL
   VITE_API_BASE_URL=http://localhost:8080
   ```

2. Restart the dev server:
   ```bash
   pnpm dev
   ```

The app will automatically switch to using real API calls.

## Limitations

Since demo mode uses in-memory storage:
- Data resets on page refresh
- No persistence between sessions
- Some advanced features may have simplified behavior

## Demo Mode Indicator

When running in demo mode, you'll see a "Demo Mode" badge in the header of the Home page.

---

**Perfect for:**
- UI/UX exploration
- Design review
- Frontend development
- Testing user flows
- Demos and presentations
