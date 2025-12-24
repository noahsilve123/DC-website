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
  
  // Find the target line index and the anchor position where the match occurred.
  // The anchor is used to prefer the number closest to the matched field label
  // (important when PDF text gets flattened into a single line).
  let targetIndex = -1;
  let anchorPos: number | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const keywordMatch = line.match(keywordRegex);
    if (keywordMatch) {
      targetIndex = i;
      anchorPos = keywordMatch.index ?? 0;
      break;
    }

    const lineMatch = line.match(lineRegex);
    if (lineMatch) {
      targetIndex = i;
      anchorPos = lineMatch.index ?? 0;
      break;
    }
  }

  if (targetIndex === -1) return 0;

  // Helper to extract value from a string
  const extractFromText = (str: string, anchor: number | null): number | null => {
    const anchoredStr = anchor !== null ? str.slice(anchor) : str;

    // Strategy 1 (anchored): Look for explicit money format with decimal (e.g. 1,234.56)
    const anchoredDecimal = anchoredStr.match(/(\d{1,3}(?:,\d{3})*\.\d{2})/);
    if (anchoredDecimal && anchoredDecimal[1]) {
      return parseFloat(anchoredDecimal[1].replace(/,/g, ''));
    }

    // Strategy 2 (anchored): Look for any number > 100 (filter out line numbers/years)
    const anchoredAll = anchoredStr.match(/(\d{1,3}(?:,\d{3})*)/g);
    if (anchoredAll && anchoredAll.length > 0) {
      const values = anchoredAll.map(v => parseFloat(v.replace(/,/g, '')));
      const likelyValues = values.filter(v => {
        if (v >= 1990 && v <= 2030) return false; // Likely a year
        return v > 100;
      });
      if (likelyValues.length > 0) return likelyValues[0];
    }

    // Fallback (unanchored): preserve prior behavior if anchored search fails.
    const decimalMatches = str.match(/(\d{1,3}(?:,\d{3})*\.\d{2})/g);
    if (decimalMatches && decimalMatches.length > 0) {
      return parseFloat(decimalMatches[decimalMatches.length - 1].replace(/,/g, ''));
    }

    const allMatches = str.match(/(\d{1,3}(?:,\d{3})*)/g);
    if (allMatches && allMatches.length > 0) {
      const values = allMatches.map(v => parseFloat(v.replace(/,/g, '')));
      const likelyValues = values.filter(v => {
        if (v >= 1990 && v <= 2030) return false;
        return v > 100;
      });
      if (likelyValues.length > 0) {
        return likelyValues[likelyValues.length - 1];
      }
    }
    return null;
  };

  // 1. Try to find value on the SAME line first
  const sameLineValue = extractFromText(lines[targetIndex], anchorPos);
  if (sameLineValue !== null) return sameLineValue;

  // 2. If no value on same line, look at next 1-2 lines (handling wrapped text)
  const nextLines = lines.slice(targetIndex + 1, targetIndex + 3);
  for (const line of nextLines) {
    // Stop if we see a new line number (e.g. "12." or "Line 12")
    if (/(?:^|\s)(?:Line\s?)?\d+[a-z]?\b/i.test(line) || /Total/i.test(line)) {
       if (!extractFromText(line, null)) break;
    }
    
    const nextLineValue = extractFromText(line, null);
    if (nextLineValue !== null) return nextLineValue;
  }

  return 0;
}
