import taxDefinitions from '../tax-definitions.json';
import { detectTaxYear, findCurrencyValue } from '../utils/extractionHelpers';

interface ParsedScheduleC {
  netProfit: number;
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

export const extractScheduleCData = (text: string): ParsedScheduleC => {
  const year = detectTaxYear(text);
  const config = getScheduleCConfigForYear(year);

  // Helper to extract a field based on config
  const getField = (fieldId: string): number => {
    const fieldConfig = config.fields[fieldId];
    if (!fieldConfig) return 0;

    const keywordPattern = fieldConfig.keywords.map(k => k.replace(/\s+/g, '\\s?')).join('|');
    const keywordRegex = new RegExp(keywordPattern, 'i');

    // FIXED: Double backslashes for string literals
    const linePattern = `(?:Line\s?)?\b${fieldConfig.line}\b`;
    const lineRegex = new RegExp(linePattern, 'i');

    return findCurrencyValue(text, keywordRegex, lineRegex);
  };

  if (!text.includes('Schedule C')) {
    return { netProfit: 0 };
  }

  return {
    netProfit: getField('netProfit')
  };
}

const getScheduleCConfigForYear = (year: string): YearConfig => {
  const configs = taxDefinitions['ScheduleC'] as YearConfig[];
  const specificConfig = configs.find(c => c.years.includes(year) || c.years.includes('all'));
  return specificConfig || configs[0];
}
