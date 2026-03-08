

## Plan: Revamp Learning Modes + Remove All Emojis

### Summary of Issues Found

1. **FlashCards page** uses mock data (setTimeout with sliced content) instead of calling the AI edge function
2. **Quiz page** has emojis in toasts and result screen (`🎉`, `🏆`, `👍`, `📚`), uses `pixel-border`/`pixel-font` inconsistently
3. **Memory page** has emojis in toasts (`🎉`), uses `pixel-border`/`pixel-font`, loading is basic
4. **Home page** has emojis in the feature cards (`📝`, `🎯`, `🎮`, `🌐`)
5. **Edge function** already uses `google/gemini-2.5-flash` -- good, no change needed there
6. Edge function prompt doesn't generate flashcard Q&A pairs or summaries -- needs expansion

### Changes

#### 1. Update Edge Function to support flashcards + summary generation

Expand the prompt in `supabase/functions/generate-learning/index.ts` to also return:
- `summary` (string) - a concise summary of the content
- `keyPoints` (string[]) - 5-8 key points
- `flashcards` ([{question, answer}]) - Q&A flashcard pairs

The `type` parameter will control what gets generated. Add these fields to the JSON schema in the prompt.

#### 2. Revamp FlashCards page (`src/pages/FlashCards.tsx`)

- Replace mock setTimeout with actual call to `generate-learning` edge function (like Quiz/Memory do)
- Use `supabase.functions.invoke('generate-learning', { body: { content, type: 'flashcards' } })`
- Use glass-card styling consistently (already partially there)
- Replace Zap icon usage, keep SVG icons only
- Improve the flashcard flip with a proper 3D CSS transform animation
- Add a progress indicator showing card position

#### 3. Revamp Quiz page (`src/pages/Quiz.tsx`)

- Remove all emojis from toasts and result screen
- Replace emoji result indicators with lucide SVG icons (Trophy, ThumbsUp, BookOpen)
- Replace `pixel-border`/`pixel-font`/`pixel-button` classes with `glass-card` styling to match the rest of the app
- Show explanation only after answering (currently shows before submitting)
- Fix score display: currently shows `Score: {score} / {currentQuestion}` which is wrong mid-quiz

#### 4. Revamp Memory page (`src/pages/Memory.tsx`)

- Remove emoji from congratulations toast
- Replace `pixel-border`/`pixel-font`/`pixel-button` with `glass-card` styling
- Add TextShimmer loading state like other pages
- Add a timer and best-score tracking (local)
- Use lucide icons for the card backs instead of "?"

#### 5. Remove all emojis from Home page (`src/pages/Home.tsx`)

- Replace feature card emojis with lucide SVG icons:
  - `📝` -> `<FileText />` or `<StickyNote />`
  - `🎯` -> `<Target />`
  - `🎮` -> `<Gamepad2 />`
  - `🌐` -> `<Network />`

#### 6. Add `generate-learning` to `supabase/config.toml`

Ensure the function is registered with `verify_jwt = false`.

### Files to modify
- `supabase/functions/generate-learning/index.ts` - expand prompt for flashcards/summary
- `supabase/config.toml` - add function config
- `src/pages/FlashCards.tsx` - full revamp with real AI calls
- `src/pages/Quiz.tsx` - remove emojis, fix styling, fix bugs
- `src/pages/Memory.tsx` - remove emojis, fix styling
- `src/pages/Home.tsx` - replace emojis with SVG icons

