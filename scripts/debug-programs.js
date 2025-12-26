const API_KEY = '2LzrYljYWbmnKaKSJHLyqDNI56QcGm4hPdJjUh0R';
const ID = 166683; // MIT
const URL = `https://api.data.gov/ed/collegescorecard/v1/schools?api_key=${API_KEY}&id=${ID}&fields=latest.programs.cip_4_digit`;

import https from 'https';

https.get(URL, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const json = JSON.parse(data);
    const programs = json.results[0]['latest.programs.cip_4_digit'];
    
    // Find a program with any earnings data
    const withEarnings = programs.find(p => 
        p.earnings && 
        (p.earnings['1_yr']?.overall_median_earnings || 
         p.earnings['4_yr']?.overall_median_earnings)
    );

    if (withEarnings) {
        console.log('Program with earnings:', withEarnings.title);
        console.log('Earnings:', JSON.stringify(withEarnings.earnings, null, 2));
        console.log('Debt Keys:', Object.keys(withEarnings.debt || {}));
        if (withEarnings.debt) {
             console.log('Debt Sample:', JSON.stringify(withEarnings.debt, null, 2));
        }
    } else {
        console.log('No programs with earnings found.');
        // Print first program's debt keys anyway
        if (programs[0]) {
             console.log('First Program Debt Keys:', Object.keys(programs[0].debt || {}));
        }
    }
  });
});
