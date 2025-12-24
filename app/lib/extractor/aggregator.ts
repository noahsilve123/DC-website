import { ScannedDoc, FamilyMember } from '../store/documentStore'

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
    }
  ];
}
