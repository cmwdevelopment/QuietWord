# QuietWord API Integration Guide

This document outlines the complete API integration between the QuietWord frontend and backend.

## Base Configuration

**Environment Variable:** `VITE_API_BASE_URL`  
**Default:** `http://localhost:8080`  
**All endpoints are prefixed with:** `/api`

## API Endpoints

### 1. Bootstrap (`GET /api/bootstrap`)

**Purpose:** Load all initial application data in a single request.

**Response:**
```typescript
{
  plan: {
    planId: string;
    slug: string;
    name: string;
    totalDays: number;
    currentDayIndex: number;
  };
  settings: {
    translation: "WEB" | "KJV" | "ASV" | "BBE" | "DARBY";
    pace: "short" | "standard";
    reminderTime: string; // HH:mm format
  };
  today: {
    dayIndex: number;
    johnRef: string;
    psalmRef: string;
    theme: string;
    completedToday: boolean;
    streak: number;
    graceStreak: number;
  };
  resume: {
    section: "John" | "Psalm";
    lastRef: string;
    lastChunkIndex: number;
    verseAnchor?: string;
    updatedAt: string;
  } | null;
  pendingRecall: {
    recallId: string;
    dayIndex: number;
    choices: { text: string; isCorrect?: boolean }[];
  } | null;
  supportedTranslations: Translation[];
  translationMicrocopy: string;
}
```

**Usage:**
- Called on Home page mount
- Called after settings changes
- Called after day completion
- Called after recall submission

---

### 2. Get Today's Reading (`GET /api/day/today`)

**Purpose:** Fetch current day's scripture references.

**Response:**
```typescript
{
  dayIndex: number;
  johnRef: string;
  psalmRef: string;
  theme: string;
}
```

**Usage:**
- Optional; bootstrap already includes this data

---

### 3. Get Passage (`GET /api/passage`)

**Query Parameters:**
- `ref` (string, required): Scripture reference (e.g., "John 1:1-14")
- `translation` (Translation, required): Bible translation code

**Response:**
```typescript
{
  ref: string;
  translation: Translation;
  verses: Array<{
    ref: string;
    text: string;
    chapter: number;
    verse: number;
  }>;
  chunks: Array<{
    chunkIndex: number;
    verseRefs: string[];
    text: string;
  }>;
}
```

**Usage:**
- Called in Reader page when loading a section
- Uses current translation from bootstrap settings

---

### 4. Save Resume State (`POST /api/state/resume`)

**Purpose:** Persist user's reading position for later resumption.

**Request Body:**
```typescript
{
  section: "John" | "Psalm";
  ref: string;
  chunkIndex: number;
  verseAnchor?: string;
}
```

**Response:**
```typescript
{
  saved: boolean;
}
```

**Usage:**
- Called in Reader when navigating between chunks
- Allows user to resume exactly where they left off

---

### 5. Create Note (`POST /api/notes`)

**Purpose:** Save a reflection note during reading.

**Request Body:**
```typescript
{
  noteType: "Question" | "Promise" | "Conviction" | "Action" | "Comfort";
  ref: string;
  body: string;
}
```

**Response:**
```typescript
{
  id: string;
  noteType: NoteType;
  ref: string;
  body: string;
  createdAt: string;
}
```

**Usage:**
- Called from Checkpoint component when user saves a note
- Notes appear in Notes page

---

### 6. Get Notes (`GET /api/notes`)

**Query Parameters:**
- `limit` (number, optional, default: 10): Maximum number of notes to return

**Response:**
```typescript
Array<{
  id: string;
  noteType: NoteType;
  ref: string;
  body: string;
  createdAt: string;
}>
```

**Usage:**
- Called on Notes page mount
- Called after creating a new note

---

### 7. Complete Day (`POST /api/day/complete`)

**Purpose:** Mark today's reading as complete and advance to next day.

**Response:**
```typescript
{
  previousDayIndex: number;
  newCurrentDayIndex: number;
  createdRecall: {
    recallId: string;
    dayIndex: number;
    choices: RecallChoice[];
  };
}
```

**Usage:**
- Called when user completes both Gospel and Psalm sections
- Called from "Complete day now" button on Home page
- Triggers creation of recall quiz for the day

---

### 8. Get Pending Recall (`GET /api/recall/pending`)

**Purpose:** Check for unanswered recall quizzes.

**Response:**
- `204 No Content` if no pending recall
- Otherwise:
```typescript
{
  recallId: string;
  dayIndex: number;
  choices: RecallChoice[];
}
```

**Usage:**
- Optional; bootstrap already includes pending recall
- Used for standalone recall checking

---

### 9. Submit Recall Answer (`POST /api/recall/answer`)

**Purpose:** Submit answer to recall quiz.

**Request Body:**
```typescript
{
  recallId: string;
  selectedChoiceIndex: number;
}
```

**Response:**
```typescript
{
  saved: boolean;
  correct: boolean;
}
```

**Usage:**
- Called from Home page recall card
- Triggers bootstrap refresh to get next recall or update state

---

### 10. Get Settings (`GET /api/settings`)

**Purpose:** Fetch user preferences.

**Response:**
```typescript
{
  translation: Translation;
  pace: Pace;
  reminderTime: string;
}
```

**Usage:**
- Called on Settings page mount
- Optional; bootstrap already includes settings

---

### 11. Update Settings (`POST /api/settings`)

**Purpose:** Save user preferences.

**Request Body:**
```typescript
{
  translation?: Translation;
  pace?: Pace;
  reminderTime?: string;
}
```

**Response:**
```typescript
{
  translation: Translation;
  pace: Pace;
  reminderTime: string;
}
```

**Usage:**
- Called from Settings page
- Called from Onboarding page
- Triggers bootstrap refresh to apply new settings

---

## Error Handling

All API errors throw an Error with the message:
```
API Error: {status} {statusText}
```

Pages should catch these errors and display user-friendly messages with retry options.

## CORS Configuration

The backend must allow requests from the frontend origin. Since the frontend runs on a custom port (e.g., `http://localhost:43173`), ensure CORS is configured to accept requests from any localhost port during development.

## Frontend Architecture

### API Client (`/src/lib/api.ts`)
- Singleton instance exported as `api`
- All HTTP requests go through the `request` method
- Handles JSON serialization/deserialization
- Handles 204 No Content responses
- Centralizes error handling

### Type Definitions (`/src/lib/types.ts`)
- Mirrors backend data models
- Ensures type safety across the application
- Used for both API requests and responses

### Configuration (`/src/lib/config.ts`)
- Reads `VITE_API_BASE_URL` environment variable
- Provides default fallback to `http://localhost:8080`

## Data Flow Examples

### App Load (Home Page)
1. `api.bootstrap()` → Get all initial data
2. Display streak, today's reading, resume card, pending recall
3. User clicks "Gospel" → Navigate to `/settle/john`

### Reading Flow
1. Navigate to `/settle/john` → Show preparation screen
2. Click "Begin reading" → Navigate to `/reader/john`
3. Reader calls `api.getPassage(johnRef, translation)`
4. Display chunk 0
5. User clicks "Next" → Save via `api.saveResumeState()`, show chunk 1
6. At midpoint → Show Checkpoint
7. User saves note via `api.createNote()`
8. Continue to final chunk → Show "Section complete" card
9. Click "Complete day now" → `api.completeDay()` → Bootstrap refresh

### Settings Change
1. User updates translation in Settings
2. `api.updateSettings({ translation: "KJV" })`
3. `api.bootstrap()` → Refresh all data with new translation
4. Navigate back to Home

## Testing the Integration

### Prerequisites
1. Backend running on `http://localhost:8080` (or custom URL)
2. Frontend running on custom port
3. CORS properly configured

### Test Checklist
- [ ] Home page loads bootstrap data
- [ ] Clicking "Gospel" navigates through Settle → Reader
- [ ] Reader displays passage chunks correctly
- [ ] Chunk navigation works (Previous/Next)
- [ ] Checkpoint appears at correct times
- [ ] Notes can be created and viewed
- [ ] Resume state persists across navigation
- [ ] Recall quiz appears and submits correctly
- [ ] Settings can be changed
- [ ] Day completion works
- [ ] Error states display with retry option

## Common Issues

**CORS errors:**
- Ensure backend allows requests from frontend origin
- Check Network tab for preflight OPTIONS requests

**404 errors:**
- Verify `/api` prefix is correct on backend
- Check endpoint paths match exactly

**Type mismatches:**
- Ensure backend response matches TypeScript types
- Check date formats (ISO 8601 strings)

**Environment variables:**
- Create `.env` file with `VITE_API_BASE_URL`
- Restart Vite dev server after changing `.env`
