"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const money_1 = require("./money");
const rounding_1 = require("./rounding");
(0, vitest_1.describe)('money helpers', () => {
    (0, vitest_1.it)('rounds half up deterministically', () => {
        (0, vitest_1.expect)((0, rounding_1.roundHalfUp)(5n, 2n)).toBe(3n);
        (0, vitest_1.expect)((0, rounding_1.roundHalfUp)(4n, 2n)).toBe(2n);
    });
    (0, vitest_1.it)('normalizes monetary strings and rejects negatives', () => {
        (0, vitest_1.expect)((0, money_1.normalizeMoneyString)('10')).toBe('10.00');
        (0, vitest_1.expect)((0, money_1.isPositiveMoneyString)('10.00')).toBe(true);
        (0, vitest_1.expect)((0, money_1.isPositiveMoneyString)('0.00')).toBe(false);
    });
    (0, vitest_1.it)('multiplies money by a projected monthly yield rate without floating point', () => {
        (0, vitest_1.expect)((0, money_1.multiplyMoneyByRate)('1000.00', '0.01000000')).toBe('10.00');
    });
});
