import { NextResponse } from 'next/server';

// Registration is now handled exclusively through OAuth providers (Google/GitHub)
// This endpoint is disabled to enforce OAuth-only registration for better security
export async function POST() {
  return NextResponse.json(
    { 
      message: 'Direct registration is disabled. Please sign up using Google or GitHub.',
      redirectTo: '/login'
    },
    { status: 403 }
  );
}