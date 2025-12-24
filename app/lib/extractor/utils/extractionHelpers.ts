export const detectTaxYear = (text: string): string => {
  // Look for "20XX" near the top of the file, or "OMB No. ... 20XX"
  // Simple check: Find the most frequent or prominent year
  const yearMatches = text.match(/\b20[12]\d\b/g);
  if (!yearMatches) return "2023"; // Default

  // Heuristic: The tax year is usually big and near the top.
  // We'll just take the first realistic tax year (2015-2025) found.
  const validYears = yearMatches.filter(y => {
    const num = parseInt(y);
    return num >= 2015 && num <= 2026;
  });

  return validYears.length > 0 ? validYears[0] : "2023";
}

// Helper to find money near specific keywords
export const findCurrencyValue = (text: string, keywordRegex: RegExp, lineRegex: RegExp): number => {
  const lines = text.split('\n');
  
  // Find the target line index
  const targetIndex = lines.findIndex(l => {
    // Check keyword first (more reliable)
    if (keywordRegex.test(l)) return true;
    
    // Check line number matches
    const match = l.match(lineRegex);
    if (match) {
      // Basic check to ensure it's a label, not a random number
      // If the line starts with the number, or "Line X", it's good.
      return true;
    }
    return false;
  });
  
  if (targetIndex === -1) return 0;

  // Helper to extract value from a string
  const extractFromText = (str: string): number | null => {
    // Strategy 1: Look for explicit money format with decimal (e.g. 1,234.56)
    const decimalMatches = str.match(/(\d{1,3}(?:,\d{3})*\.\d{2})/g);
    if (decimalMatches && decimalMatches.length > 0) {
      return parseFloat(decimalMatches[decimalMatches.length - 1].replace(/,/g, ''));
    }

    // Strategy 2: Look for any number > 100 (filter out line numbers/years)
    const allMatches = str.match(/(\d{1,3}(?:,\d{3})*)/g);
    if (allMatches && allMatches.length > 0) {
      const values = allMatches.map(v => parseFloat(v.replace(/,/g, '')));
      const likelyValues = values.filter(v => {
        if (v >= 1990 && v <= 2030) return false; // Likely a year
        return v > 100;
      });
      if (likelyValues.length > 0) {
        return likelyValues[likelyValues.length - 1];
      }
    }
    return null;
  };

  // 1. Try to find value on the SAME line first
  const sameLineValue = extractFromText(lines[targetIndex]);
  if (sameLineValue !== null) return sameLineValue;

  // 2. If no value on same line, look at next 1-2 lines (handling wrapped text)
  const nextLines = lines.slice(targetIndex + 1, targetIndex + 3);
  for (const line of nextLines) {
    // Stop if we see a new line number (e.g. "12." or "Line 12")
    if (/(?:^|\s)(?:Line\s?)?\d+[a-z]?\b/i.test(line) || /Total/i.test(line)) {
       if (!extractFromText(line)) break; 
    }
    
    const nextLineValue = extractFromText(line);
    if (nextLineValue !== null) return nextLineValue;
  }

  return 0;
}
