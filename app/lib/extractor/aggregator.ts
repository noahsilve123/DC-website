import { ScannedDoc, FamilyMember } from '../store/documentStore'
import { CSS_PROFILE_SECTIONS, CSSSection, CSSQuestion } from './cssProfileStructure'

export const calculateCSSProfile = (docs: ScannedDoc[]): CSSSection[] => {
  // Deep copy structure
  const sections: CSSSection[] = JSON.parse(JSON.stringify(CSS_PROFILE_SECTIONS));

  // Helper: Require explicit owner assignment
  const isOwner = (d: ScannedDoc, target: FamilyMember) => d.assignedOwner === target;
  
  const isStudent = (d: ScannedDoc) => d.assignedOwner === 'student';
  const isParent = (d: ScannedDoc) => d.assignedOwner === 'parent1' || d.assignedOwner === 'parent2';

  // --- Aggregation Functions ---

  // Helper to safely parse numbers/strings
  const val = (v: any): number => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
        const cleaned = v.replace(/,/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  // Wages: Sum W-2s. If none, check 1040 Line 1 as fallback (if user only uploaded 1040)
  const sumWages = (filterFn: (d: ScannedDoc) => boolean) => {
    const w2s = docs.filter(d => (d.detectedType === 'W-2' || d.extractedData.wages) && filterFn(d));
    const totalW2 = w2s.reduce((sum, d) => {
        // Only count if it looks like a W-2 wage (extracted via w2Parser or manual w2 detection)
        // Note: extractedData.wages is populated by both 1040 and W2 parsers.
        // We need to avoid double counting if both exist.
        // If detectedType is 'W-2', use it. 
        // If detectedType is '1040', only use it if we DON'T have a W-2 for this person?
        // Simplifying: Just sum extractedData.wages from all relevant docs, 
        // BUT typically 1040 Wages = Sum of W-2 Wages.
        // So if we have both, we double count.
        // FIX: Prioritize W-2s. If W-2s exist, ignore 1040 wages.
        return sum;
    }, 0);

    const hasW2 = docs.some(d => d.detectedType === 'W-2' && filterFn(d));
    if (hasW2) {
        return docs.filter(d => d.detectedType === 'W-2' && filterFn(d))
                   .reduce((sum, d) => sum + val(d.extractedData.wages), 0);
    } else {
        // Fallback to 1040 wages if no W-2s found
        return docs.filter(d => d.detectedType === '1040' && filterFn(d))
                   .reduce((sum, d) => sum + val(d.extractedData.wages), 0);
    }
  }

  const sumBox12 = (filterFn: (d: ScannedDoc) => boolean) => 
    docs.filter(d => filterFn(d))
        .reduce((sum, d) => sum + val(d.extractedData.box12Untaxed), 0);

  const sum1040Field = (filterFn: (d: ScannedDoc) => boolean, field: string) =>
    docs.filter(d => filterFn(d) && d.extractedData[field])
        .reduce((sum, d) => sum + val(d.extractedData[field]), 0);

  const sum1040Number = (filterFn: (d: ScannedDoc) => boolean, field: string) =>
     docs.filter(d => filterFn(d) && d.extractedData[field])
         .reduce((sum, d) => sum + val(d.extractedData[field]), 0);

  const sumSchedC = (filterFn: (d: ScannedDoc) => boolean) =>
    docs.filter(d => filterFn(d) && d.extractedData.netProfit)
        .reduce((sum, d) => sum + val(d.extractedData.netProfit), 0);

  const sumSchedA_Medical = () => 
    docs.reduce((sum, d) => sum + val(d.extractedData.medicalExpenses), 0);
    
  const sumUntaxedSS = (filterFn: (d: ScannedDoc) => boolean) =>
    docs.filter(d => filterFn(d))
        .reduce((sum, d) => sum + val(d.extractedData.untaxedSocialSecurity), 0);

  const calculateImputedMortgage = () => {
    // Find ANY doc with mortgage interest
    const interestDoc = docs.find(d => val(d.extractedData.mortgageInterest) > 0);
    if (!interestDoc) return 0;
    const interest = val(interestDoc.extractedData.mortgageInterest);
    return Math.round(interest / 0.045);
  };

  // Asset Estimation
  const estimateSavings = (filterFn: (d: ScannedDoc) => boolean) => {
      // Estimate principal from Taxable Interest (Line 2b). Assumed rate: 1.0% (conservative for savings)
      // Principal = Interest / 0.01
      const interest = sum1040Number(filterFn, 'taxableInterest');
      if (interest > 0) return Math.round(interest / 0.01);
      return 0;
  }
  
  const estimateInvestments = (filterFn: (d: ScannedDoc) => boolean) => {
      // Estimate principal from Dividends (Line 3b). Assumed yield: 2.0%
      const dividends = sum1040Number(filterFn, 'dividendIncome');
      if (dividends > 0) return Math.round(dividends / 0.02);
      return 0;
  }

  // --- Value Injection ---

  const updateQuestion = (id: string, val: number, source: string, sourceType: 'calculated' | 'estimated' = 'calculated') => {
    for (const section of sections) {
      const q = section.questions.find(q => q.id === id);
      if (q) {
        q.value = val;
        q.sourceDetail = source;
        if (q.sourceType !== 'manual') q.sourceType = sourceType;
        return;
      }
    }
  };

  // Student Values
  updateQuestion('SI-100', sumWages(isStudent), 'Student W-2s (or 1040 Line 1)');
  updateQuestion('SI-110', sum1040Field(isStudent, 'agi'), 'Student 1040 Line 11');
  updateQuestion('SI-120', sumBox12(isStudent), 'Student W-2 Box 12');
  updateQuestion('SI-130', sum1040Number(isStudent, 'dividendIncome'), 'Student 1040 Line 3b');

  // Parent Values
  updateQuestion('PI-100', sumWages(d => isOwner(d, 'parent1')), 'Parent 1 W-2s (or 1040)');
  updateQuestion('PI-105', sumWages(d => isOwner(d, 'parent2')), 'Parent 2 W-2s (or 1040)');
  updateQuestion('PI-110', sum1040Field(isParent, 'agi'), 'Parent 1040 Line 11');
  updateQuestion('PI-115', sum1040Field(isParent, 'federalTax'), 'Parent 1040 Line 24');
  updateQuestion('PI-120', sumBox12(isParent), 'Parent W-2 Box 12');
  updateQuestion('PI-130', sumUntaxedSS(isParent), 'Parent 1040 Line 6a-6b');
  updateQuestion('PI-140', sum1040Number(isParent, 'dividendIncome'), 'Parent 1040 Line 3b');
  updateQuestion('PI-150', sumSchedC(isParent), 'Schedule C Line 31');
  updateQuestion('PI-160', sum1040Number(isParent, 'untaxedIRA'), '1040 (Total - Taxable) Distributions');

  // Parent Expenses
  updateQuestion('PE-100', sumSchedA_Medical(), 'Schedule A Line 1');

  // Assets
  const imputedMortgage = calculateImputedMortgage();
  if (imputedMortgage > 0) {
    updateQuestion('AS-125', imputedMortgage, 'Estimated from Sched A Interest (4.5% rate)', 'estimated');
  } else {
    updateQuestion('AS-125', 0, 'No mortgage interest found on Sched A');
  }
  
  // Estimated Assets
  const estSavings = estimateSavings(isParent);
  if (estSavings > 0) updateQuestion('AS-100', estSavings, 'Estimated from 1040 Interest (1% APY)', 'estimated');
  
  const estInvestments = estimateInvestments(isParent);
  if (estInvestments > 0) updateQuestion('AS-110', estInvestments, 'Estimated from 1040 Dividends (2% Yield)', 'estimated');

  return sections;
}
