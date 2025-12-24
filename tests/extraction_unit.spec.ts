import { test, expect } from '@playwright/test';
import { extract1040Data } from '../app/lib/extractor/parsers/1040Parser';

test.describe('1040 Data Extraction Logic', () => {

  test('extracts AGI and Tax from perfect single-line text', () => {
    const text = `
      Form 1040
      Line 11 Adjusted Gross Income ........... 125,000.00
      Line 12 Standard Deduction ............... 25,000.00
      Line 24 Total Tax ........................ 15,400.50
    `;
    const result = extract1040Data(text);
    expect(result.agi).toBe(125000);
    expect(result.taxPaid).toBe(15400.50);
  });

  test('extracts AGI when value is on the next line (OCR wrap)', () => {
    const text = `
      Form 1040
      Line 11 Adjusted Gross Income
      125,000.00
      Line 12 Standard Deduction
      Line 24 Total Tax
      15,400.50
    `;
    const result = extract1040Data(text);
    expect(result.agi).toBe(125000);
    expect(result.taxPaid).toBe(15400.50);
  });

  test('extracts data from older forms (Line 8b for AGI)', () => {
    const text = `
      Form 1040 (2019)
      Line 8b Adjusted Gross Income ........... 85,000.00
      Line 16 Total Tax ........................ 8,200.00
    `;
    const result = extract1040Data(text);
    expect(result.agi).toBe(85000);
    expect(result.taxPaid).toBe(8200);
  });

  test('handles chaotic OCR text with noise', () => {
    const text = `
      1040 US Individual Income Tax Return 2023
      ...
      11 Adjusted gross income . . . . . . . . . . . .
      $ 62,450.00
      12 Standard deduction or itemized deductions (from Schedule A)
      13 Qualified business income deduction. Attach Form 8995 or Form 8995-A
      ...
      24 Add lines 22 and 23. This is your total tax . . . . . . . .
      $ 4,120.00
    `;
    const result = extract1040Data(text);
    expect(result.agi).toBe(62450);
    expect(result.taxPaid).toBe(4120);
  });

  test('calculates untaxed IRA distributions correctly', () => {
    const text = `
      4a IRA distributions ... 20,000.00
      4b Taxable amount ...... 15,000.00
    `;
    const result = extract1040Data(text);
    expect(result.untaxedIRA).toBe(5000); // 20k - 15k
  });

  test('returns 0 when data is missing', () => {
    const text = `
      Form 1040
      Nothing here
    `;
    const result = extract1040Data(text);
    expect(result.agi).toBe(0);
    expect(result.taxPaid).toBe(0);
  });
});
