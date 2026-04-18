/// <reference types="jest" />
import { defaultQuickPrompts, moodOptions } from '../../../constants/constants';
import { colors, spacing, radius, typography } from '../../../constants/theme';

describe('Constants', () => {
  it('defaultQuickPrompts is defined and non-empty', () => {
    expect(defaultQuickPrompts).toBeDefined();
    expect(Array.isArray(defaultQuickPrompts)).toBe(true);
    expect(defaultQuickPrompts.length).toBeGreaterThan(0);
  });

  it('moodOptions is defined and correctly structured', () => {
    expect(moodOptions).toBeDefined();
    expect(Array.isArray(moodOptions)).toBe(true);
    expect(moodOptions.length).toBeGreaterThan(0);

    moodOptions.forEach(opt => {
      expect(opt).toHaveProperty('mood');
      expect(opt).toHaveProperty('moodIcon');
    });
  });
});

describe('Theme', () => {
  it('colors defines core UI palettes', () => {
    expect(colors).toHaveProperty('bg');
    expect(colors).toHaveProperty('primary');
    expect(colors).toHaveProperty('text');
  });

  it('spacing maps correct numerical values', () => {
    expect(spacing).toHaveProperty('md');
    expect(typeof spacing.md).toBe('number');
  });

  it('radius maps correct numerical values', () => {
    expect(radius).toHaveProperty('lg');
  });

  it('typography maintains sizing structures', () => {
    expect(typography).toHaveProperty('h1');
    expect(typography.h1).toHaveProperty('fontSize');
  });
});
