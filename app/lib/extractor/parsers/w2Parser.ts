export const extractW2Data = (text: string) => {
  const wages = extractWages(text)
  const box12Untaxed = extractBox12(text)
  
  return {
    wages,
    box12Untaxed
  }
}

const extractWages = (text: string) => {
  // Look for Box 1 Wages, tips, other compensation
  // This is a simplified regex, real world W-2s are messy
  const regex = /(?:Box)?\s?1\s+(?:Wages, tips, other compensation)?\s?\$?([0-9,]+\.[0-9]{2})/i
  const match = text.match(regex)
  return match ? parseFloat(match[1].replace(/,/g, '')) : 0
}

// 1. W-2 Box 12 (Untaxed Income)
// Looks for "12" followed by code D, E, F, G, H, or S, then a money amount
const extractBox12 = (text: string) => {
  const regex = /(?:Box)?\s?12\s?([DEFGHS])\s?\$?([0-9,]+\.[0-9]{2})/gi;
  let total = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const val = parseFloat(match[2].replace(/,/g, ''));
    total += val;
  }
  return total;
}
