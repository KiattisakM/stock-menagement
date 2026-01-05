import { NextRequest, NextResponse } from 'next/server';
import { deleteSessionCookie } from '@/lib/session';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  deleteSessionCookie(response);
  return response;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  deleteSessionCookie(response);
  return response;
}

