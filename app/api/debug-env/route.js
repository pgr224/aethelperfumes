import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const envKeys = Object.keys(process.env);
  const hasDB = !!process.env.DB;
  const dbType = typeof process.env.DB;
  
  return NextResponse.json({
    envKeys,
    hasDB,
    dbType,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    NODE_ENV: process.env.NODE_ENV
  });
}
