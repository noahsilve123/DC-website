interface Parsed1040 {
  agi: number;
  taxPaid: number;
  itemizedDeductions: number;
  untaxedIRA: number; // Critical for CSS Profile
  dividendIncome: number;
}

export const extract1040Data = (text: string): Parsed1040 => {
  return {
    // 1. AGI: Look for "Adjusted Gross Income" OR Line 11
    agi: findCurrencyValue(text, /Adjusted\s?gross\s?income/i, /Line\s?11/i),
    
    // 2. Tax Paid: Look for "total tax" OR Line 24
    taxPaid: findCurrencyValue(text, /total\s?tax/i, /Line\s?24/i),
    
    // 3. Itemized Deductions (Schedule A Check)
    itemizedDeductions: findCurrencyValue(text, /Itemized\s?deductions/i, /Line\s?12/i),

    // 4. Untaxed IRA/Pension (Line 4a minus 4b)
    // This is "Hard" logic: (Total Distributions) - (Taxable Amount)
    untaxedIRA: calculateUntaxedPension(text),

    dividendIncome: findCurrencyValue(text, /Ordinary\s?dividends/i, /Line\s?3b/i)
  };
}

// Helper to find money near specific keywords
const findCurrencyValue = (text: string, keywordRegex: RegExp, lineRegex: RegExp): number => {
  // Logic: Find the keyword, take the next 50 characters, find a currency pattern
  const lines = text.split('\n');
  const targetLine = lines.find(l => keywordRegex.test(l) || lineRegex.test(l));
  if (!targetLine) return 0;

  // Strategy 1: Look for explicit money format with decimal (e.g. 1,234.56)
  // We take the LAST match because the value is usually in the rightmost column
  const decimalMatches = targetLine.match(/(\d{1,3}(?:,\d{3})*\.\d{2})/g);
  if (decimalMatches && decimalMatches.length > 0) {
    return parseFloat(decimalMatches[decimalMatches.length - 1].replace(/,/g, ''));
  }

  // Strategy 2: Look for any number, but filter out likely line numbers (small integers at start)
  const allMatches = targetLine.match(/(\d{1,3}(?:,\d{3})*)/g);
  if (allMatches && allMatches.length > 0) {
    // Parse all numbers
    const values = allMatches.map(v => parseFloat(v.replace(/,/g, '')));
    
    // Filter out values that are likely line numbers (e.g. < 100) IF there is a larger value available
    const largeValues = values.filter(v => v > 100);
    
    if (largeValues.length > 0) {
      return largeValues[largeValues.length - 1];
    }
    
    // If we only have small numbers, return the last one (e.g. Tax might be $0 or $50)
    return values[values.length - 1];
  }

  return 0;
}

const calculateUntaxedPension = (text: string): number => {
  // CSS Profile Question: "Payments to tax-deferred pension..."
  // Logic: 1040 Line 4a (Total) - Line 4b (Taxable)
  const totalPension = findCurrencyValue(text, /IRA\s?distributions/i, /4a/i);
  const taxablePension = findCurrencyValue(text, /Taxable\s?amount/i, /4b/i);
  return Math.max(0, totalPension - taxablePension);
}
