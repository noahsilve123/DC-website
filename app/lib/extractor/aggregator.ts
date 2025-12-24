import { ScannedDoc, FamilyMember } from '../store/documentStore'

const calculateImputedMortgage = (docs: ScannedDoc[]) => {
  const scheduleA = docs.find(d => d.detectedType === 'Schedule A');
  if (!scheduleA) return 0;
  
  const interestPaid = scheduleA.extractedData.mortgageInterest || 0;
  if (interestPaid === 0) return 0;

  const ASSUMED_RATE = 0.045; // 4.5% historic average
  return Math.round(interestPaid / ASSUMED_RATE);
}

export const calculateCSSProfile = (docs: ScannedDoc[]) => {
  const getW2Wages = (owner: FamilyMember) => 
    docs.filter(d => d.detectedType === 'W-2' && d.assignedOwner === owner)
        .reduce((sum, d) => sum + (d.extractedData.wages || 0), 0);

  const getUntaxedPension = (owner: FamilyMember) => 
    docs.filter(d => d.detectedType === 'W-2' && d.assignedOwner === owner)
        .reduce((sum, d) => sum + (d.extractedData.box12Untaxed || 0), 0);
        
  const getMedical = () => 
    docs.filter(d => d.detectedType === 'Schedule A')
        .reduce((sum, d) => sum + (d.extractedData.medicalExpenses || 0), 0);

  const getBusinessNet = (owner: FamilyMember) =>
    docs.filter(d => d.detectedType === 'Business' && d.assignedOwner === owner)
        .reduce((sum, d) => sum + (d.extractedData.netProfit || 0), 0);

  const get1040Data = (owner: FamilyMember, field: string) =>
    docs.filter(d => d.detectedType === '1040' && d.assignedOwner === owner)
        .reduce((sum, d) => sum + (parseFloat(d.extractedData[field] || '0')), 0);

  const imputedMortgage = calculateImputedMortgage(docs);

  return [
    {
      id: 'PD-110',
      question: 'Parent 1 Wages',
      value: getW2Wages('parent1'),
      source: 'Sum of Parent 1 W-2s'
    },
    {
      id: 'PD-120',
      question: 'Parent 2 Wages',
      value: getW2Wages('parent2'),
      source: 'Sum of Parent 2 W-2s'
    },
    {
      id: 'PD-130',
      question: 'Parent 1 AGI',
      value: get1040Data('parent1', 'agi'),
      source: '1040 Line 11'
    },
    {
      id: 'PD-140',
      question: 'Parent 2 AGI',
      value: get1040Data('parent2', 'agi'),
      source: '1040 Line 11'
    },
    {
      id: 'PD-240',
      question: 'Medical/Dental Expenses',
      value: getMedical(),
      source: 'Schedule A Line 1'
    },
    {
      id: 'PD-260',
      question: 'Parent 1 Business Net Profit',
      value: getBusinessNet('parent1'),
      source: 'Schedule C Line 31'
    },
    {
      id: 'PD-261',
      question: 'Parent 2 Business Net Profit',
      value: getBusinessNet('parent2'),
      source: 'Schedule C Line 31'
    },
    {
      id: 'IM-001',
      question: 'Estimated Home Mortgage Principal',
      value: imputedMortgage,
      source: 'Imputed from Sched A Interest'
    }
  ];
}
