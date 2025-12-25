import 'server-only'
import schoolsData from './college-data.json'

export type TuitionMode = 'in_state' | 'out_of_state'
export type CollegeCostInput = { schoolName: string; years?: number; inflationRate?: number; tuitionMode?: TuitionMode }
export type CollegeCostSchool = { name: string; schoolUrl: string | null; city: string | null; state: string | null }
export type CollegeCostRaw = {
  school: CollegeCostSchool
  tuition: { inState: number | null; outOfState: number | null }
  booksSupply: number | null
  roomBoard: { onCampus: number | null; offCampus: number | null }
  otherExpense: { onCampus: number | null; offCampus: number | null }
}
export type ProjectedLineItems = { tuition: number; housing: number; foodOther: number; books: number; total: number }
export type CollegeCostProjection = { years: number; inflationRate: number; tuitionMode: TuitionMode; onCampus: ProjectedLineItems; offCampus: ProjectedLineItems }
export type ComprehensiveCollegeCosts = { raw: CollegeCostRaw; projection: CollegeCostProjection }

const safe = (v: any) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0)
export function clampYears(y: number) { return !Number.isFinite(y) ? 4 : Math.min(6, Math.max(1, Math.floor(y))) }
export function clampInflationRate(r: number) { return !Number.isFinite(r) ? 0.03 : Math.min(0.1, Math.max(0, r)) }
export function projectCostOverYears(base: number, years: number, rate: number) {
  let total = 0; for (let i = 0; i < years; i++) total += base * Math.pow(1 + rate, i); return total;
}

function mapToRaw(row: any): CollegeCostRaw {
  return {
    school: { name: row.name, schoolUrl: row.url || null, city: row.city || null, state: row.state || null },
    tuition: { inState: row.tuition.in || null, outOfState: row.tuition.out || null },
    booksSupply: row.books || null,
    roomBoard: { onCampus: row.room.on || null, offCampus: row.room.off || null },
    otherExpense: { onCampus: row.other.on || null, offCampus: row.other.off || null }
  }
}

export function projectLineItems(raw: CollegeCostRaw, years: number, inflationRate: number, tuitionMode: TuitionMode): CollegeCostProjection {
  const y = clampYears(years); const r = clampInflationRate(inflationRate);
  const tuitionBase = tuitionMode === 'out_of_state' ? safe(raw.tuition.outOfState) : safe(raw.tuition.inState);
  const booksBase = safe(raw.booksSupply);
  const calc = (base: number) => projectCostOverYears(base, y, r);
  
  const createProj = (housing: number, other: number) => {
    const p = { tuition: calc(tuitionBase), housing: calc(housing), foodOther: calc(other), books: calc(booksBase), total: 0 };
    p.total = p.tuition + p.housing + p.foodOther + p.books; return p;
  };

  return { years: y, inflationRate: r, tuitionMode, onCampus: createProj(safe(raw.roomBoard.onCampus), safe(raw.otherExpense.onCampus)), offCampus: createProj(safe(raw.roomBoard.offCampus), safe(raw.otherExpense.offCampus)) };
}

export async function fetchComprehensiveCollegeCostsById(id: number): Promise<CollegeCostRaw> {
  const match = (schoolsData as any[]).find(s => s.id === id);
  if (!match) throw new Error('School not found.');
  return mapToRaw(match);
}

export async function fetchComprehensiveCollegeCosts(name: string): Promise<CollegeCostRaw> {
  const q = name.toLowerCase().trim();
  const match = (schoolsData as any[]).find(s => s.name.toLowerCase().includes(q));
  if (!match) throw new Error('School not found.');
  return mapToRaw(match);
}

export async function fetchProjectedComprehensiveCollegeCosts(input: CollegeCostInput): Promise<ComprehensiveCollegeCosts> {
  const raw = await fetchComprehensiveCollegeCosts(input.schoolName);
  return { raw, projection: projectLineItems(raw, input.years ?? 4, input.inflationRate ?? 0.03, input.tuitionMode ?? 'in_state') };
}