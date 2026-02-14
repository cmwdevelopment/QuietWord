# QuietWord Frontend Testing Checklist

Use this checklist to verify all functionality works correctly with your backend.

## ✅ Pre-Testing Setup

- [ ] Backend is running and accessible
- [ ] `.env` file created with correct `VITE_API_BASE_URL`
- [ ] Dependencies installed (`pnpm install`)
- [ ] Dev server running (`pnpm dev`)
- [ ] Browser DevTools open (Console + Network tabs)

---

## 🏠 Home Page

### Initial Load
- [ ] Page loads without errors
- [ ] Bootstrap API call succeeds (`GET /api/bootstrap`)
- [ ] Streak counter displays correctly
- [ ] Grace streak shows if > 0
- [ ] Today's reading card shows correct references
- [ ] Theme text displays (if available)

### Resume Card
- [ ] Resume card appears if user has saved progress
- [ ] Shows correct section (John/Psalm)
- [ ] Shows correct reference and chunk number
- [ ] "Continue reading" button navigates to correct Reader

### Pending Recall
- [ ] Recall card appears if pending recall exists
- [ ] Shows all answer choices
- [ ] Clicking a choice submits to `/api/recall/answer`
- [ ] Page refreshes with updated bootstrap data
- [ ] Recall card disappears after answering

### Navigation
- [ ] "Notes" link works
- [ ] "Settings" link works
- [ ] "Gospel" button navigates to `/settle/john`
- [ ] "Psalm" button navigates to `/settle/psalm`

### Day Complete State
- [ ] If `completedToday: true`, shows completion message
- [ ] "Complete day now" button calls `/api/day/complete`
- [ ] Bootstrap refreshes after completion
- [ ] Day advances to next index

---

## 🧘 Settle Page

### Display
- [ ] Correct section name shown (Gospel of John / Psalm)
- [ ] "Back to home" button works
- [ ] Calm preparation message displays
- [ ] Instructions are readable and clear

### Navigation
- [ ] "Begin reading" navigates to `/reader/john` or `/reader/psalm`
- [ ] Section parameter passes correctly

---

## 📖 Reader Page

### Initial Load
- [ ] Bootstrap API call succeeds
- [ ] Passage API call succeeds (`GET /api/passage?ref=...&translation=...`)
- [ ] Correct passage reference displays in header
- [ ] Translation code shown
- [ ] First chunk (index 0) displays
- [ ] Breadcrumb shows "Home / [Section] Reader"

### Resume Behavior
- [ ] If resuming, starts at correct chunk index
- [ ] Resume data matches section and reference

### Chunk Navigation
- [ ] "Previous" button disabled on chunk 0
- [ ] "Next" button disabled on final chunk
- [ ] Progress bar updates correctly
- [ ] "Chunk X of Y" displays accurately
- [ ] Changing chunks calls `/api/state/resume`
- [ ] Chunk text displays with proper line breaks
- [ ] Large, readable typography

### Checkpoint Logic - John
- [ ] Checkpoint appears at midpoint chunk
- [ ] Checkpoint appears at final chunk
- [ ] "Next checkpoint" indicator shows before midpoint
- [ ] Indicator updates between midpoint and final

### Checkpoint Logic - Psalm
- [ ] Response prompt appears at final chunk only
- [ ] "Next checkpoint" indicator shows correctly

### Checkpoint Component
- [ ] Shows correct type (reflection/response)
- [ ] All 5 note types selectable (Question, Promise, Conviction, Action, Comfort)
- [ ] Selected note type highlights correctly
- [ ] Textarea accepts input
- [ ] "Skip" button closes checkpoint and continues
- [ ] "Save & Continue" disabled when textarea empty
- [ ] "Save & Continue" calls `/api/notes` with correct data
- [ ] After save, advances to next chunk
- [ ] If final chunk, shows section complete

### Section Complete
- [ ] "Section complete" card displays at end
- [ ] "Back to home" button works
- [ ] "Complete day now" button calls `/api/day/complete`
- [ ] After completion, redirects to home

### Navigation
- [ ] "← Home" button in header works
- [ ] "Exit" button in header works
- [ ] Breadcrumb text is clear

---

## 📝 Notes Page

### Display
- [ ] Page loads without errors
- [ ] API call to `/api/notes?limit=20` succeeds
- [ ] Notes display in correct order (newest first)
- [ ] Each note shows:
  - [ ] Note type badge with correct color
  - [ ] Scripture reference
  - [ ] Note body text
  - [ ] Formatted date (Today, Yesterday, X days ago)

### Empty State
- [ ] If no notes, shows "No notes yet" message
- [ ] Helpful message about creating notes during reading

### Navigation
- [ ] "← Back to home" button works

---

## ⚙️ Settings Page

### Initial Load
- [ ] Page loads without errors
- [ ] API call to `/api/settings` succeeds
- [ ] Current translation pre-selected
- [ ] Current pace pre-selected
- [ ] Current reminder time populated

### Interactions
- [ ] Translation dropdown shows all options (WEB, KJV, ASV, BBE, DARBY)
- [ ] Microcopy displays: "More translations coming as licensing allows."
- [ ] Pace buttons toggle correctly (short/standard)
- [ ] Time input accepts HH:mm format
- [ ] "Save changes" button calls `/api/settings` with updated data
- [ ] Success feedback shows ("Saved!")
- [ ] Settings persist after save

### Navigation
- [ ] "← Back to home" button works

---

## 🎨 Onboarding Page

### Display
- [ ] Brand name "QuietWord" displays
- [ ] Tagline "Built for busy minds." shows
- [ ] Supporting line "One passage at a time." shows
- [ ] All form elements render correctly

### Interactions
- [ ] Translation dropdown works
- [ ] Microcopy displays about translations
- [ ] Pace selection toggles (short/standard)
- [ ] Reminder time input works
- [ ] "Begin" button calls `/api/settings` with initial preferences
- [ ] After save, navigates to home (`/`)

---

## 🚨 Error Handling

### Network Errors
- [ ] Backend offline shows recoverable error state
- [ ] "Retry" button re-attempts failed request
- [ ] Error messages are user-friendly

### Invalid Routes
- [ ] Navigating to `/invalid-route` shows 404 page
- [ ] 404 page has "Return home" button
- [ ] Button navigates back to `/`

### JavaScript Errors
- [ ] ErrorBoundary catches runtime errors
- [ ] Error boundary shows friendly message
- [ ] "Return to home" button resets state

---

## 🎨 Visual & UX

### Typography
- [ ] Base font size is 18px (readable)
- [ ] Headings use light font weight (300)
- [ ] Body text has generous line-height (1.75)
- [ ] Passage text is large and readable in Reader

### Colors & Design
- [ ] Sage green primary color (#6B7F6A)
- [ ] Soft neutral backgrounds (#F5F5F0)
- [ ] Rounded corners on cards (2xl)
- [ ] Subtle shadows on elevated elements
- [ ] Consistent spacing and hierarchy

### Responsive Design
- [ ] Layout works on mobile (375px)
- [ ] Layout works on tablet (768px)
- [ ] Layout works on desktop (1280px+)
- [ ] Touch targets are adequate size
- [ ] Text remains readable at all sizes

### Transitions
- [ ] Button hover states are subtle
- [ ] Progress bar animates smoothly
- [ ] No jarring or flashy animations
- [ ] Navigation feels calm and intentional

---

## 🔄 End-to-End Flows

### Complete Day 1 Flow
1. [ ] Home loads with Day 1 data
2. [ ] Click "Gospel" → Navigate to Settle
3. [ ] Click "Begin reading" → Navigate to Reader
4. [ ] Read through all John chunks (using Next button)
5. [ ] Encounter midpoint checkpoint → Save a note
6. [ ] Continue to final chunk
7. [ ] Encounter final checkpoint → Save or skip
8. [ ] See "Section complete" card
9. [ ] Return to home
10. [ ] Click "Psalm" → Navigate to Settle
11. [ ] Read through Psalm chunks
12. [ ] Encounter final response prompt → Save note
13. [ ] See "Section complete" card
14. [ ] Click "Complete day now"
15. [ ] Return to home with Day 2 data
16. [ ] See Day 1 recall quiz

### Resume Flow
1. [ ] Start reading John, stop at chunk 3
2. [ ] Navigate away to Notes
3. [ ] Return to Home
4. [ ] Resume card shows "John, chunk 4" (next unread)
5. [ ] Click "Continue reading"
6. [ ] Reader opens at chunk 3 (where you left off)

### Settings Change Flow
1. [ ] Open Settings
2. [ ] Change translation from WEB to KJV
3. [ ] Save changes
4. [ ] Return to Home
5. [ ] Start reading
6. [ ] Passage displays in KJV translation

---

## 📊 Performance

- [ ] Bootstrap loads in < 1 second
- [ ] Passage loads in < 1 second
- [ ] Page transitions feel instant
- [ ] No layout shift on load
- [ ] Images (if any) load quickly
- [ ] No console warnings or errors

---

## 🔐 Data Integrity

- [ ] Resume state persists across browser refresh
- [ ] Streak count is accurate
- [ ] Day index increments correctly
- [ ] Notes save with correct reference and type
- [ ] Recall answers submit correctly
- [ ] Settings changes apply immediately

---

## ✨ Final Acceptance Criteria

- [ ] All required pages exist and are accessible
- [ ] All API endpoints integrate successfully
- [ ] Reader is reusable for both John and Psalm
- [ ] Checkpoint timing is correct (John: 2, Psalm: 1)
- [ ] Section complete state is clear
- [ ] User can always navigate back to Home from Reader
- [ ] Type-safe API client works correctly
- [ ] Error states are recoverable
- [ ] Design is calm, minimal, and focused
- [ ] Typography is large and readable
- [ ] UX is low-friction and clear

---

## 📝 Notes

Use this space to track issues or observations:

```
Issues found:
- [ ] 

Working well:
- [ ] 

```

---

**Testing Date:** _______________  
**Tester:** _______________  
**Backend Version:** _______________  
**Frontend Commit:** _______________
