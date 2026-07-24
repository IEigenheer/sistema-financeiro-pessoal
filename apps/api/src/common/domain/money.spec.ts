import { describe, expect, it } from 'vitest';

import { isPositiveMoneyString, multiplyMoneyByRate, normalizeMoneyString } from './money';
import { roundHalfUp } from './rounding';

describe('money helpers', () => {
  it('rounds half up deterministically', () => {
    expect(roundHalfUp(5n, 2n)).toBe(3n);
    expect(roundHalfUp(4n, 2n)).toBe(2n);
  });

  it('normalizes monetary strings and rejects negatives', () => {
    expect(normalizeMoneyString('10')).toBe('10.00');
    expect(isPositiveMoneyString('10.00')).toBe(true);
    expect(isPositiveMoneyString('0.00')).toBe(false);
  });

  it('multiplies money by a projected monthly yield rate without floating point', () => {
    expect(multiplyMoneyByRate('1000.00', '0.01000000')).toBe('10.00');
  });
});
