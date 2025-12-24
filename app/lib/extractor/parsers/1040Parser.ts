import taxDefinitions from '../tax-definitions.json';
import { detectTaxYear, findCurrencyValue } from '../utils/extractionHelpers';

interface Parsed1040 {
  agi: number;
  taxPaid: number;
  itemizedDeductions: number;
  untaxedIRA: number; // Critical for CSS Profile
  dividendIncome: number;
}

// Type definitions for our JSON config
interface FieldConfig {
  line: string;
  keywords: string[];
  type: string;
}

interface YearConfig {
  years: string[];
  description: string;
  fields: Record<string, FieldConfig>;
}

export const extract1040Data = (text: string): Parsed1040 => {
  const year = detectTaxYear(text);
  const config = get1040ConfigForYear(year);

  // Helper to extract a field based on config
  const getField = (fieldId: string): number => {
    const fieldConfig = config.fields[fieldId];
    if (!fieldConfig) return 0;

    // Construct regexes from config
    // Keyword regex: Join keywords with | and allow optional spaces
    const keywordPattern = fieldConfig.keywords.map(k => k.replace(/\s+/g, '\\s?')).join('|');
    const keywordRegex = new RegExp(keywordPattern, 'i');

    // Line regex: "Line X" or just "X" with word boundaries
    // FIXED: Double backslashes for string literals
    const linePattern = `(?:Line\s?)?\b${fieldConfig.line}\b`;
    const lineRegex = new RegExp(linePattern, 'i');

    return findCurrencyValue(text, keywordRegex, lineRegex);
  };

  const agi = getField('agi');
  const taxPaid = getField('taxPaid');
  const itemizedDeductions = getField('itemizedDeductions');
  const dividendIncome = getField('dividendIncome');

  // Untaxed IRA/Pension Calculation
  // Logic: (IRA Total - IRA Taxable) + (Pension Total - Pension Taxable)
  const iraTotal = getField('iraDistributionsTotal');
  const iraTaxable = getField('iraDistributionsTaxable');
  const pensionTotal = getField('pensionsTotal');
  const pensionTaxable = getField('pensionsTaxable');
  const socialSecurityTotal = getField('socialSecurityBenefits');
  const socialSecurityTaxable = getField('socialSecurityTaxable');

  // Ensure we don't get negative values for components
  const untaxedIRA = Math.max(0, iraTotal - iraTaxable);
  const untaxedPension = Math.max(0, pensionTotal - pensionTaxable);
  const untaxedSS = Math.max(0, socialSecurityTotal - socialSecurityTaxable);

  // Note: CSS Profile asks for "Untaxed social security benefits" separately often,
  // but for "Untaxed IRA/Pension" we sum them up.
  // We'll store them as one aggregate "untaxedIRA" field for now to match interface,
  // or simple summation.
  // Let's just do IRA + Pension for "untaxedIRA" field as defined in interface.
  
  return {
    agi,
    taxPaid,
    itemizedDeductions,
    untaxedIRA: untaxedIRA + untaxedPension,
    dividendIncome
  };
}

const get1040ConfigForYear = (year: string): YearConfig => {
  const configs = taxDefinitions['1040'] as YearConfig[];
  
  // Find config that includes this year
  const specificConfig = configs.find(c => c.years.includes(year));
  if (specificConfig) return specificConfig;

  // Fallback: Find config that includes "all" or just use the first one (most recent usually)
  return configs[0];
}