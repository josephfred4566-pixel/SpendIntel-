import { AuthSession, AuthUser, CompanyType, UserRole } from '../types';

const STORAGE_KEYS = {
  SESSION: 'spendintel_auth_session_v1',
  HAS_ONBOARDED: 'spendintel_has_onboarded_v1',
  REGISTERED_USERS: 'spendintel_registered_users_v1',
};

// Seed demo users for each company type tier
export const DEMO_USERS: (AuthUser & { passwordHash: string })[] = [
  {
    id: 'usr-corp-001',
    name: 'Joseph Frederick',
    email: 'joseph@spendintel.corp',
    role: 'Financial Controller',
    title: 'Head of Global Financial Operations & Treasury',
    department: 'Finance',
    phoneNumber: '+1 (415) 555-0192',
    bio: 'Oversees multi-entity corporate treasury consolidation, GAAP audit readiness, and SOX 404 compliance.',
    location: 'San Francisco, CA (HQ)',
    companyName: 'SpendIntel Global Technologies, Inc.',
    companyType: 'Corporate',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    passwordHash: 'spendintel2026',
  },
  {
    id: 'usr-ent-002',
    name: 'Elena Vance',
    email: 'elena.vance@vance-enterprises.com',
    role: 'VP of Finance',
    title: 'Vice President of Finance & Strategic Planning',
    department: 'Executive',
    phoneNumber: '+1 (212) 555-0144',
    bio: 'Lead finance executive managing enterprise procurement controls, budget variances, and multi-currency ERP feeds.',
    location: 'New York, NY',
    companyName: 'Vance Strategic Enterprises Ltd.',
    companyType: 'Enterprise',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    passwordHash: 'spendintel2026',
  },
  {
    id: 'usr-smb-003',
    name: 'Sarah Chen',
    email: 'sarah@acme-design.studio',
    role: 'Corporate Accountant',
    title: 'Lead Financial Accountant & Operations Manager',
    department: 'Operations',
    phoneNumber: '+1 (206) 555-0188',
    bio: 'Manages automated receipt capture, vendor billings, and live QuickBooks general ledger reconciliation.',
    location: 'Seattle, WA',
    companyName: 'Acme Design & Media Labs',
    companyType: 'Small Business',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    passwordHash: 'spendintel2026',
  },
];

/**
 * Retrieve active authentication session from localStorage
 */
export function getStoredAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed && parsed.user && parsed.token) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('[SpendIntel Auth] Failed to parse session:', err);
    return null;
  }
}

/**
 * Persist active session to localStorage
 */
export function persistAuthSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    // Synchronize onboarding state
    window.localStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, JSON.stringify(session.hasOnboarded));
  } catch (err) {
    console.error('[SpendIntel Auth] Failed to save session:', err);
  }
}

/**
 * Terminate session / Log out
 */
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch (err) {
    console.error('[SpendIntel Auth] Failed to clear session:', err);
  }
}

/**
 * Check if the active user or browser has completed onboarding
 */
export function getHasOnboarded(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const session = getStoredAuthSession();
    if (session && typeof session.hasOnboarded === 'boolean') {
      return session.hasOnboarded;
    }
    const raw = window.localStorage.getItem(STORAGE_KEYS.HAS_ONBOARDED);
    return raw ? JSON.parse(raw) : false;
  } catch {
    return false;
  }
}

/**
 * Set and persist onboarding completion flag
 */
export function setHasOnboarded(hasOnboarded: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.HAS_ONBOARDED, JSON.stringify(hasOnboarded));
    const session = getStoredAuthSession();
    if (session) {
      session.hasOnboarded = hasOnboarded;
      persistAuthSession(session);
    }
  } catch (err) {
    console.error('[SpendIntel Auth] Failed to save onboarding status:', err);
  }
}

/**
 * Get registered user pool (demo accounts + newly registered)
 */
function getStoredUsers(): (AuthUser & { passwordHash: string })[] {
  if (typeof window === 'undefined') return DEMO_USERS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(DEMO_USERS));
      return DEMO_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEMO_USERS;
  }
}

function saveRegisteredUsers(users: (AuthUser & { passwordHash: string })[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
  } catch (err) {
    console.error('[SpendIntel Auth] Failed to save user registry:', err);
  }
}

/**
 * Authenticate User (Sign In) via Server API with spendintel_db.json verification
 */
export async function authenticateUser(
  emailInput: string,
  passwordInput: string,
  selectedCompanyType?: CompanyType
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  const cleanEmail = emailInput.trim().toLowerCase();

  const urlsToTry = [
    '/api/v1/auth/login',
    'http://localhost:3000/api/v1/auth/login'
  ];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: passwordInput,
          companyType: selectedCompanyType
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Invalid credentials. Access denied.'
        };
      }

      const user = data.user;
      const session: AuthSession = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'Financial Controller',
          companyName: user.companyName,
          companyType: selectedCompanyType || user.companyType || 'Enterprise',
          title: user.title,
          department: user.department
        },
        token: data.token,
        createdAt: new Date().toISOString(),
        hasOnboarded: getHasOnboarded(),
        rememberMe: true,
      };

      persistAuthSession(session);
      return { success: true, session };
    } catch (err) {
      console.warn(`Login endpoint ${url} unreachable:`, err);
    }
  }

  return {
    success: false,
    error: 'Could not connect to authentication server. Please ensure the backend server is running.'
  };
}

/**
 * Register New Account via Server API with spendintel_db.json persistence
 */
export async function registerAccount(
  fullName: string,
  email: string,
  password: string,
  companyName: string,
  companyType: CompanyType,
  role: UserRole = 'Financial Controller'
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!fullName.trim()) return { success: false, error: 'Full name is required.' };
  if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Valid work email address is required.' };
  if (!password || password.length < 4) return { success: false, error: 'Password must be at least 4 characters long.' };
  if (!companyType) return { success: false, error: 'Account company type classification is mandatory.' };

  const urlsToTry = [
    '/api/v1/auth/register',
    'http://localhost:3000/api/v1/auth/register'
  ];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: cleanEmail,
          password: password,
          companyName: companyName.trim() || `${fullName.trim()}'s Holdings`,
          companyType: companyType,
          role: role
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Registration failed. Please check all required fields.'
        };
      }

      const user = data.user;
      const session: AuthSession = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || role,
          companyName: user.companyName,
          companyType: user.companyType,
        },
        token: data.token,
        createdAt: new Date().toISOString(),
        hasOnboarded: false, // New registrations trigger onboarding flow
        rememberMe: true,
      };

      persistAuthSession(session);
      return { success: true, session };
    } catch (err) {
      console.warn(`Registration endpoint ${url} unreachable:`, err);
    }
  }

  return {
    success: false,
    error: 'Could not connect to registration server. Please ensure the backend server is running.'
  };
}

/**
 * Update Current Active User Profile
 */
export function updateUserProfileSession(updatedFields: Partial<AuthUser>): { success: boolean; session: AuthSession | null; error?: string } {
  const currentSession = getStoredAuthSession();
  if (!currentSession || !currentSession.user) {
    return { success: false, session: null, error: 'No active session found.' };
  }

  // Merge updated fields
  const updatedUser: AuthUser = {
    ...currentSession.user,
    ...updatedFields,
  };

  // Update session
  const updatedSession: AuthSession = {
    ...currentSession,
    user: updatedUser,
  };

  // Persist session
  persistAuthSession(updatedSession);

  // Update in registered users database
  try {
    const users = getStoredUsers();
    const index = users.findIndex(u => u.id === updatedUser.id || u.email.toLowerCase() === updatedUser.email.toLowerCase());
    if (index >= 0) {
      users[index] = {
        ...users[index],
        ...updatedUser,
      };
      saveRegisteredUsers(users);
    }
  } catch (err) {
    console.warn('[SpendIntel Auth] Failed to update user database:', err);
  }

  return { success: true, session: updatedSession };
}
