import { AccessVerification } from '@/types';

const ACCESS_CODE_KEY = 'voicenote_access_verified';
const VERIFICATION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function verifyAccessCode(code: string): boolean {
  const expectedCode = process.env.ACCESS_CODE;
  
  if (!expectedCode) {
    console.warn('ACCESS_CODE environment variable not set');
    return false;
  }
  
  return code === expectedCode;
}

export function setAccessVerification(): void {
  if (typeof window === 'undefined') return;
  
  const verification: AccessVerification = {
    isAuthenticated: true,
    timestamp: Date.now(),
  };
  
  localStorage.setItem(ACCESS_CODE_KEY, JSON.stringify(verification));
}

export function getAccessVerification(): AccessVerification | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(ACCESS_CODE_KEY);
    if (!stored) return null;
    
    const verification: AccessVerification = JSON.parse(stored);
    
    // Check if verification has expired
    if (Date.now() - verification.timestamp > VERIFICATION_DURATION) {
      localStorage.removeItem(ACCESS_CODE_KEY);
      return null;
    }
    
    return verification;
  } catch (error) {
    console.error('Error reading access verification:', error);
    localStorage.removeItem(ACCESS_CODE_KEY);
    return null;
  }
}

export function clearAccessVerification(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_CODE_KEY);
}

export function isAuthenticated(): boolean {
  const verification = getAccessVerification();
  return verification?.isAuthenticated || false;
}