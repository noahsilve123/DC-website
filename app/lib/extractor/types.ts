export interface ProcessingStatus {
  isProcessing: boolean;
  progress: number; // 0-100
  message: string;
}

export interface OCRBlock {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface OCRResult {
  text: string;
  blocks: OCRBlock[];
  confidence?: number;
  timestamp: number;
}

export interface PreprocessingOptions {
  /** Target width in pixels to emulate ~300 DPI for a standard page */
  targetWidth?: number;
  /** 0.0 to 1.0 - lower values darken faint text */
  gamma?: number;
  /** Method to convert image to black/white. 'none' preserves grayscale for Tesseract LSTM. */
  binarizationMethod?: 'simple' | 'adaptive' | 'none';
  /** Window size for adaptive thresholding. Larger = more robust to large shadows. */
  adaptiveWindowSize?: number;
  /** 0 to 255. Sensitivity for adaptive threshold. */
  adaptiveConstant?: number;
}

export interface OCROptions {
  language: string;
  psm: string; // Page Segmentation Mode
  preprocessing?: PreprocessingOptions;
}

export interface ValidationWarning {
  field: string;
  expected: string;
  actual: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface ExtractedData {
  formType: string;
  taxYear: string | null;

  // IDs
  ssn: string | null;
  ein: string | null;

  // Income
  wages: string | null;           // W-2 Box 1 / 1040 Line 1
  agi: string | null;             // 1040 Line 11 (Critical for FAFSA)
  federalTax: string | null;      // W-2 Box 2 / 1040 Line 25
  socialSecurityWages: string | null; // W-2 Box 3
  socialSecurityTax: string | null;   // W-2 Box 4
  medicareWages: string | null;       // W-2 Box 5
  medicareTax: string | null;         // W-2 Box 6
  
  // New fields for CSS Profile
  box12Untaxed?: number;
  medicalExpenses?: number;
  netProfit?: number;
  mortgageInterest?: number;
  itemizedDeductions?: number;
  untaxedIRA?: number;
  dividendIncome?: number;

  // Entities
  employerName: string | null;
  employeeAddress: string | null;

  rawText?: string;

  // AI/Logic Insights
  warnings: ValidationWarning[];
  confidenceScore: number; // 0-100
}
