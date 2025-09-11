import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DebugPage() {
  const session = await auth();
  
  // Only allow access in development
  if (process.env.NODE_ENV === 'production') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>NODE_ENV: {process.env.NODE_ENV}</div>
            <div>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || 'NOT SET'}</div>
            <div>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET'}</div>
            <div>DATABASE_URL: {process.env.DATABASE_URL ? 'SET' : 'NOT SET'}</div>
            <div>GOOGLE_CLIENT_ID: {process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET'}</div>
            <div>GOOGLE_CLIENT_SECRET: {process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET'}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Information</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current URL</h2>
          <div className="font-mono text-sm">
            {typeof window !== 'undefined' ? window.location.href : 'Server-side render'}
          </div>
        </div>
      </div>
    </div>
  );
}
