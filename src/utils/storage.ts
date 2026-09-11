import { Expense, ActivityLogEntry, CompanyProfileData, AppPreferences, CategoryDefinition } from '../types';
import { INITIAL_EXPENSES, DEFAULT_CATEGORIES } from '../data/initialExpenses';

// LocalStorage Storage Keys with Versioning for Zero-Loss Guarantee
const STORAGE_KEYS = {
  EXPENSES: 'spendintel_corporate_expenses_v1',
  CURRENCY: 'spendintel_active_currency_v1',
  CATEGORIES: 'spendintel_smart_categories_v1',
  ACTIVITY_LOGS: 'spendintel_user_activity_logs_v1',
  COMPANY_PROFILE: 'spendintel_company_profile_v1',
  PREFERENCES: 'spendintel_app_preferences_v1',
  THEME: 'spendintel_theme_mode_v1',
  LAST_SAVED: 'spendintel_last_persisted_v1',
};

export const DEFAULT_COMPANY_PROFILE: CompanyProfileData = {
  companyName: 'SpendIntel Global Technologies, Inc.',
  legalEntity: 'SpendIntel Inc. (Delaware C-Corp)',
  taxId: 'US-EIN-88492019',
  fiscalYearEnd: 'December 31',
  defaultCurrency: 'USD',
  accountingStandard: 'US_GAAP',
  lastUpdated: new Date().toISOString(),
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  autoReconcile: true,
  receiptUploadRequirement: 50,
  strictPerDiem: true,
  activeCurrencyCode: 'USD',
  auditStrictness: 'high',
  theme: 'light',
};

export const INITIAL_ACTIVITY_LOGS: ActivityLogEntry[] = [
  {
    id: 'log-init-001',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    displayTime: '4 hours ago',
    actionType: 'REAUDIT_EXECUTED',
    actor: 'Compliance Engine (SOC2 v2.4)',
    title: 'Autonomous Audit Engine Initialized',
    details: 'Scanned 14 initial ledger items against corporate spend guidelines and IRS per-diem rules.',
    severity: 'success',
  },
  {
    id: 'log-init-002',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    displayTime: '2 hours ago',
    actionType: 'INTEGRATION_SYNC',
    actor: 'QuickBooks Online Sync Hook',
    title: 'Chart of Accounts (COA) Synchronized',
    details: 'General ledger account mappings verified for Engineering, Sales, Marketing, and Operations.',
    severity: 'normal',
  },
];

// Helper to format timestamps human-readably
function formatDisplayTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Safe storage wrapper
function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[SpendIntel Storage] Failed to parse stored item for key "${key}":`, error);
    return defaultValue;
  }
}

function setLocalStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
    return true;
  } catch (error) {
    console.error(`[SpendIntel Storage] Failed to persist key "${key}" to localStorage:`, error);
    return false;
  }
}

/**
 * 1. EXPENSES PERSISTENCE
 */
export function loadExpenses(): Expense[] {
  const stored = getLocalStorageItem<Expense[] | null>(STORAGE_KEYS.EXPENSES, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  // Initialize with initial expenses and persist
  setLocalStorageItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  return INITIAL_EXPENSES;
}

export function saveExpenses(expenses: Expense[]): void {
  setLocalStorageItem(STORAGE_KEYS.EXPENSES, expenses);
}

/**
 * 2. CURRENCY PERSISTENCE
 */
export function loadCurrency(): string {
  return getLocalStorageItem<string>(STORAGE_KEYS.CURRENCY, 'USD');
}

export function saveCurrency(currencyCode: string): void {
  setLocalStorageItem(STORAGE_KEYS.CURRENCY, currencyCode.toUpperCase());
}

/**
 * 3. SMART CATEGORIES & LABELS PERSISTENCE
 */
export function loadCategories(): CategoryDefinition[] {
  const stored = getLocalStorageItem<CategoryDefinition[] | null>(STORAGE_KEYS.CATEGORIES, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  setLocalStorageItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: CategoryDefinition[]): void {
  setLocalStorageItem(STORAGE_KEYS.CATEGORIES, categories);
}

/**
 * 4. ACTIVITY & AUDIT LOGS PERSISTENCE
 */
export function loadActivityLogs(): ActivityLogEntry[] {
  const stored = getLocalStorageItem<ActivityLogEntry[] | null>(STORAGE_KEYS.ACTIVITY_LOGS, null);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored;
  }
  setLocalStorageItem(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
  return INITIAL_ACTIVITY_LOGS;
}

export function saveActivityLogs(logs: ActivityLogEntry[]): void {
  // Keep up to 250 most recent logs for optimal storage
  const trimmed = logs.slice(0, 250);
  setLocalStorageItem(STORAGE_KEYS.ACTIVITY_LOGS, trimmed);
}

export function appendActivityLog(
  logInput: Omit<ActivityLogEntry, 'id' | 'timestamp' | 'displayTime'>
): ActivityLogEntry {
  const now = new Date();
  const newEntry: ActivityLogEntry = {
    ...logInput,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    displayTime: 'Just now',
  };

  const existingLogs = loadActivityLogs();
  const updatedLogs = [newEntry, ...existingLogs];
  saveActivityLogs(updatedLogs);
  return newEntry;
}

/**
 * 4. COMPANY PROFILE PERSISTENCE
 */
export function loadCompanyProfile(): CompanyProfileData {
  return getLocalStorageItem<CompanyProfileData>(STORAGE_KEYS.COMPANY_PROFILE, DEFAULT_COMPANY_PROFILE);
}

export function saveCompanyProfile(profile: CompanyProfileData): void {
  setLocalStorageItem(STORAGE_KEYS.COMPANY_PROFILE, {
    ...profile,
    lastUpdated: new Date().toISOString(),
  });
}

/**
 * 5. PREFERENCES & THEME PERSISTENCE
 */
export function loadPreferences(): AppPreferences {
  return getLocalStorageItem<AppPreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
}

export function savePreferences(prefs: AppPreferences): void {
  setLocalStorageItem(STORAGE_KEYS.PREFERENCES, prefs);
}

export function loadThemeMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const storedTheme = window.localStorage.getItem(STORAGE_KEYS.THEME);
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }
  const prefs = loadPreferences();
  return prefs.theme || 'light';
}

export function saveThemeMode(theme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.THEME, theme);
  applyThemeToDOM(theme);
}

export function applyThemeToDOM(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * 6. METADATA & BACKUP / RESTORE
 */
export function getLastSavedTimestamp(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
}

export function resetAllDataToDefaults(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    window.localStorage.removeItem(STORAGE_KEYS.CURRENCY);
    window.localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    window.localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOGS);
    window.localStorage.removeItem(STORAGE_KEYS.COMPANY_PROFILE);
    window.localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    window.localStorage.removeItem(STORAGE_KEYS.LAST_SAVED);

    // Re-seed default values
    saveExpenses(INITIAL_EXPENSES);
    saveCurrency('USD');
    saveCategories(DEFAULT_CATEGORIES);
    saveActivityLogs(INITIAL_ACTIVITY_LOGS);
    saveCompanyProfile(DEFAULT_COMPANY_PROFILE);
    savePreferences(DEFAULT_PREFERENCES);
  } catch (error) {
    console.error('[SpendIntel Storage] Reset failed:', error);
  }
}

export function exportAllStateAsJSON(): string {
  const payload = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    companyProfile: loadCompanyProfile(),
    preferences: loadPreferences(),
    currency: loadCurrency(),
    categories: loadCategories(),
    expenses: loadExpenses(),
    activityLogs: loadActivityLogs(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importStateFromJSON(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid JSON data payload.' };
    }

    if (Array.isArray(data.expenses)) {
      saveExpenses(data.expenses);
    }
    if (typeof data.currency === 'string') {
      saveCurrency(data.currency);
    }
    if (Array.isArray(data.categories)) {
      saveCategories(data.categories);
    }
    if (Array.isArray(data.activityLogs)) {
      saveActivityLogs(data.activityLogs);
    }
    if (data.companyProfile && typeof data.companyProfile === 'object') {
      saveCompanyProfile(data.companyProfile);
    }
    if (data.preferences && typeof data.preferences === 'object') {
      savePreferences(data.preferences);
    }

    return { success: true, message: 'Successfully restored all ledger transactions, categories, company data, and logs.' };
  } catch (err: any) {
    return { success: false, message: `Backup restoration failed: ${err?.message || 'Unknown parsing error'}` };
  }
}
