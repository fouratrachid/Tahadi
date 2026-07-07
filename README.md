# تحدّي (Tahadi) — Offline Arabic Party Trivia

An offline, referee-based Arabic party trivia game for **3 players**: two contestants and one referee who holds the phone, reads the questions aloud, and judges the answers. No accounts, no ads, no network — everything is bundled and free.

## How a game works

1. The referee enters both player names, picks 1–3 categories, exactly 4 challenge types (played in the chosen order), and a timer duration (15/30/45/60s).
2. Each of the 4 rounds runs one challenge type:

| Challenge | Arabic name | Scoring |
|---|---|---|
| Speed | تحدّي السرعة | Rapid-fire, ✓ = +10, timed turn per player |
| Who Am I | من أنا | 4 progressive hints: guess on hint 1/2/3/4 = 40/30/20/10 pts |
| Reversed | الكلمات المعكوسة | Word shown reversed (grapheme-safe), +15 each, timed |
| Ordering | الترتيب | Order 4–5 items, referee judges after reveal, +20 |
| Bell | الجرس | Head-to-head, first correct answer +10, 8 questions |

3. Animated score summary between rounds, winner celebration with confetti at the end, with **rematch** (same config, fresh questions) and **new game**.

Questions never repeat within a game; used questions are also persisted across app launches per pack and reset automatically when a pack is exhausted.

## Content

100% original Arabic (MSA) questions bundled as JSON in `assets/packs/{category}.{challengeType}.json`:

- **Categories:** كرة القدم (deepest), أنمي, أفلام, منوعات عامة
- ~700 questions total; per category: 60+ speed, 15+ whoAmI, 40+ reversed, 15+ ordering, 40+ bell
- Difficulty mix ≈ 40% easy / 40% medium / 20% hard

Sound effects are original synthesized tones (no third-party audio); regenerate with `npm run generate-sounds`.

## Tech

- Expo SDK 57 + TypeScript (strict), expo-router, Zustand (strict state machine), react-native-reanimated, expo-audio, expo-haptics, expo-keep-awake (play screen only), AsyncStorage
- Full RTL: forced natively via the `expo-localization` config plugin (`forcesRTL`) plus `I18nManager.forceRTL` at startup; all UI strings live in `src/i18n/ar.ts`; Cairo font
- The countdown is timestamp-based (`Date.now()` deltas driven by `requestAnimationFrame`) — no `setInterval` drift; pause/resume and backgrounding restore the exact remaining time
- The reversed-word challenge reverses by **grapheme cluster** (`Intl.Segmenter` with a manual fallback), so Arabic combining marks and لا sequences survive intact

### Project layout

```
src/
  app/            expo-router screens (home, setup, game/*, packs, history, settings)
  components/     ui kit + game components (timer ring, score header, confetti)
  store/          gameStore (state machine) + settingsStore
  lib/            questionSelector, scoring, grapheme, packs, storage, sound, haptics
  i18n/ar.ts      every user-facing string
assets/packs/     20 bundled question packs (JSON)
assets/sounds/    6 synthesized WAV effects
```

## Run it

```bash
npm install
npm start          # Expo dev server — press "a" for Android
```

Quality gates:

```bash
npm run typecheck  # tsc --noEmit (zero errors)
npm run lint       # expo lint (zero errors)
npm test           # 43 unit tests: selector, scoring, graphemes, packs, state machine
```

## Build an APK (EAS)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview   # produces an installable .apk
```

The `production` profile builds an `.aab` for Play Store submission. iOS builds work from the same codebase (`eas build --platform ios`).

## Notes

- The app icon/splash are Expo template placeholders — swap `assets/images/*` before publishing.
- Android applies forced RTL from the first install thanks to the config plugin; in Expo Go the very first launch may need one reload for RTL to apply.
