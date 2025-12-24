import taxDefinitions from '../tax-definitions.json';
import { detectTaxYear, findCurrencyValue } from '../utils/extractionHelpers';

interface ParsedW2 {
  wages: number;
  box12Untaxed: number;
}

// Type definitions for our JSON config
interface FieldConfig {
  line: string;
  keywords: string[];
  type: string;
  codes?: string[];
}

interface YearConfig {
  years: string[];
  description: string;
  fields: Record<string, FieldConfig>;
}

export const extractW2Data = (text: string): ParsedW2 => {
  const year = detectTaxYear(text);
  const config = getW2ConfigForYear(year);

  // Helper to extract a field based on config
  const getField = (fieldId: string): number => {
    const fieldConfig = config.fields[fieldId];
    if (!fieldConfig) return 0;

    if (fieldConfig.type === 'box12_sum') {
        return extractBox12(text, fieldConfig);
    }

    const keywordPattern = fieldConfig.keywords.map(k => k.replace(/\s+/g, '\\s?')).join('|');
    const keywordRegex = new RegExp(keywordPattern, 'i');

    const linePattern = `(?:Line\s?)?\b${fieldConfig.line}\b`;
    const lineRegex = new RegExp(linePattern, 'i');

    return findCurrencyValue(text, keywordRegex, lineRegex);
  };

  return {
    wages: getField('wages'),
    box12Untaxed: getField('box12Untaxed')
  };
}

const extractBox12 = (text: string, config: FieldConfig): number => {
    const codes = config.codes || ['D', 'E', 'F', 'G', 'H', 'S'];
    const codesPattern = `[${codes.join('')}]`;
    // Regex: Box 12 [CODE] [VALUE]
    // FIXED: Double backslashes for string literals
    // We need \\$ to match a literal dollar sign in the regex (escaped backslash + dollar)
    const regex = new RegExp(`(?:Box)?\\s?12\\s?(${codesPattern})\\s?\\$?([0-9,]+\\.[0-9]{2})`, 'gi');
    
    let total = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const val = parseFloat(match[2].replace(/,/g, ''));
      total += val;
    }
    return total;
}

const getW2ConfigForYear = (year: string): YearConfig => {
  const configs = taxDefinitions['W2'] as YearConfig[];
  const specificConfig = configs.find(c => c.years.includes(year) || c.years.includes('all'));
  return specificConfig || configs[0];
}