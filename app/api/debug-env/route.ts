import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT_SET',
    // Don't expose the actual secrets
    hasCorrectSecretLength: process.env.NEXTAUTH_SECRET ? process.env.NEXTAUTH_SECRET.length >= 32 : false,
  });
}
