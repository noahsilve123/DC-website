import { test, expect } from '@playwright/test'

function pad10(n: number) {
  return String(n).padStart(10, '0')
}

function createTwoPagePdfWithSecondPageText(text: string): Buffer {
  const header = '%PDF-1.4\n'

  const page1Stream = ''
  // Emit >= 10 separate text items so PDF.js treats it as a text-layer page.
  // Keep key fields on a single line to satisfy extraction regexes.
  const parts = text.split('\n').map((s) => s.trim()).filter(Boolean)
  const lines = parts.length ? parts : [text]
  const escaped = (s: string) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

  let page2Stream = 'BT\n/F1 12 Tf\n72 720 Td\n'
  const items: string[] = [...lines]
  while (items.length < 12) items.push(`FILLER_${items.length}`)

  for (let i = 0; i < items.length; i++) {
    page2Stream += `(${escaped(items[i])}) Tj\n`
    page2Stream += 'T*\n'
  }
  page2Stream += 'ET\n'

  const obj5 = `5 0 obj\n<< /Length ${Buffer.byteLength(page1Stream, 'utf8')} >>\nstream\n${page1Stream}\nendstream\nendobj\n`
  const obj7 = `7 0 obj\n<< /Length ${Buffer.byteLength(page2Stream, 'utf8')} >>\nstream\n${page2Stream}\nendstream\nendobj\n`

  const objects: Record<number, string> = {
    1: '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    2: '2 0 obj\n<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>\nendobj\n',
    3: '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >>\nendobj\n',
    4: '4 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 7 0 R /Resources << /Font << /F1 6 0 R >> >> >>\nendobj\n',
    5: obj5,
    6: '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    7: obj7,
  }

  const offsets: number[] = new Array(8).fill(0)

  let pdf = header
  for (let i = 1; i <= 7; i++) {
    offsets[i] = Buffer.byteLength(pdf, 'utf8')
    pdf += objects[i]
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8')
  pdf += 'xref\n'
  pdf += '0 8\n'
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i <= 7; i++) {
    pdf += `${pad10(offsets[i])} 00000 n \n`
  }

  pdf += 'trailer\n'
  pdf += '<< /Size 8 /Root 1 0 R >>\n'
  pdf += 'startxref\n'
  pdf += `${xrefOffset}\n`
  pdf += '%%EOF\n'

  return Buffer.from(pdf, 'utf8')
}

test('extractor handles multi-page PDF with blank cover page', async ({ page }) => {
  test.setTimeout(120_000)

  // Page 1 has no text; page 2 contains the 1040 lines.
  const pdfText = [
    'Form 1040',
    'Line 11 Adjusted Gross Income 125,000.00',
    'Line 24 Total Tax 15,400.50',
  ].join('\n')
  const pdfBuffer = createTwoPagePdfWithSecondPageText(pdfText)

  await page.goto('/tools')

  await page.setInputFiles('input[type="file"][multiple]', {
    name: 'multipage.pdf',
    mimeType: 'application/pdf',
    buffer: pdfBuffer,
  })

  // Wait until the document finishes processing (type detected).
  await expect(page.locator('text=1040')).toBeVisible({ timeout: 120_000 })

  // Assign the document owner so aggregations include it.
  await page.selectOption('select', { value: 'parent1' })

  // Navigate to the CSS Profile tool to see interpretation.
  await page.goto('/tools/css-profile')

  // Wait for processing to finish and aggregation to populate.
  const agiRow = page.locator('tr', { hasText: 'PI-110' })
  await expect(agiRow).toBeVisible({ timeout: 120_000 })
  await expect(agiRow).toContainText('$125,000', { timeout: 120_000 })
})
