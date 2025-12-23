import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createApiResponse } from '@/lib/validation';
import { z } from 'zod';

const setupPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = setupPasswordSchema.parse(body);

    // Find and validate token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Invalid or expired token'),
        { status: 400 }
      );
    }

    if (resetToken.used) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Token has already been used'),
        { status: 400 }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        createApiResponse(false, null, '', 'Token has expired'),
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await auth.hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Generate tokens for auto-login
    const accessToken = auth.generateToken({
      userId: resetToken.user.id,
      email: resetToken.user.email,
    });

    const refreshToken = auth.generateRefreshToken({
      userId: resetToken.user.id,
      email: resetToken.user.email,
    });

    // Store session
    await auth.createSession(resetToken.user.id, accessToken);

    return NextResponse.json(
      createApiResponse(
        true,
        {
          accessToken,
          refreshToken,
          user: {
            id: resetToken.user.id,
            email: resetToken.user.email,
            firstName: resetToken.user.firstName,
            lastName: resetToken.user.lastName,
          },
        },
        'Password set up successfully'
      )
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createApiResponse(false, null, '', error.errors[0].message),
        { status: 400 }
      );
    }

    console.error('Setup password error:', error);
    return NextResponse.json(
      createApiResponse(false, null, '', 'Failed to set up password'),
      { status: 500 }
    );
  }
}
