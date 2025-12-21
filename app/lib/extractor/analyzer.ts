import * as chrono from 'chrono-node'
import currency from 'currency.js'
import Fuse from 'fuse.js'

export interface FinancialItem {
  description: string
  amount: number
  originalLine: string
}

export interface AnalyzedData {
  dates: Date[]
  loans: FinancialItem[]
  grants: FinancialItem[]
  totalLoans: number
  totalGrants: number
}

export const analyzeText = (rawText: string): AnalyzedData => {
  const parsedDates = chrono.parse(rawText)
  const dates = parsedDates.map((result) => result.start.date())

  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const fuse = new Fuse(lines, {
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 4,
  })

  const loanKeywords = ['Federal Direct', 'Subsidized', 'Unsubsidized', 'Plus Loan', 'Student Loan', 'Borrow']
  const grantKeywords = ['Pell Grant', 'Scholarship', 'SEOG', 'Gift Aid', 'Tuition Assistance', 'Award', 'Grant']

  const loans: FinancialItem[] = []
  const grants: FinancialItem[] = []
  const processedLines = new Set<string>()

  const processResults = (results: any[], targetArray: FinancialItem[]) => {
    results.forEach((result) => {
      const line = result.item
      if (processedLines.has(line)) return

      const moneyMatch = line.match(/(?:[$]|USD)\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|(\d{1,3}(?:,\d{3})*\.\d{2})/)

      if (moneyMatch) {
        const amountVal = currency(moneyMatch[0]).value

        if (amountVal > 0) {
          targetArray.push({
            description: line.replace(moneyMatch[0], '').trim(),
            amount: amountVal,
            originalLine: line,
          })
          processedLines.add(line)
        }
      }
    })
  }

  grantKeywords.forEach((keyword) => {
    const results = fuse.search(keyword)
    processResults(results, grants)
  })

  loanKeywords.forEach((keyword) => {
    const results = fuse.search(keyword)
    processResults(results, loans)
  })

  const totalLoans = loans.reduce((acc, item) => currency(acc).add(item.amount).value, 0)
  const totalGrants = grants.reduce((acc, item) => currency(acc).add(item.amount).value, 0)

  return {
    dates,
    loans,
    grants,
    totalLoans,
    totalGrants,
  }
}
