const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY || '2LzrYljYWbmnKaKSJHLyqDNI56QcGm4hPdJjUh0R';
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

export async function fetchCollegeDetails(schoolId: number) {
  const fields = [
    'id',
    'school.name',
    'school.school_url',
    'school.city',
    'school.state',
    'latest.cost.tuition.in_state',
    'latest.cost.tuition.out_of_state',
    'latest.cost.booksupply',
    'latest.cost.roomboard.oncampus',
    'latest.cost.roomboard.offcampus',
    'latest.cost.otherexpense.oncampus',
    'latest.cost.otherexpense.offcampus',
    'latest.student.retention_rate.four_year.full_time',
    'latest.programs.cip_4_digit',
    'latest.cost.net_price.public.by_income_level.0-30000',
    'latest.cost.net_price.public.by_income_level.30001-48000',
    'latest.cost.net_price.public.by_income_level.48001-75000',
    'latest.cost.net_price.public.by_income_level.75001-110000',
    'latest.cost.net_price.public.by_income_level.110001-plus',
    'latest.cost.net_price.private.by_income_level.0-30000',
    'latest.cost.net_price.private.by_income_level.30001-48000',
    'latest.cost.net_price.private.by_income_level.48001-75000',
    'latest.cost.net_price.private.by_income_level.75001-110000',
    'latest.cost.net_price.private.by_income_level.110001-plus',
    'latest.cost.avg_net_price.overall'
  ].join(',');

  const url = `${BASE_URL}?api_key=${API_KEY}&id=${schoolId}&fields=${fields}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch college data: ${res.statusText}`);
  }
  
  const json = await res.json();
  if (!json.results || json.results.length === 0) {
    throw new Error('School not found');
  }

  return json.results[0];
}

export async function fetchCollegeSelectionData(schoolId: number) {
    const fields = [
      'id',
      'school.name',
      'school.school_url',
      'school.city',
      'school.state',
      'latest.student.size',
      'school.locale',
      'latest.student.demographics.race_ethnicity',
      'latest.admissions.admission_rate.overall',
      'latest.admissions.sat_scores.average.overall'
    ].join(',');
  
    const url = `${BASE_URL}?api_key=${API_KEY}&id=${schoolId}&fields=${fields}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch college selection data: ${res.statusText}`);
    }
    
    const json = await res.json();
    if (!json.results || json.results.length === 0) {
      throw new Error('School not found');
    }
  
    return json.results[0];
  }
