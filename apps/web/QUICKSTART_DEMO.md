# QuietWord Demo - Quick Start Guide

Welcome to QuietWord! This guide will help you explore the app in demo mode.

## 🚀 Start the App

```bash
pnpm install
pnpm dev
```

Then visit: **http://localhost:5173**

---

## 📱 Explore the Features

### 1. Home Dashboard (`/`)

You'll see:
- **3-day streak** counter
- **Pending recall quiz** - Try answering it!
  - Click an answer to see toast feedback (correct/incorrect)
- **Resume card** - Shows you left off at John 1:1-14, Chunk 3
- **Today's reading** - Two sections: Gospel and Psalm
- **"Demo Mode" badge** in header (blue)

**Try:**
- Answer the recall quiz
- Click "Continue reading" to resume
- Click "Gospel" or "Psalm" to start fresh

---

### 2. Settle Page (`/settle/john`)

A moment to prepare before reading.

**Try:**
- Read the calming instructions
- Click "Begin reading"

---

### 3. Reader Page (`/reader/john`)

The main reading experience!

**Features:**
- **Passage text** - John 1:1-14 in large, readable type
- **Chunk navigation** - 5 chunks total
- **Progress bar** - Shows your position
- **Keyboard shortcuts**:
  - `→` Next chunk
  - `←` Previous chunk
  - `ESC` Exit to home

**Try:**
1. Navigate through chunks with arrow keys
2. Watch for checkpoint at chunk 3 (midpoint)
3. Save a note at the checkpoint (or skip)
4. Continue to chunk 5 for final checkpoint
5. **See beautiful completion animation!** ✨
   - Animated checkmark badge (spins in with spring effect)
   - Fade-in of completion message
   - Smart button: "Continue to Psalm" (if John) or "Complete day" (if Psalm)

---

### 4. Completion Animation 🎉

When you finish all chunks in a section:

**Animation Sequence:**
1. Card fades in and scales up (0.5s)
2. Checkmark badge spins into view with spring bounce (0.6s)
3. Title and message fade in (0.4s delay)
4. Buttons appear (0.6s delay)

**Smart Next Steps:**
- **After Gospel**: "Continue to Psalm" → Takes you to `/settle/psalm`
- **After Psalm**: "Complete day" → Advances day and returns home

**Try:**
- Read through all 5 John chunks to see the animation
- Click "Continue to Psalm" to seamlessly flow to next section

---

### 5. Checkpoint Prompt

Appears at John chunk 3 and chunk 5, and Psalm chunk 3.

**Try:**
- Select a note type (Question, Promise, Conviction, Action, Comfort)
- Write a note
- Click "Save & Continue" → See success toast!
- Or click "Skip" to continue without saving

---

### 6. Notes Page (`/notes`)

View all your saved notes.

**Features:**
- Colored badges by note type
- Scripture reference
- Date created (Today, Yesterday, X days ago)

**Try:**
- Save multiple notes from Reader
- Return to Notes page to see them all

---

### 7. Settings Page (`/settings`)

Customize your experience.

**Try:**
- Change translation (WEB → KJV)
- Switch pace (Standard → Short)
- Update reminder time
- Click "Save changes" → See success toast!

---

### 8. Complete a Day

**Full Flow:**
1. Start at Home
2. Click "Gospel" → Settle → Begin reading
3. Read through all John chunks (save notes at checkpoints)
4. Return to Home
5. Click "Psalm" → Settle → Begin reading
6. Read through all Psalm chunks
7. Click "Complete day now"
8. See success toast: "Day completed! Come back tomorrow."
9. Notice day advances and new recall appears

---

## 🎯 Things to Try

### Test Toast Notifications
- ✅ Answer recall correctly → Success toast
- ℹ️ Answer recall incorrectly → Info toast with encouragement
- 💾 Save a note → "Note saved"
- ⚙️ Update settings → "Settings saved successfully"

### Test Keyboard Shortcuts (in Reader)
- `→` Navigate forward
- `←` Navigate backward  
- `ESC` Exit to home
- Type in note textarea → Shortcuts disabled (won't interfere)

### Test Error Handling
- Refresh during loading → See loading spinner
- All errors show retry buttons

### Test Network Detection
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Offline"
4. See toast: "No internet connection"
5. Click "Online"
6. See toast: "Back online"

---

## 📊 Demo Data

### Passages Available
- **John 1:1-14**: The Word made flesh (5 chunks)
  - Checkpoint at chunk 3 (midpoint)
  - Checkpoint at chunk 5 (end)
- **Psalm 23**: The Lord is my shepherd (3 chunks)
  - Response prompt at chunk 3 (end)

### Current State
- Day 1 of 90
- 3-day streak
- Resume point: John 1:1-14, Chunk 3
- 1 pending recall quiz

---

## 🎨 Notice the Design

**Calm Aesthetic:**
- Sage green primary color (#6B7F6A)
- Soft gradients (off-white to white)
- Large, readable text (18px base)
- Generous spacing and rounded cards
- Minimal controls, clear next actions

**Intentional UX:**
- No jarring animations
- Subtle hover states
- Clear visual hierarchy
- Low friction throughout

---

## 🔄 Reset Demo Data

Demo data is stored in memory. To reset:
- Refresh the page (all state resets)

---

## 🚀 Next Steps

### Switch to Real Backend

When ready, update `.env`:

```bash
# Disable demo mode
# VITE_DEMO_MODE=true

# Set your backend URL
VITE_API_BASE_URL=http://localhost:8080
```

Then restart:
```bash
pnpm dev
```

---

## 💡 Tips

1. **Use keyboard shortcuts** in Reader for fastest navigation
2. **Try all note types** to see the different colored badges
3. **Answer the recall quiz** to see the feedback system
4. **Complete a full day** to see day progression
5. **Test on mobile** - the layout is fully responsive

---

**Enjoy exploring QuietWord! Built for busy minds. One passage at a time.** 📖✨