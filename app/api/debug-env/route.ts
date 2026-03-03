import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL || 'NOT_SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT_SET',
    // Don't expose the actual secrets
    hasCorrectSecretLength: process.env.AUTH_SECRET ? process.env.AUTH_SECRET.length >= 32 : false,
  });
}
