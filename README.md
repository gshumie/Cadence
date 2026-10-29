# Cadence

> **Precision Recurring Expense & Subscription Ledger**  
> High-craft, Swiss-grid financial software architected with Linear and Bloomberg terminal precision.

---

## 1. Executive Overview

**Cadence** is an offline-first, high-density recurring expense and subscription tracking ledger. It normalizes disparate billing periods (monthly, yearly, quarterly, weekly) into an exact **Normalized Monthly Burn Rate** and **Projected Annual Run Rate**, surfaces actionable 7-day renewal countdown alerts, visualizes cashflow schedules, and enforces a strict defense-in-depth application security posture.

---

## 2. Core Architectural Features

### 🏛️ Flush Split-Pane Ledger & Swiss-Grid Design
- **Zero Decorative Fluff:** Built strictly using solid surface tokens (Deep Carbon `#0D0F12`, Elevated Surface `#14171C`, Hairline Borders `#22262F`, Primary Text `#F3F4F6`, Muted Text `#8E95A2`).
- **Primary Typographic Financial Header:** Monthly Burn Rate rendered in large, tabular monospace numerals (`clamp(1.75rem, 3vw, 2.5rem)`, `font-variant-numeric: tabular-nums`) flanked by subordinate metadata for Annual Run Rate, Active Ledger Count, and 7-Day Due Total.
- **Renewal Alert Strip:** High-contrast inline alert banner highlighting active subscriptions renewing within 7 days (e.g. `Due in 2 days`) and trial expirations.
- **Category Breakdown Proportion Bar:** Single flush horizontal stacked bar (`8px` height) detailing spending distribution across `Infrastructure`, `Software`, `Media`, `Fitness`, `Utilities`, and `Other`.
- **Dual Presentation Views:** High-density Tabular Ledger and 30-Day Chronological Cashflow Schedule.
- **Right-Hand Quick-Entry & Inspector Drawer:** Keyboard-first input panel (`Ctrl+Enter` to save, `Escape` to close) with instant quick-fill presets for popular tech services, live calculation preview, and cancellation portal URLs.

### 🧮 Financial Normalization & Calendar Advancement Engine
- **Period Normalization:**
  - Yearly: `cost / 12`
  - Quarterly: `cost / 3`
  - Weekly: `(cost * 52) / 12`
  - Exact IEEE 754 floating-point drift protection with 2 decimal place cent precision.
- **Auto-Advance Calendar Engine:** If an entry's renewal date has passed, the calculation engine dynamically advances it to the next valid calendar occurrence (preserving anchor days of the month).

### 💾 Safe Local Persistence & Data Portability
- **Storage:** Persisted locally in `localStorage` with runtime schema validation.
- **Export Formats:** Clean RFC 4180 `.csv` and full state backup `.json`.
- **Import Capabilities:** Drag-and-drop file upload supporting `.json` and `.csv` with size checks (< 1MB) and prototype pollution neutralization.

---

## 3. Security, Hygiene & Hardening Matrix

| Security Domain | Mitigation Mechanism | Verification Test |
| :--- | :--- | :--- |
| **XSS Prevention** | Inputs sanitized via DOMPurify, stripping `<script>`, `<iframe>`, `<object>`, inline `on*` event handlers, and `javascript:` URIs | `npm run test:security` (Section 1) |
| **CSV Formula Injection (CWE-1236 / DDE)** | Cells beginning with `=`, `+`, `-`, `@`, `\t`, or `\r` are prefixed with `'` to prevent spreadsheet command execution | `npm run test:security` (Section 2) |
| **Prototype Pollution** | Deep scan and rejection of `__proto__`, `constructor`, and `prototype` keys during JSON deserialization | `npm run test:security` (Section 3) |
| **Numeric Overflow / Underflow** | Strict validation restricting amounts to `[0.01, 999999.99]`, rejecting `NaN`, `Infinity`, and negative values | `npm run test:security` (Section 4) |
| **Path Traversal & Filesystem** | Filenames sanitized against `../`, null bytes `\0`, and Windows reserved names (`CON`, `PRN`, `AUX`, `NUL`) | `npm run test:security` (Section 5) |
| **File Upload Enforcement** | 1MB hard payload limit and strict MIME/extension allowlist | `npm run test:security` (Section 6) |
| **Production Debug Disabling** | `esbuild`/compiler stripping console logging and debugger statements in production builds | `npm run build` |
| **Security Headers (`vercel.json`)** | Strict CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` | Security Header Audit |

---

## 4. Verification & Testing

### Automated Security Test Suite
Cadence includes an automated security test suite covering 36 critical security test vectors:

```bash
npm run test:security
```

Expected output:
```
============================================================
 RESULTS: 36 / 36 Security Test Vectors PASSED (100%)
 ZERO VULNERABILITIES DETECTED
============================================================
```

### Production Build Verification
```bash
npm run build
```

---

## 5. Technology Stack
- **Runtime & UI:** React 19, TypeScript
- **Toolchain & Bundler:** Vite 8, Tailwind CSS v4
- **Security:** DOMPurify, JSDOM (for CI test harness)
- **Icons & Typography:** Lucide React, Inter, JetBrains Mono

---

## 6. License
MIT License. Crafted for precision financial accounting and security excellence.
