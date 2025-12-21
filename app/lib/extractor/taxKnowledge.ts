/**
 * TAX KNOWLEDGE BASE
 *
 * Static rules, rates, and limits for recent tax years.
 */

interface TaxYearRules {
  ssTaxRate: number; // 6.2%
  medicareTaxRate: number; // 1.45%
  ssWageBaseLimit: number;
  maxSSTax: number;
}

export const TAX_RULES: Record<string, TaxYearRules> = {
  '2022': {
    ssTaxRate: 0.062,
    medicareTaxRate: 0.0145,
    ssWageBaseLimit: 147000,
    maxSSTax: 9114.0,
  },
  '2023': {
    ssTaxRate: 0.062,
    medicareTaxRate: 0.0145,
    ssWageBaseLimit: 160200,
    maxSSTax: 9932.4,
  },
  '2024': {
    ssTaxRate: 0.062,
    medicareTaxRate: 0.0145,
    ssWageBaseLimit: 168600,
    maxSSTax: 10453.2,
  },
  DEFAULT: {
    ssTaxRate: 0.062,
    medicareTaxRate: 0.0145,
    ssWageBaseLimit: 168600,
    maxSSTax: 10453.2,
  },
};

export const isApproximately = (actual: number, expected: number, tolerance = 0.05): boolean => {
  return Math.abs(actual - expected) <= tolerance;
};

export const isLikelyYear = (val: string): boolean => {
  const num = parseFloat(val);
  return Number.isInteger(num) && num >= 2000 && num <= 2030;
};
