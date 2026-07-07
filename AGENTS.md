# Tahadi — agent notes

Offline Arabic (RTL) party trivia game. Expo SDK 57, TypeScript strict, expo-router, Zustand.

- Docs for this Expo version: https://docs.expo.dev/versions/v57.0.0/
- Every user-facing string goes in `src/i18n/ar.ts` — never hardcode strings in components.
- Use `start`/`end` styles, never `left`/`right` (RTL).
- All game logic lives in `src/store/gameStore.ts` (strict state machine; illegal transitions are no-ops). Components stay presentational.
- Question packs are bundled JSON in `assets/packs/{category}.{challengeType}.json`; the require map lives in `src/lib/packs.ts` — update both when adding a pack.
- No network calls anywhere; the app must stay fully offline.
- Quality gates before finishing: `npm run typecheck`, `npm run lint`, `npm test`.
