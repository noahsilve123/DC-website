export const extractScheduleCData = (text: string) => {
  const netProfit = extractBusinessNet(text)
  return {
    netProfit
  }
}

// 3. Schedule C (Business Net Profit)
const extractBusinessNet = (text: string) => {
  if (!text.includes('Schedule C')) return 0;
  // Line 31 is "Net profit or (loss)"
  const match = text.match(/Net profit.*?31.*?(\d{1,3}(?:,\d{3})*\.\d{2})/i);
  return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
}
