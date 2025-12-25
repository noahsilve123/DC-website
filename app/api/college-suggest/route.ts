import { NextResponse } from 'next/server'
import schoolsData from '../../lib/college-data.json'

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('query') ?? '').trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const results = (schoolsData as any[])
    .filter(s => s.name.toLowerCase().includes(q))
    .slice(0, 10)
    .map(s => ({ id: s.id, name: s.name, city: s.city, state: s.state }));
    
  return NextResponse.json({ results });
}
