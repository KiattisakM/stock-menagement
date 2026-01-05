import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'stock-session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  userId: number;
  email: string;
  name: string;
  role: string;
}

export async function createSession(userId: number, email: string, name: string, role: string) {
  const sessionData: SessionData = { userId, email, name, role };
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    return JSON.parse(sessionCookie.value) as SessionData;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// For API routes (using NextRequest)
export function getSessionFromRequest(request: NextRequest): SessionData | null {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    return JSON.parse(sessionCookie.value) as SessionData;
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, sessionData: SessionData) {
  response.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  
  return response;
}

export function deleteSessionCookie(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

