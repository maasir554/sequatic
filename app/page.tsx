import { auth } from "@/lib/auth";
import { LandingPage } from "@/components/LandingPage";
import { AppInterface } from "@/components/AppInterface";

export default async function Home() {
  const session = await auth();
  
  // If user is authenticated and onboarded, show app interface
  if (session?.user) {
    return <AppInterface />;
  }
  
  // Otherwise show landing page
  return <LandingPage />;
}
