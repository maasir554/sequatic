import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        onboarded: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      sessionUser: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        onboarded: session.user.onboarded
      },
      dbUser,
      match: session.user.onboarded === dbUser?.onboarded
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal error", details: error }, { status: 500 });
  }
}
