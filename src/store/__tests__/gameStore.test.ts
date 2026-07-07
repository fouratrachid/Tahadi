import {
  selectActivePlayer,
  selectChallenge,
  selectCurrentQuestion,
  selectProgress,
  useGameStore,
} from '../gameStore';
import type { GameConfig } from '@/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@/lib/soundManager', () => ({
  playSound: jest.fn(),
  initSound: jest.fn(),
  setSoundEnabled: jest.fn(),
}));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success', Error: 'error', Warning: 'warning' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

const CONFIG: GameConfig = {
  players: ['أحمد', 'سارة'],
  categories: ['football'],
  challenges: ['speed', 'whoAmI', 'bell', 'ordering'],
  timerSec: 30,
};

function store() {
  return useGameStore.getState();
}

beforeEach(() => {
  store().reset();
});

describe('configureGame validation', () => {
  it('rejects invalid configs', () => {
    expect(store().configureGame({ ...CONFIG, players: ['', 'ب'] })).toBe(false);
    expect(store().configureGame({ ...CONFIG, categories: [] })).toBe(false);
    expect(
      store().configureGame({ ...CONFIG, challenges: ['speed', 'speed', 'bell', 'whoAmI'] }),
    ).toBe(false);
    expect(
      store().configureGame({ ...CONFIG, timerSec: 99 as unknown as 30 }),
    ).toBe(false);
    expect(store().phase).toBe('idle');
  });

  it('accepts a valid config and enters roundIntro with a built round', () => {
    expect(store().configureGame(CONFIG)).toBe(true);
    const s = store();
    expect(s.phase).toBe('roundIntro');
    expect(selectChallenge(s)).toBe('speed');
    expect(s.timedTurns).not.toBeNull();
    expect(s.timedTurns?.[0].length).toBeGreaterThan(0);
    expect(s.scores).toEqual([0, 0]);
  });
});

describe('illegal transitions are no-ops', () => {
  it('ignores gameplay actions while idle', () => {
    store().answerCorrect();
    store().answerWrong();
    store().skipQuestion();
    store().awardBell(0);
    store().endTurn();
    store().endRound();
    store().startRound();
    expect(store().phase).toBe('idle');
    expect(store().scores).toEqual([0, 0]);
  });

  it('ignores bell awards during a speed round', () => {
    store().configureGame(CONFIG);
    store().startRound();
    expect(store().phase).toBe('playing');
    store().awardBell(0);
    expect(store().scores).toEqual([0, 0]);
  });

  it('ignores revealHint outside whoAmI', () => {
    store().configureGame(CONFIG);
    store().startRound();
    store().revealHint();
    expect(store().revealedHints).toBe(1);
  });
});

describe('speed round flow', () => {
  it('scores +10 per correct answer for the active player', () => {
    store().configureGame(CONFIG);
    store().startRound();
    store().answerCorrect();
    store().answerCorrect();
    store().answerWrong();
    expect(store().scores).toEqual([20, 0]);
  });

  it('endTurn moves player 1 -> betweenTurns, player 2 -> roundResult', () => {
    store().configureGame(CONFIG);
    store().startRound();
    expect(store().turnPlayer).toBe(0);
    store().endTurn();
    expect(store().phase).toBe('betweenTurns');
    store().startTurn(1);
    expect(store().phase).toBe('playing');
    expect(store().turnPlayer).toBe(1);
    store().answerCorrect();
    expect(store().scores).toEqual([0, 10]);
    store().endTurn();
    expect(store().phase).toBe('roundResult');
  });

  it('does not repeat questions between the two players in one round', () => {
    store().configureGame(CONFIG);
    const [turn1, turn2] = store().timedTurns!;
    const ids1 = new Set(turn1.map((q) => q.id));
    for (const q of turn2) expect(ids1.has(q.id)).toBe(false);
  });
});

describe('whoAmI flow', () => {
  function goToWhoAmI() {
    store().configureGame(CONFIG);
    store().startRound();
    store().endTurn();
    store().startTurn(1);
    store().endTurn(); // -> roundResult (round 1: speed)
    store().nextRound(); // -> roundIntro (round 2: whoAmI)
    store().startRound();
  }

  it('awards points based on hints revealed', () => {
    goToWhoAmI();
    expect(selectChallenge(store())).toBe('whoAmI');
    // Guess on hint 1 => 40
    const player = selectActivePlayer(store())!;
    store().answerCorrect();
    expect(store().scores[player]).toBe(40);

    // Next question: reveal 2 hints then guess => 30
    const player2 = selectActivePlayer(store())!;
    store().revealHint();
    store().answerCorrect();
    expect(store().scores[player2]).toBeGreaterThanOrEqual(30);
  });

  it('caps hints at 4', () => {
    goToWhoAmI();
    for (let i = 0; i < 10; i++) store().revealHint();
    expect(store().revealedHints).toBe(4);
  });

  it('alternates players between steps', () => {
    goToWhoAmI();
    const first = selectActivePlayer(store());
    store().skipQuestion();
    const second = selectActivePlayer(store());
    expect(first).not.toBe(second);
  });
});

describe('bell flow', () => {
  function goToBell() {
    store().configureGame(CONFIG);
    store().startRound();
    store().endTurn();
    store().startTurn(1);
    store().endTurn();
    store().nextRound(); // whoAmI intro
    store().startRound();
    const total = selectProgress(store()).total;
    for (let i = 0; i < total; i++) store().skipQuestion();
    expect(store().phase).toBe('roundResult');
    store().nextRound(); // bell intro
    store().startRound();
  }

  it('awards +10 to the chosen player and advances; "no one" advances scoreless', () => {
    goToBell();
    expect(selectChallenge(store())).toBe('bell');
    const before = selectProgress(store()).index;
    store().awardBell(0);
    expect(store().scores[0]).toBe(10);
    expect(selectProgress(store()).index).toBe(before + 1);
    const scores = [...store().scores];
    store().awardBell(null);
    expect([...store().scores]).toEqual(scores);
  });

  it('runs 8 questions then ends the round', () => {
    goToBell();
    const total = selectProgress(store()).total;
    expect(total).toBe(8);
    for (let i = 0; i < total; i++) store().awardBell(1);
    expect(store().phase).toBe('roundResult');
    expect(store().scores[1]).toBe(80);
  });
});

describe('full game, endGame and rematch', () => {
  function playFullGame() {
    store().configureGame(CONFIG);
    for (let round = 0; round < 4; round++) {
      store().startRound();
      const challenge = selectChallenge(store())!;
      if (challenge === 'speed' || challenge === 'reversed') {
        store().answerCorrect();
        store().endTurn();
        store().startTurn(1);
        store().endTurn();
      } else {
        const total = selectProgress(store()).total;
        for (let i = 0; i < total; i++) {
          if (challenge === 'bell') store().awardBell(0);
          else store().answerCorrect();
        }
      }
      expect(store().phase).toBe('roundResult');
      store().nextRound();
    }
  }

  it('completes 4 rounds and finishes with a record', () => {
    playFullGame();
    expect(store().phase).toBe('finished');
    const record = store().lastRecord!;
    expect(record).not.toBeNull();
    expect(record.players).toEqual(CONFIG.players);
    expect(record.winner).toBe(0);
    expect(record.scores[0]).toBeGreaterThan(record.scores[1]);
  });

  it('rematch keeps config, resets scores, and draws fresh questions', () => {
    playFullGame();
    const firstGameIds = new Set(store().sessionUsed);
    store().rematch();
    const s = store();
    expect(s.phase).toBe('roundIntro');
    expect(s.scores).toEqual([0, 0]);
    expect(s.config?.players).toEqual(CONFIG.players);
    // Fresh questions: round-1 speed pools must not reuse first-game ids.
    for (const q of s.timedTurns?.[0] ?? []) {
      expect(firstGameIds.has(q.id)).toBe(false);
    }
  });

  it('pause/resume preserves remaining time via timestamps', () => {
    store().configureGame(CONFIG);
    store().startRound();
    const endsAt = store().turnEndsAt!;
    expect(endsAt).toBeGreaterThan(Date.now());
    store().pause();
    expect(store().isPaused).toBe(true);
    expect(store().turnEndsAt).toBeNull();
    expect(store().pausedRemainingMs).toBeGreaterThan(0);
    expect(store().pausedRemainingMs).toBeLessThanOrEqual(30_000);
    store().resume();
    expect(store().isPaused).toBe(false);
    expect(store().turnEndsAt).toBeGreaterThan(Date.now());
  });
});
