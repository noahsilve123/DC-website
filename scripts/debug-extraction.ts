
import { extractFinancialData } from '../app/lib/extractor/dataExtraction'

const messyW2 = `
W-2 Wage and Tax $tatement 2023
Employer identification number 12-3456789
Box 1 Wages, tips, other compensation 52.000,00
Box 2 Federal income tax withheld 4 500.50
Box 12 D 2,000. 00
Box 12 DD 500.00
`

const messy1040 = `
1040 U.S. Individual lncome Tax Return 2023
Line 1z Wages, salaries, tips 100,000.00
Line 2b Taxable interest 1,500.00
Line 11 Adjusted Gr0ss lncome 105,000.00
Line 12 ltemized deductions 15,000.00
Line 24 Total tax 12,000.00
Line 4a IRA distributions 10,000.00
Line 4b Taxable amount 8,000.00
`

const messyScheduleA = `
$chedule A (Form 1040) 2023
Medical and dental expenses
1 Medical and dental expenses ... 7,500.00
Home mortgage interest
8a Home mortgage interest ... 12,000.00
`

// Real world bad OCR example (simulated)
const realBadOCR = `
2023 Form 1040
1z Wages, salaries, tips . . . . . . . . . . . . . . . . . . . . . 1z 125,400.00
2b Taxable interest . . . . . . . . . . . . . . . . . . . . . . . 2b 430.00
3b Ordinary dividends . . . . . . . . . . . . . . . . . . . . . . 3b
4a IRA distributions . . . . 4a 14,000.00 4b Taxable amount . . . 4b 14,000.00
11 Adjusted gross income. Subtract line 10 from line 9 . . . . . . 11 135,200.00
12 Standard deduction or itemized deductions (from Schedule A) . . 12 27,700.00
24 Total tax. Add lines 22 and 23 . . . . . . . . . . . . . . . . 24 22,150.00
`

console.log('--- Testing Messy W-2 ---')
const w2Result = extractFinancialData(messyW2)
console.log('Detected Type:', w2Result.formType)
console.log('Wages (Exp: 52000):', w2Result.wages)
console.log('Box 12 Untaxed (Exp: 2000):', w2Result.box12Untaxed)

console.log('\n--- Testing Messy 1040 ---')
const f1040Result = extractFinancialData(messy1040)
console.log('Detected Type:', f1040Result.formType)
console.log('AGI (Exp: 105000):', f1040Result.agi)
console.log('Tax Paid (Exp: 12000):', f1040Result.federalTax)
console.log('Untaxed IRA (Exp: 2000):', f1040Result.untaxedIRA)

console.log('\n--- Testing Messy Schedule A ---')
const schedAResult = extractFinancialData(messyScheduleA)
console.log('Detected Type:', schedAResult.formType)
console.log('Medical (Exp: 7500):', schedAResult.medicalExpenses)
console.log('Mortgage (Exp: 12000):', schedAResult.mortgageInterest)

console.log('\n--- Testing Real Bad OCR 1040 ---')
const realBadResult = extractFinancialData(realBadOCR)
console.log('Detected Type:', realBadResult.formType)
console.log('AGI (Exp: 135200):', realBadResult.agi)
console.log('Tax Paid (Exp: 22150):', realBadResult.federalTax)
console.log('Untaxed IRA (Exp: 0):', realBadResult.untaxedIRA)