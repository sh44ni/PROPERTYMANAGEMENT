import { NextRequest, NextResponse } from 'next/server';
import { getAppConfig, setAppMode } from '@/lib/server/appConfig';
import { seedDemoDataIfEmpty } from '@/lib/server/demoSeed';

export async function POST(_request: NextRequest) {
  const cfg = await getAppConfig();
  if (cfg.mode === 'live') {
    return NextResponse.json({ error: 'Already activated' }, { status: 409 });
  }

  await setAppMode('demo');
  const seed = await seedDemoDataIfEmpty();

  return NextResponse.json({ data: { mode: 'demo', seed } });
}

