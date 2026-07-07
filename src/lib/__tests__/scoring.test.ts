import { CORRECT_POINTS, ROUND_PLAN, WHOAMI_POINTS, whoAmIPoints } from '../scoring';

describe('scoring', () => {
  it('awards fixed points per challenge', () => {
    expect(CORRECT_POINTS.speed).toBe(10);
    expect(CORRECT_POINTS.reversed).toBe(15);
    expect(CORRECT_POINTS.ordering).toBe(20);
    expect(CORRECT_POINTS.bell).toBe(10);
  });

  it('whoAmI scores by hints revealed: 40/30/20/10', () => {
    expect(whoAmIPoints(1)).toBe(40);
    expect(whoAmIPoints(2)).toBe(30);
    expect(whoAmIPoints(3)).toBe(20);
    expect(whoAmIPoints(4)).toBe(10);
    expect(WHOAMI_POINTS).toHaveLength(4);
  });

  it('whoAmI clamps out-of-range hint counts', () => {
    expect(whoAmIPoints(0)).toBe(40);
    expect(whoAmIPoints(-3)).toBe(40);
    expect(whoAmIPoints(9)).toBe(10);
  });

  it('timed turns cannot overlap between the two players given pack minimums', () => {
    // speed packs have >= 60 questions, reversed >= 40
    expect(ROUND_PLAN.speed.poolPerTurn * 2).toBeLessThanOrEqual(60);
    expect(ROUND_PLAN.reversed.poolPerTurn * 2).toBeLessThanOrEqual(40);
  });
});
