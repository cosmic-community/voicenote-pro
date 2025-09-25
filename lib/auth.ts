import { AccessVerification } from '@/types';

const ACCESS_CODE_KEY = 'voicenote_access_verified';
const VERIFICATION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function verifyAccessCode(code: string): boolean {
  // This function should only be used server-side
  if (typeof window !== 'undefined') {
    console.warn('verifyAccessCode should not be called on client side');
    return false;
  }
  
  const expectedCode = process.env.ACCESS_CODE;
  
  if (!expectedCode) {
    console.warn('ACCESS_CODE environment variable not set');
    return false;
  }
  
  return code === expectedCode;
}

export function setAccessVerification(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const verification: AccessVerification = {
      isAuthenticated: true,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(ACCESS_CODE_KEY, JSON.stringify(verification));
  } catch (error) {
    console.error('Error setting access verification:', error);
  }
}

export function getAccessVerification(): AccessVerification | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(ACCESS_CODE_KEY);
    if (!stored) return null;
    
    const verification: AccessVerification = JSON.parse(stored);
    
    // Validate the verification object structure
    if (!verification || typeof verification.isAuthenticated !== 'boolean' || typeof verification.timestamp !== 'number') {
      localStorage.removeItem(ACCESS_CODE_KEY);
      return null;
    }
    
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
  
  try {
    localStorage.removeItem(ACCESS_CODE_KEY);
  } catch (error) {
    console.error('Error clearing access verification:', error);
  }
}

export function isAuthenticated(): boolean {
  try {
    const verification = getAccessVerification();
    return verification?.isAuthenticated || false;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}