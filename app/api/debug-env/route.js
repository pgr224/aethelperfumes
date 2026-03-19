import { NextResponse } from 'next/server';



export async function GET() {
  return new Response("Debug Route is Active", { status: 200 });
}
