
const fs = require('fs');
const path = require('path');

const collegeDataPath = path.join(__dirname, '../app/lib/college-data.json');
const socialVibesPath = path.join(__dirname, '../app/lib/social-vibes.json');

try {
  const collegeData = JSON.parse(fs.readFileSync(collegeDataPath, 'utf8'));
  const socialVibes = JSON.parse(fs.readFileSync(socialVibesPath, 'utf8'));

  // Sort by size descending
  const sortedColleges = collegeData.sort((a, b) => (b.size || 0) - (a.size || 0));

  // Take top 500
  const top500 = sortedColleges.slice(0, 500);

  const socialVibeKeys = Object.keys(socialVibes);
  
  const isCovered = (schoolName) => {
    if (socialVibes[schoolName]) return true;
    return socialVibeKeys.some(key => {
        const k = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const s = schoolName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return k.includes(s) || s.includes(k);
    });
  };

  const missingSchools = top500.filter(school => !isCovered(school.name));

  console.log("Missing Schools from Top 500 by Enrollment:");
  missingSchools.forEach(s => console.log(s.name));

} catch (err) {
  console.error('Error:', err);
}
