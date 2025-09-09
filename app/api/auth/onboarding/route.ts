import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { hash } from 'bcrypt';
import type { User } from '@prisma/client';

// Extended user type that includes onboarded field
type ExtendedUser = User & {
  onboarded: boolean;
};

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { username, password } = await req.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Sanitize username
    const sanitizedUsername = username.trim();

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Add robust validation for username
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(sanitizedUsername)) {
      return NextResponse.json(
        {
          message: 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores.',
        },
        { status: 400 }
      );
    }

    // Check if user is already onboarded
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!currentUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const extendedCurrentUser = currentUser as ExtendedUser;
    if (extendedCurrentUser.onboarded) {
      return NextResponse.json(
        { message: 'User is already onboarded' },
        { status: 400 }
      );
    }

    // Check if username is already taken (case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: { 
        username: {
          equals: sanitizedUsername.toLowerCase(),
          mode: 'insensitive'
        },
        NOT: {
          id: session.user.id
        }
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Update user with username, password, and mark as onboarded
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: sanitizedUsername,
        hashedPassword,
        onboarded: true,
      },
    }) as ExtendedUser;

    return NextResponse.json(
      { 
        message: 'Onboarding completed successfully',
        user: updatedUser
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}