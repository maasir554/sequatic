import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    console.log('🔍 Testing auth session...');
    
    const session = await auth();
    
    console.log('🔐 Current session:', {
      user: session?.user,
      expires: session?.expires,
    });
    
    return NextResponse.json({
      success: true,
      session: session,
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
