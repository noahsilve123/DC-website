const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const filePath = String.raw`C:\Users\nsilv\OneDrive - University of Vermont\Attachments\large.png`;

// Copy-pasted regex logic from 1040Parser.ts to simulate extraction
const findCurrencyValue = (text, keywordRegex, lineRegex) => {
  const lines = text.split('\n');
  const targetIndex = lines.findIndex(l => keywordRegex.test(l) || lineRegex.test(l));
  
  if (targetIndex === -1) return 0;

  const extractFromText = (str) => {
    // Strategy 1: Explicit decimal
    const decimalMatches = str.match(/(\d{1,3}(?:,\d{3})*\.\d{2})/g);
    if (decimalMatches && decimalMatches.length > 0) {
      return parseFloat(decimalMatches[decimalMatches.length - 1].replace(/,/g, ''));
    }
    // Strategy 2: Any number > 100
    const allMatches = str.match(/(\d{1,3}(?:,\d{3})*)/g);
    if (allMatches && allMatches.length > 0) {
      const values = allMatches.map(v => parseFloat(v.replace(/,/g, '')));
      const likelyValues = values.filter(v => {
        if (v >= 1990 && v <= 2030) return false;
        return v > 100;
      });
      if (likelyValues.length > 0) return likelyValues[likelyValues.length - 1];
    }
    return null;
  };

  // 1. Same line
  const sameLineValue = extractFromText(lines[targetIndex]);
  if (sameLineValue !== null) return sameLineValue;

  // 2. Next 2 lines
  const nextLines = lines.slice(targetIndex + 1, targetIndex + 3);
  for (const line of nextLines) {
    if (/Line\s?\d/i.test(line) || /Total/i.test(line)) {
        if (!extractFromText(line)) break;
    }
    const nextLineValue = extractFromText(line);
    if (nextLineValue !== null) return nextLineValue;
  }
  return 0;
};

const extract1040 = (text) => {
    const agi = findCurrencyValue(text, /Adjusted\s?gross\s?income/i, /(?:Line\s?)?(?:\b11\b|\b8b\b)/i);
    const tax = findCurrencyValue(text, /total\s?tax/i, /(?:Line\s?)?(?:\b24\b|\b16\b)/i);
    return { agi, tax };
};

(async () => {
  console.log('Reading image:', filePath);
  try {
    const imageBuffer = fs.readFileSync(filePath);
    console.log('Image read. Starting Tesseract...');
    
    const result = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: m => { if(m.status === 'recognizing text') process.stdout.write(`\rProgress: ${Math.round(m.progress * 100)}%`); }
    });
    
    console.log('\nOCR Complete.');
    const text = result.data.text;
    console.log('---------------- RAW TEXT ----------------');
    console.log(text.substring(0, 1000) + '...'); // Print first 1000 chars
    console.log('------------------------------------------');
    
    const extracted = extract1040(text);
    console.log('EXTRACTED DATA:', extracted);

  } catch (err) {
    console.error('Error:', err);
  }
})();
