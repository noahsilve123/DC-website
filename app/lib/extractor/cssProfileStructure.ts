export interface CSSQuestion {
  id: string;
  section: string;
  question: string;
  description?: string;
  sourceType: 'calculated' | 'manual' | 'estimated';
  sourceDetail?: string;
  value?: number;
  currency?: boolean;
}

export interface CSSSection {
  id: string;
  title: string;
  description: string;
  questions: CSSQuestion[];
}

export const CSS_PROFILE_SECTIONS: CSSSection[] = [
  {
    id: 'student_income',
    title: 'Student Income & Benefits',
    description: 'Income earned by the student in the prior tax year.',
    questions: [
      { id: 'SI-100', section: 'student_income', question: 'Student Wages, Salaries, Tips', sourceType: 'calculated', currency: true },
      { id: 'SI-110', section: 'student_income', question: 'Student Adjusted Gross Income (AGI)', sourceType: 'calculated', currency: true },
      { id: 'SI-120', section: 'student_income', question: 'Student Untaxed Income (Box 12)', sourceType: 'calculated', currency: true },
      { id: 'SI-130', section: 'student_income', question: 'Student Dividend Income', sourceType: 'calculated', currency: true },
    ]
  },
  {
    id: 'parent_income',
    title: 'Parent Income & Benefits',
    description: 'Income earned by parents (custodial and step-parent) in the prior tax year.',
    questions: [
      { id: 'PI-100', section: 'parent_income', question: 'Parent 1 Wages', sourceType: 'calculated', currency: true },
      { id: 'PI-105', section: 'parent_income', question: 'Parent 2 Wages', sourceType: 'calculated', currency: true },
      { id: 'PI-110', section: 'parent_income', question: 'Parents\' Adjusted Gross Income (AGI)', sourceType: 'calculated', currency: true },
      { id: 'PI-115', section: 'parent_income', question: 'Parents\' Total Tax Paid', sourceType: 'calculated', currency: true },
      { id: 'PI-120', section: 'parent_income', question: 'Parents\' Untaxed Income (W-2 Box 12)', sourceType: 'calculated', currency: true },
      { id: 'PI-130', section: 'parent_income', question: 'Parents\' Untaxed Social Security Benefits', sourceType: 'manual', description: 'Enter total non-taxed SS benefits received for all family members.', currency: true },
      { id: 'PI-140', section: 'parent_income', question: 'Parents\' Dividend Income', sourceType: 'calculated', currency: true },
      { id: 'PI-150', section: 'parent_income', question: 'Parents\' Business Net Profit', sourceType: 'calculated', currency: true },
      { id: 'PI-160', section: 'parent_income', question: 'Parents\' Untaxed Pension/IRA Distributions', sourceType: 'calculated', description: 'Total distribution minus taxable amount.', currency: true },
    ]
  },
  {
    id: 'parent_expenses',
    title: 'Parent Expenses',
    description: 'Deductible expenses that reduce your available income.',
    questions: [
      { id: 'PE-100', section: 'parent_expenses', question: 'Medical/Dental Expenses Paid', sourceType: 'calculated', description: 'From Schedule A, Line 1.', currency: true },
      { id: 'PE-110', section: 'parent_expenses', question: 'Child Support Paid', sourceType: 'manual', currency: true },
    ]
  },
  {
    id: 'assets',
    title: 'Assets',
    description: 'Current value of assets. Values should be as of today.',
    questions: [
      { id: 'AS-100', section: 'assets', question: 'Cash, Savings, Checking Accounts', sourceType: 'manual', description: 'Total balance across all bank accounts.', currency: true },
      { id: 'AS-110', section: 'assets', question: 'Investments (Stocks, Bonds, 529s)', sourceType: 'manual', description: 'Net value (Value - Debt). Exclude retirement accounts.', currency: true },
      { id: 'AS-120', section: 'assets', question: 'Primary Home Value', sourceType: 'manual', description: 'Current market value.', currency: true },
      { id: 'AS-125', section: 'assets', question: 'Primary Home Debt', sourceType: 'calculated', description: 'Estimated based on mortgage interest paid.', sourceDetail: 'Imputed from Sched A', currency: true },
    ]
  }
];
