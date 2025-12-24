export const extractScheduleAData = (text: string) => {
  const medicalExpenses = extractMedical(text)
  const mortgageInterest = extractMortgageInterest(text)
  return {
    medicalExpenses,
    mortgageInterest
  }
}

// 2. Schedule A (Medical Expenses)
// Looks for "Medical and dental" near the top of the form
const extractMedical = (text: string) => {
  if (!text.includes('Schedule A')) return 0;
  // Naive but effective for standard forms
  // Line 1: Medical and dental expenses
  const match = text.match(/Medical and dental.*?\n.*?(\d{1,3}(?:,\d{3})*\.\d{2})/i);
  return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
}

// Line 8a: Home mortgage interest
const extractMortgageInterest = (text: string) => {
  if (!text.includes('Schedule A')) return 0;
  // Look for "Home mortgage interest" or Line 8a
  const match = text.match(/Home mortgage interest.*?\n.*?(\d{1,3}(?:,\d{3})*\.\d{2})/i);
  return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
}
