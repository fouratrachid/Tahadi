import { reverseGraphemes, toGraphemes } from '../grapheme';

describe('grapheme utilities', () => {
  it('reverses plain Arabic words by letter', () => {
    expect(reverseGraphemes('هدف')).toBe('فده');
    expect(reverseGraphemes('ملعب')).toBe('بعلم');
  });

  it('double reversal returns the original string', () => {
    const words = ['برشلونة', 'كأس العالم', 'لا إله إلا الله', 'تسلل'];
    for (const w of words) {
      expect(reverseGraphemes(reverseGraphemes(w))).toBe(w);
    }
  });

  it('keeps the لا sequence letters intact (lam + alef are separate graphemes)', () => {
    // "لا" is two code points (ل + ا) — reversing must not corrupt either.
    const reversed = reverseGraphemes('لاعب');
    expect(Array.from(reversed).sort()).toEqual(Array.from('لاعب').sort());
    expect(reversed).toBe('بعال');
  });

  it('keeps diacritics attached to their base letters', () => {
    const word = 'مُدَرِّب'; // with damma, fatha, shadda+kasra
    const graphemes = toGraphemes(word);
    // Each grapheme must start with a base letter, never a combining mark.
    for (const g of graphemes) {
      expect(g[0]).not.toMatch(/[ً-ٰٟ]/);
    }
    expect(reverseGraphemes(reverseGraphemes(word))).toBe(word);
  });

  it('handles surrogate pairs (emoji) without corruption', () => {
    expect(reverseGraphemes('اب🏆')).toBe('🏆با');
  });

  it('handles empty and single-character strings', () => {
    expect(reverseGraphemes('')).toBe('');
    expect(reverseGraphemes('م')).toBe('م');
  });
});
