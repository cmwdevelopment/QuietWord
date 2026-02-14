# QuietWord App Flow

Visual guide to understanding how users navigate through QuietWord.

## 🗺️ Navigation Map

```
┌─────────────────────────────────────────────────────────────┐
│                         HOME (/)                              │
│  • Streak display                                             │
│  • Pending recall quiz                                        │
│  • Resume card (if in progress)                               │
│  • Today's reading: Gospel & Psalm cards                      │
│  • Notes & Settings links in header                           │
└───────────┬─────────────┬──────────────┬────────────┬─────────┘
            │             │              │            │
            v             v              v            v
    ┌───────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐
    │   NOTES   │  │ SETTINGS │  │   SETTLE   │  │ ONBOARD  │
    │   (/notes)│  │(/settings)│  │(/settle/:s)│  │(/onboard)│
    └───────────┘  └──────────┘  └──────┬─────┘  └──────────┘
                                         │
                                         v
                                  ┌──────────────┐
                                  │    READER    │
                                  │ (/reader/:s) │
                                  │              │
                                  │ • Chunks     │
                                  │ • Checkpoints│
                                  │ • Complete   │
                                  └──────────────┘
```

---

## 📖 User Journeys

### Journey 1: First-Time User

```
START
  ↓
ONBOARDING
  • Choose translation
  • Select pace
  • Set reminder
  • Click "Begin"
  ↓
HOME
  • See today's reading
  • Click "Gospel" or "Psalm"
  ↓
SETTLE
  • Read preparation text
  • Click "Begin reading"
  ↓
READER
  • Read chunk 1
  • Press → to next chunk
  • Continue through all chunks
  • Save notes at checkpoints
  ↓
SECTION COMPLETE
  • Return to home or complete day
  ↓
HOME
  • See updated progress
```

### Journey 2: Returning User

```
START
  ↓
HOME
  • See streak
  • Answer recall quiz (if pending)
  • See resume card
  ↓
CLICK "Continue reading"
  ↓
READER
  • Resume at last chunk
  • Use ← → to navigate
  • Complete reading
  ↓
HOME
  • Start next section
```

### Journey 3: Note Review

```
HOME
  ↓
NOTES (click in header)
  • View all saved notes
  • See note types with colors
  • Read past reflections
  ↓
HOME (click back)
```

### Journey 4: Changing Settings

```
HOME
  ↓
SETTINGS (click in header)
  • Change translation
  • Adjust pace
  • Update reminder time
  • Click "Save changes"
  ↓
HOME (click back)
  • New settings applied
```

---

## 🎯 Page-by-Page Breakdown

### Home (`/`)
**Purpose:** Central dashboard and navigation hub

**Can navigate to:**
- `/settle/john` - Start Gospel reading
- `/settle/psalm` - Start Psalm reading
- `/reader/:section` - Resume reading (via resume card)
- `/notes` - View notes
- `/settings` - Change settings

**Key interactions:**
- Answer recall quiz
- Continue reading from resume card
- Start new section
- Complete day

---

### Settle (`/settle/:section`)
**Purpose:** Preparation moment before reading

**Can navigate to:**
- `/reader/:section` - Begin reading
- `/` - Back to home

**Key interactions:**
- Read calming instructions
- Click "Begin reading"

---

### Reader (`/reader/:section`)
**Purpose:** Main reading experience

**Can navigate to:**
- `/` - Exit to home (via ESC or buttons)

**Key interactions:**
- Read passage chunks
- Navigate with ← → or buttons
- Save notes at checkpoints
- Skip checkpoints
- Complete section

**States:**
1. **Reading** - Normal chunk view
2. **Checkpoint** - Reflection/response prompt
3. **Complete** - Section finished

---

### Notes (`/notes`)
**Purpose:** View all saved notes

**Can navigate to:**
- `/` - Back to home

**Key interactions:**
- Scroll through notes
- See note types and references
- View creation dates

---

### Settings (`/settings`)
**Purpose:** Customize user preferences

**Can navigate to:**
- `/` - Back to home

**Key interactions:**
- Change translation
- Adjust reading pace
- Set reminder time
- Save changes

---

### Onboarding (`/onboarding`)
**Purpose:** Initial setup for new users

**Can navigate to:**
- `/` - Begin using app

**Key interactions:**
- Select initial preferences
- Click "Begin"

---

## 🔄 State Transitions

### Reading Progress

```
NOT STARTED
  ↓ (Start reading)
IN PROGRESS
  ↓ (Complete section)
SECTION COMPLETE
  ↓ (Complete both sections)
DAY COMPLETE
  ↓ (Next day)
NOT STARTED (new day)
```

### Checkpoint Flow

```
READING CHUNK
  ↓ (Reach checkpoint chunk)
CHECKPOINT PROMPT
  ├─ (Save note) → Continue reading
  └─ (Skip) → Continue reading
```

### Recall Flow

```
DAY COMPLETE
  ↓ (Generate recall)
PENDING RECALL
  ↓ (Answer question)
NO PENDING RECALL
  ↓ (Next day)
NEW PENDING RECALL
```

---

## ⌨️ Keyboard Navigation Flow

```
HOME
  ↓
SETTLE
  ↓
READER
  ├─ → (Next chunk)
  ├─ ← (Previous chunk)
  └─ ESC (Exit to home)
```

---

## 📱 Responsive Behavior

### Desktop (1280px+)
- Two-column layout for Gospel/Psalm cards
- Wider content area
- Keyboard shortcuts visible

### Tablet (768px - 1279px)
- Single column layout
- Touch-friendly buttons
- Full-width cards

### Mobile (375px - 767px)
- Stacked layout
- Larger touch targets
- Hidden keyboard hints

---

## 🎨 Visual Hierarchy

### Home Page Importance Order
1. **Pending Recall** (urgent, amber background)
2. **Resume Card** (high priority, user in progress)
3. **Today's Reading** (primary action, sage green)
4. **Streak** (motivational, top of page)

### Reader Page Importance Order
1. **Passage Text** (focus, large type)
2. **Progress Indicator** (context, small text)
3. **Navigation Buttons** (action, bottom)

---

## 🔀 Error & Edge Cases

### Network Error
```
ANY PAGE
  ↓ (Network fails)
ERROR STATE
  • Show error message
  • Display retry button
  ↓ (Click retry)
TRY AGAIN
```

### 404 Not Found
```
INVALID URL
  ↓
NOT FOUND PAGE
  • "Page not found" message
  • Return home button
  ↓
HOME
```

### No Notes Yet
```
NOTES PAGE
  ↓ (No notes saved)
EMPTY STATE
  • Friendly message
  • Explanation
  ↓ (User creates note)
NOTES APPEAR
```

---

**This flow ensures users always know where they are and where they can go next.** 🗺️✨
