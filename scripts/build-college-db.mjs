import fs from 'fs';
import https from 'https';

// API Key provided by user
const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY || '2LzrYljYWbmnKaKSJHLyqDNI56QcGm4hPdJjUh0R';
const OUTPUT_FILE = './app/lib/college-data.json';

const FIELDS = [
  'id', 'school.name', 'school.school_url', 'school.city', 'school.state',
  'latest.cost.tuition.in_state', 'latest.cost.tuition.out_of_state',
  'latest.cost.booksupply',
  'latest.cost.roomboard.oncampus', 'latest.cost.roomboard.offcampus',
  'latest.cost.otherexpense.oncampus', 'latest.cost.otherexpense.offcampus',
  'school.degrees_awarded.predominant', 'latest.student.size',
  'school.minority_serving.women', 'school.men_only', 'school.religious_affiliation'
].join(',');

async function fetchPage(page) {
  const url = `https://api.data.gov/ed/collegescorecard/v1/schools?api_key=${API_KEY}&fields=${FIELDS}&per_page=100&page=${page}&school.operating=1`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Downloading college data...');
  let all = [];
  let page = 0;
  // Fetch first 50 pages (approx 5000 schools)
  while (page < 50) {
    try {
      const data = await fetchPage(page);
      if (!data.results || !data.results.length) break;
      all.push(...data.results);
      console.log(`Page ${page}: Got ${data.results.length} schools.`);
      page++;
      await new Promise(r => setTimeout(r, 100)); // Rate limit pause
    } catch (e) {
      console.error(e); break;
    }
  }

  const optimized = all.map(s => ({
    id: s.id,
    name: s['school.name'],
    url: s['school.school_url'],
    city: s['school.city'],
    state: s['school.state'],
    tuition: { in: s['latest.cost.tuition.in_state'], out: s['latest.cost.tuition.out_of_state'] },
    books: s['latest.cost.booksupply'],
    room: { on: s['latest.cost.roomboard.oncampus'], off: s['latest.cost.roomboard.offcampus'] },
    other: { on: s['latest.cost.otherexpense.oncampus'], off: s['latest.cost.otherexpense.offcampus'] },
    _degree: s['school.degrees_awarded.predominant'],
    _size: s['latest.student.size'],
    _women: s['school.minority_serving.women'],
    _men: s['school.men_only'],
    _relig: s['school.religious_affiliation']
  }))
  .filter(s => s.name)
  .filter(s => {
    // Filter: Keep only Associate (2) and Bachelor's (3) degrees
    const validDegree = s._degree === 2 || s._degree === 3;
    
    // Filter: Size > 500 (increased to get sub-2000 count)
    const validSize = s._size && s._size > 500;

    // Filter: Exclude specific religious/niche keywords
    const name = s.name.toLowerCase();
    const isNiche = name.includes('yeshiva') || 
                    name.includes('talmudical') || 
                    name.includes('rabbinical') || 
                    name.includes('seminary') ||
                    name.includes('theological');

    // Filter: Exclude single-gender schools if flagged (optional, but requested "all girls")
    // Note: API flags might be 1 or null.
    const isSingleGender = s._women === 1 || s._men === 1;

    return validDegree && validSize && !isNiche && !isSingleGender;
  })
  .map(({_degree, _size, _women, _men, _relig, ...rest}) => ({...rest, size: _size}));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(optimized));
  console.log(`Saved ${optimized.length} schools to ${OUTPUT_FILE}`);
}
run();
