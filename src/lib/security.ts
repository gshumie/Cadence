import DOMPurify from 'dompurify';
import type {
  BillingCycle,
  CurrencySymbol,
  Subscription,
  SubscriptionCategory,
  SubscriptionStatus,
} from '../types/subscription';

/**
 * Resolves a working DOMPurify instance in both browser and headless Node test environments.
 */
function getPurifier(): { sanitize: (dirty: string, options?: any) => string } {
  if (typeof window !== 'undefined') {
    // Browser environment
    if (typeof (DOMPurify as any).sanitize === 'function') {
      return DOMPurify as any;
    }
    return (DOMPurify as any)(window);
  }
  // Headless / Node testing environment
  if (typeof (globalThis as any).window !== 'undefined') {
    return (DOMPurify as any)((globalThis as any).window);
  }
  // Fallback if window is not yet attached
  return {
    sanitize: (val: string) => {
      return val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/data\s*:\s*text\/html/gi, '')
        .replace(/\bon\w+\s*=/gi, '');
    },
  };
}

/**
 * Strictly sanitizes plain text inputs, stripping all HTML tags, script elements,
 * javascript/data URIs, inline handlers, and invisible control characters.
 */
export function sanitizeText(input: unknown): string {
  if (input === null || input === undefined) return '';
  const str = String(input);

  // Strip null bytes and dangerous control characters (preserve \n and \t)
  const cleanedCtrl = str.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');

  const purifier = getPurifier();
  // Strip all tags completely for strict plaintext
  const sanitized = purifier.sanitize(cleanedCtrl, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  // Additional defense against residual javascript: or data: URIs
  return sanitized
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .trim();
}

/**
 * Neutralizes CSV Formula Injection (CWE-1236 / DDE attack vectors).
 * If cell content begins with =, +, -, @, \t, \r (even after leading whitespace),
 * it prepends a single quote (') to force spreadsheet software to treat it as a literal string.
 */
export function sanitizeForCsv(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);

  // Dangerous trigger characters in Excel, Google Sheets, Calc
  const formulaTriggers = ['=', '+', '-', '@', '\t', '\r'];
  const trimmedLeft = str.trimStart();

  let safeStr = str;
  if (formulaTriggers.some((char) => trimmedLeft.startsWith(char))) {
    // Prefix with single quote
    safeStr = `'${str}`;
  }

  // RFC 4180 CSV escaping: wrap in quotes and escape internal double quotes as ""
  const escaped = safeStr.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Validates numeric subscription cost bounds: [0.01, 999,999.99].
 * Rejects NaN, Infinity, negative values, and non-numeric payloads.
 */
export function validateAmount(amount: unknown): { valid: boolean; value: number; error?: string } {
  if (typeof amount !== 'number' && typeof amount !== 'string') {
    return { valid: false, value: 0, error: 'Cost must be a valid number' };
  }

  const num = typeof amount === 'number' ? amount : parseFloat(String(amount).trim());

  if (!Number.isFinite(num)) {
    return { valid: false, value: 0, error: 'Cost must be a finite number' };
  }

  if (num < 0.01) {
    return { valid: false, value: 0, error: 'Cost must be at least $0.01' };
  }

  if (num > 999999.99) {
    return { valid: false, value: 0, error: 'Cost cannot exceed $999,999.99' };
  }

  const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
  return { valid: true, value: rounded };
}

/**
 * Validates ISO 8601 date format YYYY-MM-DD and ensures it is an actual calendar date.
 */
export function validateIsoDate(dateStr: unknown): boolean {
  if (typeof dateStr !== 'string') return false;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 1970 || year > 2100) return false;
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  return true;
}

/**
 * Validates allowed billing cycles.
 */
export function isAllowedBillingCycle(val: string): val is BillingCycle {
  return ['monthly', 'yearly', 'quarterly', 'weekly'].includes(val);
}

/**
 * Validates allowed categories.
 */
export function isAllowedCategory(val: string): val is SubscriptionCategory {
  return ['Infrastructure', 'Software', 'Media', 'Fitness', 'Utilities', 'Other'].includes(val);
}

/**
 * Validates allowed statuses.
 */
export function isAllowedStatus(val: string): val is SubscriptionStatus {
  return ['active', 'paused', 'trial'].includes(val);
}

/**
 * Validates allowed currency symbols.
 */
export function isAllowedCurrency(val: string): val is CurrencySymbol {
  return ['$', '€', '£', 'ETB', '¥', '₹', 'C$', 'A$', 'CHF'].includes(val);
}

/**
 * Deep scan for Prototype Pollution keys (__proto__, constructor, prototype).
 * Throws or rejects if any forbidden property key is detected.
 */
export function detectPrototypePollution(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false;

  // Check if prototype was hijacked
  const proto = Object.getPrototypeOf(obj);
  if (proto !== null && proto !== Object.prototype && proto !== Array.prototype) {
    return true;
  }

  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

  // Check object's own property names
  const keys = Object.getOwnPropertyNames(obj);
  for (const key of keys) {
    if (dangerousKeys.includes(key)) {
      return true;
    }
    const val = (obj as any)[key];
    if (val && typeof val === 'object') {
      if (detectPrototypePollution(val)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Recursively deep-cleans an object by stripping any prototype pollution keys.
 */
export function stripPrototypePollution<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => stripPrototypePollution(item)) as unknown as T;
  }

  const cleanObj: Record<string, any> = {};
  const dangerousKeys = new Set(['__proto__', 'constructor', 'prototype']);

  for (const [key, value] of Object.entries(obj)) {
    if (dangerousKeys.has(key)) {
      continue; // Strip hazardous prototype keys
    }
    cleanObj[key] = typeof value === 'object' && value !== null
      ? stripPrototypePollution(value)
      : value;
  }

  return cleanObj as T;
}

/**
 * Strict filename sanitization preventing directory traversal, null bytes,
 * and dangerous special characters.
 */
export function sanitizeFilename(filename: string, defaultName: string = 'cadence-export.csv'): string {
  if (!filename || typeof filename !== 'string') return defaultName;

  // Remove null bytes and path traversal
  let clean = filename
    .replace(/\0/g, '')
    .replace(/\.\.[/\\]/g, '')
    .replace(/[<>:"/\\|?*]/g, '_')
    .trim();

  // Strip Windows reserved filenames (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
  const reservedRegex = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
  if (reservedRegex.test(clean)) {
    clean = `safe_${clean}`;
  }

  if (!clean || clean.length === 0) {
    return defaultName;
  }

  // Bound filename length to 120 chars
  return clean.slice(0, 120);
}

/**
 * Validates an entire subscription object against the strict schema.
 */
export function validateSubscriptionPayload(raw: any): { valid: boolean; subscription?: Subscription; error?: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, error: 'Subscription entry must be an object' };
  }

  if (detectPrototypePollution(raw)) {
    return { valid: false, error: 'Security violation: Prototype pollution detected' };
  }

  // Name validation
  const name = sanitizeText(raw.name);
  if (!name || name.length === 0) {
    return { valid: false, error: 'Service name is required' };
  }
  if (name.length > 80) {
    return { valid: false, error: 'Service name cannot exceed 80 characters' };
  }

  // Cost validation
  const costCheck = validateAmount(raw.cost);
  if (!costCheck.valid) {
    return { valid: false, error: costCheck.error };
  }

  // Currency validation
  const currency: CurrencySymbol = isAllowedCurrency(raw.currency) ? raw.currency : '$';

  // Billing Cycle validation
  if (!isAllowedBillingCycle(raw.billingCycle)) {
    return { valid: false, error: 'Invalid billing cycle specified' };
  }

  // Category validation
  const category: SubscriptionCategory = isAllowedCategory(raw.category) ? raw.category : 'Other';

  // Status validation
  const status: SubscriptionStatus = isAllowedStatus(raw.status) ? raw.status : 'active';

  // Next Billing Date validation
  if (!validateIsoDate(raw.nextBillingDate)) {
    return { valid: false, error: 'Next billing date must be a valid date in YYYY-MM-DD format' };
  }

  // Alert lead days (1, 3, 7, 14, default 7)
  const alertLead = [1, 3, 7, 14].includes(Number(raw.alertLeadDays)) ? Number(raw.alertLeadDays) : 7;

  // Optional trial end date
  let trialEndDate: string | undefined = undefined;
  if (raw.trialEndDate && validateIsoDate(raw.trialEndDate)) {
    trialEndDate = raw.trialEndDate;
  }

  // Optional payment method
  const paymentMethod = raw.paymentMethod ? sanitizeText(raw.paymentMethod).slice(0, 50) : undefined;

  // Optional notes
  const notes = raw.notes ? sanitizeText(raw.notes).slice(0, 500) : undefined;

  // Optional cancellation url
  let cancellationUrl: string | undefined = undefined;
  if (raw.cancellationUrl && typeof raw.cancellationUrl === 'string') {
    const trimmed = raw.cancellationUrl.trim();
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      cancellationUrl = sanitizeText(trimmed).slice(0, 200);
    }
  }

  const id = typeof raw.id === 'string' && raw.id.length > 0 ? sanitizeText(raw.id) : `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const validated: Subscription = {
    id,
    name,
    cost: costCheck.value,
    currency,
    billingCycle: raw.billingCycle,
    category,
    status,
    nextBillingDate: raw.nextBillingDate,
    alertLeadDays: alertLead,
    trialEndDate,
    paymentMethod,
    notes,
    cancellationUrl,
    createdAt: typeof raw.createdAt === 'string' && raw.createdAt ? raw.createdAt : now,
    updatedAt: now,
  };

  return { valid: true, subscription: validated };
}
