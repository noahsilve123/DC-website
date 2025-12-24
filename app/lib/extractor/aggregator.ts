import { ScannedDoc, FamilyMember } from '../store/documentStore'
import { CSS_PROFILE_SECTIONS, CSSSection, CSSQuestion } from './cssProfileStructure'

export const calculateCSSProfile = (docs: ScannedDoc[]): CSSSection[] => {
  // Deep copy structure
  const sections: CSSSection[] = JSON.parse(JSON.stringify(CSS_PROFILE_SECTIONS));

  // Helper: Treat null/undefined owner as 'parent1'
  const isOwner = (d: ScannedDoc, target: FamilyMember) => {
    if (target === 'parent1') {
      return d.assignedOwner === 'parent1' || !d.assignedOwner;
    }
    return d.assignedOwner === target;
  };
  
  const isStudent = (d: ScannedDoc) => d.assignedOwner === 'student';
  const isParent = (d: ScannedDoc) => d.assignedOwner === 'parent1' || d.assignedOwner === 'parent2' || !d.assignedOwner;

  // --- Aggregation Functions ---

  const sumWages = (filterFn: (d: ScannedDoc) => boolean) => 
    docs.filter(d => d.detectedType === 'W-2' && filterFn(d))
        .reduce((sum, d) => sum + (parseFloat(d.extractedData.wages || '0')), 0);

  const sumBox12 = (filterFn: (d: ScannedDoc) => boolean) => 
    docs.filter(d => d.detectedType === 'W-2' && filterFn(d))
        .reduce((sum, d) => sum + (d.extractedData.box12Untaxed || 0), 0);

  const sum1040Field = (filterFn: (d: ScannedDoc) => boolean, field: string) =>
    docs.filter(d => d.detectedType === '1040' && filterFn(d))
        .reduce((sum, d) => sum + (parseFloat(d.extractedData[field] || '0')), 0);

  const sum1040Number = (filterFn: (d: ScannedDoc) => boolean, field: 'dividendIncome' | 'untaxedIRA' | 'itemizedDeductions') =>
     docs.filter(d => d.detectedType === '1040' && filterFn(d))
         .reduce((sum, d) => sum + (d.extractedData[field] || 0), 0);

  const sumSchedC = (filterFn: (d: ScannedDoc) => boolean) =>
    docs.filter(d => d.detectedType === 'Business' && filterFn(d))
        .reduce((sum, d) => sum + (d.extractedData.netProfit || 0), 0);

  const sumSchedA_Medical = () => 
    docs.filter(d => d.detectedType === 'Schedule A')
        .reduce((sum, d) => sum + (d.extractedData.medicalExpenses || 0), 0);

  const calculateImputedMortgage = () => {
    const scheduleA = docs.find(d => d.detectedType === 'Schedule A');
    if (!scheduleA) return 0;
    const interest = scheduleA.extractedData.mortgageInterest || 0;
    if (interest === 0) return 0;
    // Estimate Principal: Interest / Rate. 
    // Using 4.5% as a conservative historical average for existing mortgages.
    return Math.round(interest / 0.045);
  };

  // --- Value Injection ---

  const updateQuestion = (id: string, val: number, source: string) => {
    for (const section of sections) {
      const q = section.questions.find(q => q.id === id);
      if (q) {
        q.value = val;
        q.sourceDetail = source;
        return;
      }
    }
  };

  // Student Values
  updateQuestion('SI-100', sumWages(isStudent), 'Student W-2s');
  updateQuestion('SI-110', sum1040Field(isStudent, 'agi'), 'Student 1040 Line 11');
  updateQuestion('SI-120', sumBox12(isStudent), 'Student W-2 Box 12');
  updateQuestion('SI-130', sum1040Number(isStudent, 'dividendIncome'), 'Student 1040 Line 3b');

  // Parent Values
  updateQuestion('PI-100', sumWages(d => isOwner(d, 'parent1')), 'Parent 1 W-2s');
  updateQuestion('PI-105', sumWages(d => isOwner(d, 'parent2')), 'Parent 2 W-2s');
  updateQuestion('PI-110', sum1040Field(isParent, 'agi'), 'Parent 1040 Line 11');
  updateQuestion('PI-115', sum1040Field(isParent, 'federalTax'), 'Parent 1040 Line 24');
  updateQuestion('PI-120', sumBox12(isParent), 'Parent W-2 Box 12');
  updateQuestion('PI-140', sum1040Number(isParent, 'dividendIncome'), 'Parent 1040 Line 3b');
  updateQuestion('PI-150', sumSchedC(isParent), 'Schedule C Line 31');
  updateQuestion('PI-160', sum1040Number(isParent, 'untaxedIRA'), '1040 (Total - Taxable) Distributions');

  // Parent Expenses
  updateQuestion('PE-100', sumSchedA_Medical(), 'Schedule A Line 1');

  // Assets
  const imputedMortgage = calculateImputedMortgage();
  if (imputedMortgage > 0) {
    updateQuestion('AS-125', imputedMortgage, 'Estimated from Sched A Interest (4.5% rate)');
  } else {
    updateQuestion('AS-125', 0, 'No mortgage interest found on Sched A');
  }

  return sections;
}