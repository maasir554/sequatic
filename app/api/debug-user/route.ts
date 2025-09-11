import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    // Get all users from database
    const allUsers = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true
      }
    });

    return NextResponse.json({
      session,
      allUsers,
      totalUsers: allUsers.length
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal error", details: error }, { status: 500 });
  }
}
