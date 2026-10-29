import type { Subscription } from '../types/subscription';
import { normalizeToMonthly, toIsoDateString } from './calculations';
import {
  detectPrototypePollution,
  sanitizeFilename,
  sanitizeForCsv,
  sanitizeText,
  stripPrototypePollution,
  validateSubscriptionPayload,
} from './security';

const MAX_IMPORT_SIZE_BYTES = 1024 * 1024; // 1 Megabyte

export interface ImportResult {
  success: boolean;
  imported: Subscription[];
  count: number;
  message: string;
  errors?: string[];
}

/**
 * Generates an RFC 4180 compliant CSV string with comprehensive Formula Injection Neutralization.
 */
export function generateCsvExport(subscriptions: Subscription[]): string {
  const headers = [
    'ID',
    'Service Name',
    'Category',
    'Cost',
    'Currency',
    'Billing Cycle',
    'Normalized Monthly Cost',
    'Next Billing Date',
    'Status',
    'Alert Lead Days',
    'Payment Method',
    'Notes',
    'Cancellation URL',
  ];

  const headerRow = headers.map((h) => `"${h}"`).join(',');

  const rows = subscriptions.map((sub) => {
    const monthlyCost = normalizeToMonthly(sub.cost, sub.billingCycle);

    const fields = [
      sanitizeForCsv(sub.id),
      sanitizeForCsv(sub.name),
      sanitizeForCsv(sub.category),
      sanitizeForCsv(sub.cost.toFixed(2)),
      sanitizeForCsv(sub.currency),
      sanitizeForCsv(sub.billingCycle),
      sanitizeForCsv(monthlyCost.toFixed(2)),
      sanitizeForCsv(sub.nextBillingDate),
      sanitizeForCsv(sub.status),
      sanitizeForCsv(sub.alertLeadDays),
      sanitizeForCsv(sub.paymentMethod || ''),
      sanitizeForCsv(sub.notes || ''),
      sanitizeForCsv(sub.cancellationUrl || ''),
    ];

    return fields.join(',');
  });

  return [headerRow, ...rows].join('\r\n');
}

/**
 * Initiates client-side file download for CSV.
 */
export function downloadCsv(subscriptions: Subscription[], filenamePrefix: string = 'cadence-ledger'): void {
  const csvContent = generateCsvExport(subscriptions);
  const dateStr = toIsoDateString(new Date());
  const safeFilename = sanitizeFilename(`${filenamePrefix}-${dateStr}.csv`);

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Initiates client-side file download for JSON backup.
 */
export function downloadJsonBackup(subscriptions: Subscription[], filenamePrefix: string = 'cadence-backup'): void {
  const safeList = stripPrototypePollution(subscriptions);
  const payload = {
    app: 'Cadence',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    itemCount: safeList.length,
    subscriptions: safeList,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const dateStr = toIsoDateString(new Date());
  const safeFilename = sanitizeFilename(`${filenamePrefix}-${dateStr}.json`);

  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports and parses a JSON file with strict size enforcement, prototype pollution protection,
 * and individual entry schema validation.
 */
export async function importJsonFile(file: File): Promise<ImportResult> {
  // Validate file size (max 1MB)
  if (file.size > MAX_IMPORT_SIZE_BYTES) {
    return {
      success: false,
      imported: [],
      count: 0,
      message: `File exceeds maximum allowed size of 1MB (${(file.size / 1024).toFixed(1)} KB uploaded).`,
    };
  }

  // Validate MIME type or file extension
  const isJsonMime = file.type === 'application/json' || file.type === 'text/json';
  const isJsonExt = file.name.toLowerCase().endsWith('.json');
  if (!isJsonMime && !isJsonExt) {
    return {
      success: false,
      imported: [],
      count: 0,
      message: 'Invalid file format. Please upload a valid .json file.',
    };
  }

  try {
    const text = await file.text();
    return parseJsonPayloadString(text);
  } catch (err: any) {
    return {
      success: false,
      imported: [],
      count: 0,
      message: `Failed to read file: ${err?.message || 'Unknown error'}`,
    };
  }
}

/**
 * Pure function to parse JSON string payload. Can be tested directly in test suite.
 */
export function parseJsonPayloadString(jsonString: string): ImportResult {
  if (jsonString.length > MAX_IMPORT_SIZE_BYTES) {
    return {
      success: false,
      imported: [],
      count: 0,
      message: 'Payload size exceeds 1MB threshold',
    };
  }

  // Pre-deserialization Prototype Pollution Guardian
  if (/"(?:__proto__|constructor|prototype)"\s*:/i.test(jsonString)) {
    return {
      success: false,
      imported: [],
      count: 0,
      message: 'Security Alert: Malicious prototype pollution detected in JSON import.',
    };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonString, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        throw new Error('Prototype pollution detected in parser reviver');
      }
      return value;
    });
  } catch (err: any) {
    if (err?.message?.includes('Prototype pollution')) {
      return {
        success: false,
        imported: [],
        count: 0,
        message: 'Security Alert: Malicious prototype pollution detected in JSON import.',
      };
    }
    return {
      success: false,
      imported: [],
      count: 0,
      message: 'Invalid JSON syntax. Unable to parse payload.',
    };
  }

  // Deep prototype pollution scan
  if (detectPrototypePollution(parsed)) {
    return {
      success: false,
      imported: [],
      count: 0,
      message: 'Security Alert: Malicious prototype pollution detected in JSON import.',
    };
  }

  // Normalize array input or backup structure
  const rawList: any[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.subscriptions)
    ? parsed.subscriptions
    : [];

  if (rawList.length === 0) {
    return {
      success: false,
      imported: [],
      count: 0,
      message: 'No valid subscription entries found in backup file.',
    };
  }

  const validEntries: Subscription[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rawList.length; i++) {
    const rawItem = stripPrototypePollution(rawList[i]);
    const validation = validateSubscriptionPayload(rawItem);
    if (validation.valid && validation.subscription) {
      validEntries.push(validation.subscription);
    } else {
      errors.push(`Row ${i + 1}: ${validation.error || 'Invalid format'}`);
    }
  }

  if (validEntries.length === 0) {
    return {
      success: false,
      imported: [],
      count: 0,
      message: 'All entries failed validation checks.',
      errors,
    };
  }

  return {
    success: true,
    imported: validEntries,
    count: validEntries.length,
    message: `Successfully verified and imported ${validEntries.length} subscription${validEntries.length === 1 ? '' : 's'}.`,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Simple, robust CSV parser for imported files.
 */
export function parseCsvPayloadString(csvString: string): ImportResult {
  if (csvString.length > MAX_IMPORT_SIZE_BYTES) {
    return {
      success: false,
      imported: [],
      count: 0,
      message: 'CSV file size exceeds 1MB limit',
    };
  }

  const lines = csvString.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      success: false,
      imported: [],
      count: 0,
      message: 'CSV does not contain sufficient rows.',
    };
  }

  // Parse header
  const parseRow = (line: string): string[] => {
    const fields: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    return fields;
  };

  const header = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const validEntries: Subscription[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length === 0) continue;

    const rowObj: Record<string, string> = {};
    for (let h = 0; h < header.length; h++) {
      let val = row[h] || '';
      // Strip leading formula escape quote if present
      if (val.startsWith("'")) {
        val = val.substring(1);
      }
      rowObj[header[h]] = val;
    }

    const name = sanitizeText(rowObj.servicename || rowObj.name || rowObj.service || '');
    const costRaw = parseFloat(rowObj.cost || rowObj.price || rowObj.amount || '0');
    const cycle = (rowObj.billingcycle || rowObj.cycle || 'monthly').toLowerCase();
    const category = rowObj.category || 'Other';
    const nextDate = rowObj.nextbillingdate || rowObj.nextrenewaldate || rowObj.date || toIsoDateString(new Date());
    const status = (rowObj.status || 'active').toLowerCase();
    const currency = rowObj.currency || '$';
    const notes = rowObj.notes || '';
    const payment = rowObj.paymentmethod || rowObj.payment || '';

    const validation = validateSubscriptionPayload({
      name,
      cost: costRaw,
      currency,
      billingCycle: cycle,
      category,
      status,
      nextBillingDate: nextDate,
      alertLeadDays: 7,
      paymentMethod: payment,
      notes,
    });

    if (validation.valid && validation.subscription) {
      validEntries.push(validation.subscription);
    } else {
      errors.push(`Row ${i}: ${validation.error || 'Failed schema validation'}`);
    }
  }

  if (validEntries.length === 0) {
    return {
      success: false,
      imported: [],
      count: 0,
      message: 'Failed to extract valid subscription records from CSV.',
      errors,
    };
  }

  return {
    success: true,
    imported: validEntries,
    count: validEntries.length,
    message: `Successfully imported ${validEntries.length} subscriptions from CSV.`,
    errors: errors.length > 0 ? errors : undefined,
  };
}
