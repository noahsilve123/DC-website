import { test, expect } from '@playwright/test';
import { extractW2Data } from '../app/lib/extractor/parsers/w2Parser';
import { extractScheduleAData } from '../app/lib/extractor/parsers/scheduleAParser';
import { extractScheduleCData } from '../app/lib/extractor/parsers/scheduleCParser';
import { calculateCSSProfile } from '../app/lib/extractor/aggregator';
import { ScannedDoc } from '../app/lib/store/documentStore';

test.describe('Advanced Extraction Logic', () => {

  test.describe('W-2 Parsing', () => {
    test('extracts Wages correctly', () => {
      const text = `
        2023 W-2 Wage and Tax Statement
        Box 1 Wages, tips, other compensation 55,000.00
        Box 2 Federal income tax withheld 5,000.00
      `;
      const result = extractW2Data(text);
      expect(result.wages).toBe(55000);
    });

    test('extracts and sums valid Box 12 codes (D, E, F, G, H, S)', () => {
      const text = `
        2023 W-2
        Box 12 D 5,000.00
        Box 12 C 1,000.00  (Should be ignored)
        Box 12 S 2,000.00
      `;
      const result = extractW2Data(text);
      // Expected: 5000 (D) + 2000 (S) = 7000. (C is excluded)
      expect(result.box12Untaxed).toBe(7000);
    });

    test('handles multiple Box 12 entries with flexible spacing', () => {
      const text = `
        12D 1000.00
        Box 12 E 2000.00
        12 G $3,000.00
      `;
      const result = extractW2Data(text);
      expect(result.box12Untaxed).toBe(6000);
    });
  });

  test.describe('Schedule Parsing', () => {
    test('extracts Schedule A Medical and Mortgage', () => {
      const text = `
        Schedule A (Form 1040) 2023
        Medical and Dental Expenses
        1 Medical and dental expenses ........................ 15,000.00
        Interest You Paid
        8a Home mortgage interest and points ................ 12,000.00
      `;
      const result = extractScheduleAData(text);
      expect(result.medicalExpenses).toBe(15000);
      expect(result.mortgageInterest).toBe(12000);
    });

    test('extracts Schedule C Net Profit', () => {
      const text = `
        Schedule C (Form 1040) 2023
        Profit or Loss From Business
        31 Net profit or (loss) .............................. 45,000.00
      `;
      const result = extractScheduleCData(text);
      expect(result.netProfit).toBe(45000);
    });
  });

  test.describe('CSS Profile Aggregation', () => {
    // Helper to create a mock doc
    const createDoc = (id: string, type: string, owner: 'student' | 'parent1' | 'parent2', data: any): ScannedDoc => ({
      id,
      file: new File([], 'test.pdf'),
      previewUrl: '',
      status: 'complete',
      detectedType: type,
      assignedOwner: owner,
      extractedData: {
        formType: type,
        taxYear: '2023',
        ssn: null,
        ein: null,
        wages: null,
        agi: null,
        federalTax: null,
        socialSecurityWages: null,
        socialSecurityTax: null,
        medicareWages: null,
        medicareTax: null,
        employerName: null,
        employeeAddress: null,
        warnings: [],
        confidenceScore: 100,
        ...data
      }
    });

    test('correctly aggregates Student Income', () => {
      const docs: ScannedDoc[] = [
        createDoc('1', 'W-2', 'student', { wages: '10000', box12Untaxed: 500 }),
        createDoc('2', '1040', 'student', { agi: '10500', dividendIncome: 200 })
      ];

      const sections = calculateCSSProfile(docs);
      const studentSection = sections.find(s => s.id === 'student_income');
      
      const wages = studentSection?.questions.find(q => q.id === 'SI-100')?.value;
      const agi = studentSection?.questions.find(q => q.id === 'SI-110')?.value;
      const untaxed = studentSection?.questions.find(q => q.id === 'SI-120')?.value;

      expect(wages).toBe(10000);
      expect(agi).toBe(10500);
      expect(untaxed).toBe(500);
    });

    test('correctly aggregates Parent Income and Assets', () => {
      const docs: ScannedDoc[] = [
        // Parent 1 W2
        createDoc('1', 'W-2', 'parent1', { wages: '50000', box12Untaxed: 2000 }),
        // Parent 2 W2
        createDoc('2', 'W-2', 'parent2', { wages: '60000', box12Untaxed: 0 }),
        // Joint 1040
        createDoc('3', '1040', 'parent1', { agi: '115000', federalTax: '15000', untaxedIRA: 1000, dividendIncome: 500 }),
        // Schedule A (for Mortgage)
        createDoc('4', 'Schedule A', 'parent1', { mortgageInterest: 9000 })
      ];

      const sections = calculateCSSProfile(docs);
      
      // Parent Income
      const parentIncome = sections.find(s => s.id === 'parent_income');
      const p1Wages = parentIncome?.questions.find(q => q.id === 'PI-100')?.value;
      const p2Wages = parentIncome?.questions.find(q => q.id === 'PI-105')?.value;
      const pUntaxed = parentIncome?.questions.find(q => q.id === 'PI-120')?.value;
      
      expect(p1Wages).toBe(50000);
      expect(p2Wages).toBe(60000);
      expect(pUntaxed).toBe(2000); // 2000 + 0

      // Assets (Imputed Mortgage)
      const assets = sections.find(s => s.id === 'assets');
      const homeDebt = assets?.questions.find(q => q.id === 'AS-125')?.value;
      
      // 9000 / 0.045 = 200,000
      expect(homeDebt).toBeCloseTo(200000, -1);
    });
  });
});
