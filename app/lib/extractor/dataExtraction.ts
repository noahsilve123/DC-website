import Fuse from 'fuse.js'
import { ExtractedData, OCRBlock } from './types'
import { TAX_RULES, isApproximately } from './taxKnowledge'

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

interface SpatialWord {
  text: string
  rect: Rect
  confidence: number
}

const PATTERNS = {
  ANY_NUMBER: /(?:[$S]|\b)\d{1,3}(?:[,\.\s]?\d{3})*(?:[.,]\d{2})?\b/gi,
  SSN: /(?!000|666|9\d{2})([0-9]{3})[- ]?([0-9]{2})[- ]?([0-9]{4})/,
  EIN: /\b([0-9]{2})[- ]([0-9]{7})\b/,
  ZIP: /\b\d{5}(?:-\d{4})?\b/,
  YEAR: /\b(20(1[5-9]|2[0-9]))\b/,
}

const cleanMoney = (raw: string): string | null => {
  if (!raw) return null
  let clean = raw.replace(/[S]/g, '$').replace(/[lI]/g, '1').replace(/[O]/g, '0')
  clean = clean.replace(/[^0-9.,]/g, '')

  if (/[,]\d{2}$/.test(clean) && !/\./.test(clean)) {
    clean = clean.replace(',', '.')
  }

  clean = clean.replace(/,/g, '')
  if (isNaN(parseFloat(clean))) return null
  return clean
}

const parseMoney = (val: string | null): number => {
  if (!val) return 0
  return parseFloat(val.replace(/[^0-9.]/g, ''))
}

class SpatialDocument {
  words: SpatialWord[]
  fuse: Fuse<SpatialWord>

  constructor(blocks: OCRBlock[] = []) {
    this.words = blocks.map((b) => ({
      text: b.text,
      confidence: b.confidence,
      rect: {
        x: b.bbox.x0,
        y: b.bbox.y0,
        w: b.bbox.x1 - b.bbox.x0,
        h: b.bbox.y1 - b.bbox.y0,
      },
    }))

    this.fuse = new Fuse(this.words, {
      keys: ['text'],
      threshold: 0.3,
      includeScore: true,
    })
  }

  findAnchor(phrase: string): Rect | null {
    const tokens = phrase.split(' ')
    const searchToken = tokens.reduce((a, b) => (a.length > b.length ? a : b))

    const results = this.fuse.search(searchToken)
    if (!results.length) return null

    return results[0].item.rect
  }

  scanRegion(roi: Rect, pattern: RegExp): string | null {
    const candidates = this.words.filter((w) => {
      const centerX = w.rect.x + w.rect.w / 2
      const centerY = w.rect.y + w.rect.h / 2
      return centerX >= roi.x && centerX <= roi.x + roi.w && centerY >= roi.y && centerY <= roi.y + roi.h
    })

    candidates.sort((a, b) => {
      if (Math.abs(a.rect.y - b.rect.y) < 10) return a.rect.x - b.rect.x
      return a.rect.y - b.rect.y
    })

    const joined = candidates.map((w) => w.text).join(' ')
    const match = joined.match(pattern)
    if (match) return match[0]
    return null
  }
}

const scanRawTextForValue = (fullText: string, searchKeywords: string[], excludeValues: (string | null)[] = []): string | null => {
  const lowerText = fullText.toLowerCase()

  for (const keyword of searchKeywords) {
    const idx = lowerText.indexOf(keyword.toLowerCase())

    if (idx !== -1) {
      const snippet = fullText.slice(idx, idx + 300)
      const matches = snippet.match(PATTERNS.ANY_NUMBER)

      if (matches) {
        for (const rawMatch of matches) {
          const cleaned = cleanMoney(rawMatch)
          if (!cleaned) continue

          const val = parseFloat(cleaned)

          if (val < 100 && !rawMatch.includes('.')) continue
          if (val >= 1990 && val <= 2030 && !rawMatch.includes('.')) continue
          if (excludeValues.some((ex) => ex && cleaned.includes(ex))) continue
          if (val > 0) return cleaned
        }
      }
    }
  }
  return null
}

export const extractFinancialData = (text: string, blocks: OCRBlock[] = []): ExtractedData => {
  const data: ExtractedData = {
    formType: 'Unknown',
    taxYear: null,
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
    rawText: text,
    warnings: [],
    confidenceScore: 100,
  }

  if (/W-?2/i.test(text) || /Wage and Tax/i.test(text) || /Employer identification/i.test(text)) data.formType = 'W-2'
  else if (/1040/i.test(text) || /Income Tax Return/i.test(text)) data.formType = '1040'

  const ssnMatch = text.match(PATTERNS.SSN)
  if (ssnMatch) data.ssn = `${ssnMatch[1]}-${ssnMatch[2]}-${ssnMatch[3]}`

  const einMatch = text.match(PATTERNS.EIN)
  if (einMatch) data.ein = `${einMatch[1]}-${einMatch[2]}`

  const yearMatch = text.match(PATTERNS.YEAR)
  if (yearMatch) data.taxYear = yearMatch[1]

  const doc = blocks.length ? new SpatialDocument(blocks) : null
  const lines = text.split('\n').filter((l) => l.trim().length > 0)

  const findField = (anchors: string[], lineKeywords: string[], type: 'W2_BOX' | '1040_LINE'): string | null => {
    let val: string | null = null

    if (doc) {
      for (const phrase of anchors) {
        const anchor = doc.findAnchor(phrase)
        if (anchor) {
          const roi =
            type === 'W2_BOX'
              ? { x: anchor.x - 20, y: anchor.y + anchor.h * 0.5, w: 500, h: 100 }
              : { x: anchor.x + anchor.w, y: anchor.y - 10, w: 2000, h: anchor.h + 20 }
          const found = doc.scanRegion(roi, PATTERNS.ANY_NUMBER)
          if (found) {
            val = found
            break
          }
        }
      }
    }

    if (!val) {
      const allKeywords = [...anchors, ...lineKeywords]
      val = scanRawTextForValue(text, allKeywords, [data.ssn, data.taxYear])
    }

    const cleaned = cleanMoney(val || '')
    return cleaned
  }

  if (data.formType === 'W-2') {
    data.wages = findField(['Wages tips'], ['Wages, tips', 'Box 1', 'Wages, tips, other'], 'W2_BOX')
    data.federalTax = findField(['Federal income'], ['Federal income tax', 'Box 2'], 'W2_BOX')
    data.socialSecurityWages = findField(['Social security wages'], ['Social security wages', 'Box 3'], 'W2_BOX')
    data.socialSecurityTax = findField(['Social security tax'], ['Social security tax', 'Box 4'], 'W2_BOX')
    data.medicareWages = findField(['Medicare wages'], ['Medicare wages', 'Box 5'], 'W2_BOX')
    data.medicareTax = findField(['Medicare tax'], ['Medicare tax', 'Box 6'], 'W2_BOX')
  } else {
    data.wages = findField(['Wages salaries', '1z'], ['Wages, salaries', 'Line 1', 'Line 1z', 'total amount from box 1'], '1040_LINE')
    data.agi = findField(['Adjusted gross', '11'], ['Adjusted gross income', 'Line 11', 'Subtract line 10'], '1040_LINE')
    data.federalTax = findField(['total tax', '24'], ['total tax', 'Line 24', 'Add lines 22 and 23'], '1040_LINE')

    if (!data.federalTax) {
      data.federalTax = scanRawTextForValue(text, ['Federal income tax withheld', 'Line 25', 'Form(s) W-2'], [data.ssn, data.taxYear])
    }
  }

  if (data.formType === '1040' && !data.agi && data.wages) {
    data.agi = data.wages
    data.warnings.push({
      field: 'agi',
      severity: 'warning',
      actual: data.agi,
      expected: 'N/A',
      message: 'AGI not explicitly found. Using Wages as estimate.',
    })
  }

  if (!data.employeeAddress) {
    const addressMatch = text.match(/\b([A-Z]{2})\s+(\d{5})\b/)
    if (addressMatch) {
      const idx = lines.findIndex((l) => l.includes(addressMatch[0]))
      if (idx !== -1) {
        data.employeeAddress = `${lines[idx - 1] || ''}\n${lines[idx]}`
      }
    }
  }

  const rules = TAX_RULES[data.taxYear || 'DEFAULT'] || TAX_RULES.DEFAULT
  const wSS = parseMoney(data.socialSecurityWages)
  const tSS = parseMoney(data.socialSecurityTax)

  if (wSS > 0 && tSS > 0) {
    const expectedTax = Math.min(wSS * rules.ssTaxRate, rules.maxSSTax)
    if (!isApproximately(tSS, expectedTax, 5.0)) {
      data.confidenceScore -= 15
      data.warnings.push({
        field: 'socialSecurityTax',
        severity: 'error',
        actual: tSS.toFixed(2),
        expected: expectedTax.toFixed(2),
        message: `Tax mismatch. Expected ~$${expectedTax.toFixed(2)} based on wages.`,
      })
    }
  }

  return data
}
