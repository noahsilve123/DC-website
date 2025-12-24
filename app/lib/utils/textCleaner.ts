export const cleanOCRText = (text: string): string => {
  if (!text) return ''
  
  let cleaned = text;

  // 1. Fix broken money with spaces (e.g. "2,000. 00" -> "2,000.00")
  cleaned = cleaned.replace(/(\d{1,3}(?:,\d{3})*)\.\s+(\d{2})\b/g, '$1.$2');

  // 2. Fix European style (e.g. "52.000,00" -> "52000.00")
  // Look for dot-separated thousands and comma-separated decimals
  cleaned = cleaned.replace(/(\d{1,3})\.(\d{3}),(\d{2})\b/g, '$1$2.$3');
  // Look for simple comma decimal (e.g. "500,00" -> "500.00")
  cleaned = cleaned.replace(/(\d+),(\d{2})\b/g, '$1.$2');

  // 3. Fix l/I/O inside numbers
  cleaned = cleaned.replace(/\b[0-9lIO]{2,}\b/g, (match) => {
    return match.replace(/[lI]/g, '1').replace(/O/g, '0');
  });

  // 4. Fix common keyword typos
  cleaned = cleaned.replace(/\$chedule/gi, 'Schedule');
  cleaned = cleaned.replace(/Gr0ss/gi, 'Gross');
  cleaned = cleaned.replace(/lncome/gi, 'Income');
  cleaned = cleaned.replace(/ltemized/gi, 'Itemized');

  return cleaned;
}
