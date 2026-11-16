# Cadence

<div align="center">

### Precision Recurring Expense & Subscription Ledger

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cadence--ledger.vercel.app-10B981?style=for-the-badge&logo=vercel&logoColor=white)](https://cadence-ledger.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-38BDF8?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Security Hardened](https://img.shields.io/badge/Security-Hardened%20(36%2F36)-10B981?style=for-the-badge&logo=shield)](scripts/test-security.ts)

<br />

**[🚀 Launch Live Application: cadence-ledger.vercel.app](https://cadence-ledger.vercel.app)**

*A high-craft, offline-first financial ledger designed with Swiss-grid precision, Bloomberg-inspired typography, and hardened application security.*

</div>

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. Key Features](#2-key-features)
- [3. Data Security & Portability (CWE-1236 Guardrails)](#3-data-security--portability-cwe-1236-guardrails)
- [4. Architectural Highlights & Financial Engine](#4-architectural-highlights--financial-engine)
- [5. Tech Stack](#5-tech-stack)
- [6. Getting Started & Local Development](#6-getting-started--local-development)
- [7. Verification & Automated Security Suite](#7-verification--automated-security-suite)
- [8. Production Deployment](#8-production-deployment)
- [9. Author & License](#9-author--license)

---

## 1. Overview

**Cadence** is an offline-first, high-density subscription ledger engineered for developers, finance teams, and power users who require absolute precision over their recurring burn rates. Rather than relying on generic consumer finance dashboards with floating cards and decorative gradients, Cadence implements a disciplined, Swiss-grid financial interface inspired by the typography and density of Bloomberg terminals and Linear.

![Cadence Financial Ledger Dashboard](image_7.png)

### The Primary Financial Command Deck

As visualized in the dashboard above (**image_7.png**), Cadence opens immediately into your live ledger without welcome filler or onboarding noise:

1. **Normalized Monthly Burn Rate:** The dominant typographic metric rendered in large, tabular monospace numerals (`font-variant-numeric: tabular-nums`) accompanied by a live pulse badge. Every disparate billing cycle is normalized to an exact monthly figure.
2. **Projected Annual Run Rate:** Real-time annualized projection (`$ / yr`), providing instant clarity on long-term capital outflow.
3. **Active Ledger Items Counter:** Real-time tally of active subscriptions, alongside immediate indicators for paused licenses and free trials.
4. **7-Day Upcoming Renewals & Alert Strip:** High-contrast ambient monitor showing total capital due within a rolling 7-day window. The inline alert banner highlights critical billing checkpoints (e.g., *Due in 2 days*, *Due tomorrow*), enabling proactive cancellations before cards are charged.
5. **System Integrity Status:** An immutable `INTEGRITY: HARDENED` badge certifying that all client-side validation, sanitization, and security guardrails are operational.
6. **Detailed Subscription Ledger:** A flush, sortable tabular ledger displaying service details with high contextual fidelity:
   - **GitHub Copilot Enterprise:** License tier information, billing cycle, Amex corporate payment card reference, and days remaining.
   - **Spotify Premium Family:** Media streaming distribution with PayPal payment tagging and renewal countdown.
   - **Adobe Creative Cloud All Apps:** Paused subscription handling with muted state styling, preventing paused services from corrupting active burn rates.
   - **Vercel Pro, AWS Cloud Infrastructure, Equinox Gym, Sonic Fiber, and Loom:** Categorized, normalized, and searchable in real time.
7. **Flush Category Breakdown Bar:** A single, flush 8px horizontal stacked proportion bar mapping spending distribution across `Infrastructure`, `Software`, `Media`, `Fitness`, `Utilities`, and `Other` without bloated pie charts.

---

## 2. Key Features

- **Dense Tabular Ledger:** Sort, filter, and search recurring expenses by name, notes, payment card, category, or status in real time.
- **Dual Presentation Views:**
  - **Ledger View:** High-density, sortable table designed for financial auditing and rapid editing.
  - **Timeline View:** 30-day chronological cashflow schedule displaying day-by-day projected subscription charges.
- **Precision Financial Normalization:** Automatically converts weekly (`cost * 52 / 12`), monthly (`cost`), quarterly (`cost / 3`), and yearly (`cost / 12`) billing frequencies into an exact burn rate with zero IEEE 754 floating-point drift.
- **Intelligent Calendar Auto-Advancement:** Past billing dates are automatically advanced to their next valid future calendar recurrence, preserving calendar anchor days (e.g., month-end clamping).
- **Keyboard-First Quick-Entry Drawer:** Slide-out inspector panel with global hotkeys (<kbd>N</kbd> for new entry, <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to save, <kbd>Esc</kbd> to close), instant pre-configured service templates, and direct links to vendor cancellation portals.
- **Multi-Select Batch Operations:** Batch pause, resume, or delete multiple subscriptions simultaneously.
- **Zero Decorative Bloat:** Solid surface tokens (Deep Carbon `#0D0F12`, Elevated Surface `#14171C`, Hairline Borders `#22262F`, Primary Text `#F3F4F6`), avoiding decorative gradients and arbitrary drop shadows.

---

## 3. Data Security & Portability (CWE-1236 Guardrails)

Data sovereignty and defense-in-depth security are central to Cadence's architecture. All data remains strictly on the client side in `localStorage` with runtime schema validation, protected by enterprise-grade export/import sanitization.

![Cadence Data Portability & Persistence Modal](image_8.png)

### Comprehensive Portability Options

As captured in the **Data Portability & Persistence** modal (**image_8.png**), Cadence provides two core data interchange mechanisms:

- **Export as CSV (`.csv`):** Produces a clean, RFC 4180-compliant spreadsheet file for Excel, Apple Numbers, and Google Sheets. Every row includes normalized monthly costs, stated amounts, billing cycles, next renewal dates, payment methods, and notes.
- **Export Backup (`.json`):** Creates an encrypted, 1:1 structured ledger backup containing the complete schema and all metadata for cross-device migration or cold storage.
- **Drag-and-Drop Restoration:** Drop any previous `.json` backup or `.csv` spreadsheet onto the modal to restore or merge records with immediate schema validation.

### Critical Security Guardrails

Spreadsheet applications are vulnerable to **CSV Formula Injection / Dynamic Data Exchange (DDE) Attacks (CWE-1236)** when opening untrusted user input. Cadence enforces strict sanitization at export and import:

> #### 🛡️ Security Guardrail: CWE-1236 Neutralization
> When generating CSV exports, Cadence inspects every single data cell. If any field begins with formula trigger characters—`=`, `+`, `-`, `@`, `\t`, or `\r` (even after arbitrary leading whitespace)—the field is automatically prepended with a single quotation mark (`'`).
> 
> This forces spreadsheet engines (Microsoft Excel, LibreOffice, Google Sheets) to treat the cell value as a harmless literal string rather than an executable formula or OS command.

#### Full Security Matrix

| Security Layer | Threat Vector | Mitigation Strategy | Verification Suite |
| :--- | :--- | :--- | :--- |
| **Formula Injection** | CWE-1236 / DDE Execution | Escapes `=,+,-,@,\t,\r` with `'` and wraps in RFC 4180 quotes | `npm run test:security` (Section 2) |
| **XSS Prevention** | Script & HTML Injection | Inputs sanitized via DOMPurify; neutralizes `<script>`, `<iframe>`, inline `on*` handlers, `javascript:` URIs | `npm run test:security` (Section 1) |
| **Prototype Pollution** | Prototype Hijacking on Import | Pre-deserialization regex scan and reviver checks rejecting `__proto__`, `constructor`, and `prototype` keys | `npm run test:security` (Section 3) |
| **Numeric Bounds** | Overflow & Underflow | Restricts amounts strictly to `[0.01, 999999.99]`, rejecting `NaN`, `Infinity`, and negative values | `npm run test:security` (Section 4) |
| **Filesystem Safety** | Path Traversal / Poisoning | Strips `../`, `..\`, null bytes `\0`, and Windows reserved names (`CON`, `PRN`, `AUX`, `NUL`) from export filenames | `npm run test:security` (Section 5) |
| **Upload Envelopes** | Resource Exhaustion (DoS) | Strict 1MB payload ceiling and MIME type validation (`application/json`, `text/csv`) | `npm run test:security` (Section 6) |
| **Production Hardening** | Information Disclosure | Production bundler automatically strips all `console.*` and `debugger` statements | `npm run build` |
| **Security Headers** | Clickjacking & MIME Sniffing | Configured in `vercel.json` and `index.html`: strict CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` | Production Audit |

---

## 4. Architectural Highlights & Financial Engine

### Burn Rate Normalization Engine

All recurring expenses are mathematically converted into standard monthly and annual equivalents:

$$\text{Monthly Burn}_{\text{weekly}} = \frac{\text{cost} \times 52}{12}$$

$$\text{Monthly Burn}_{\text{quarterly}} = \frac{\text{cost}}{3}$$

$$\text{Monthly Burn}_{\text{yearly}} = \frac{\text{cost}}{12}$$

All calculations utilize integer-cent rounding ($(\text{val} + \epsilon) \times 100 / 100$) to guarantee exact accounting figures free from standard JavaScript floating-point drift (`0.1 + 0.2 = 0.30000000000000004`).

### Calendar Engine & Auto-Advancement

Cadence does not require manual advancement when a renewal passes. If an active subscription has a `nextBillingDate` in the past, the normalization engine iterates forward by the subscription's cycle frequency until the renewal date falls today or in the future—preserving the original day-of-month anchor while clamping against shorter months (e.g., February 28/29, April 30).

---

## 5. Tech Stack

- **Core Framework:** [React 19](https://react.dev/)
- **Language:** [TypeScript 5.x](https://www.typescriptlang.org/) (Strict Mode with `verbatimModuleSyntax`)
- **Build Tool & Bundler:** [Vite 8](https://vite.dev/)
- **Styling Architecture:** [Tailwind CSS v4](https://tailwindcss.com/) with custom Swiss design tokens
- **Security & Sanitization:** [DOMPurify](https://github.com/cure53/DOMPurify), Custom CWE-1236 CSV Engine
- **Iconography:** [Lucide React](https://lucide.dev/)
- **Typography:** Inter & JetBrains Mono (tabular numerals)
- **Testing & Verification:** Node.js Test Runner, [`tsx`](https://github.com/privatenumber/tsx), [`jsdom`](https://github.com/jsdom/jsdom)
- **Deployment Platform:** [Vercel](https://vercel.com/)

---

## 6. Getting Started & Local Development

### Prerequisites

- **Node.js:** `v20.x` or `v22.x`+ recommended
- **npm:** `v10.x`+

### 1. Clone the Repository

```bash
git clone https://github.com/gshumie/Cadence.git
cd Cadence
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173/`.

### 4. Build for Production

```bash
npm run build
```

This compiles TypeScript (`tsc -b`), strips production debug statements, and generates an optimized production bundle in the `dist/` folder.

---

## 7. Verification & Automated Security Suite

Cadence includes an automated security test harness verifying 100% of the application's security invariants and financial calculations.

Execute the suite:

```bash
npm run test:security
```

### Test Suite Coverage Output

```text
============================================================
 CADENCE PRECISION SECURITY AUDIT & HARDENING TEST SUITE
============================================================

[SECTION 1] XSS & Malicious Payload Neutralization
  ✓ [PASS] Blocks raw <script> execution tags
  ✓ [PASS] Blocks inline event handlers (onerror, onload, onclick, onmouseover)
  ✓ [PASS] Blocks javascript: pseudo-protocol URIs
  ✓ [PASS] Blocks malicious iframe injections
  ✓ [PASS] Blocks object and embed tags
  ✓ [PASS] Neutralizes SVG onload and embedded XML scripts
  ✓ [PASS] Strips hazardous null bytes and control characters

[SECTION 2] CSV Formula Injection (DDE) Neutralization
  ✓ [PASS] Escapes cell starting with equals sign (=)
  ✓ [PASS] Escapes cell starting with plus sign (+)
  ✓ [PASS] Escapes cell starting with minus sign (-)
  ✓ [PASS] Escapes cell starting with at symbol (@)
  ✓ [PASS] Escapes cell starting with tab (\t) or carriage return (\r)
  ✓ [PASS] Escapes cell with leading whitespace followed by trigger character
  ✓ [PASS] Complies with RFC 4180 double-quote escaping

[SECTION 3] Prototype Pollution Protection on JSON Import
  ✓ [PASS] Detects and blocks direct __proto__ injection
  ✓ [PASS] Detects and blocks constructor.prototype injection
  ✓ [PASS] Strips hazardous prototype keys from nested objects

[SECTION 4] Numeric Bounds & Overflow / Underflow Rejection
  ✓ [PASS] Rejects zero amounts below minimum ($0.00 < $0.01)
  ✓ [PASS] Rejects negative amounts (-$15.00)
  ✓ [PASS] Rejects amounts exceeding ceiling ($1,000,000.00 > $999,999.99)
  ✓ [PASS] Rejects non-numeric, NaN, and Infinity values
  ✓ [PASS] Accepts valid bounded amounts with precision rounding

[SECTION 5] Filename Sanitization & Path Traversal Neutralization
  ✓ [PASS] Neutralizes parent directory traversal (../../)
  ✓ [PASS] Neutralizes Windows backslash traversal (..\..\)
  ✓ [PASS] Neutralizes null bytes in filenames
  ✓ [PASS] Neutralizes Windows reserved device names (CON, PRN, AUX, NUL)

[SECTION 6] File Upload Constraints
  ✓ [PASS] Rejects JSON payload exceeding 1MB size threshold
  ✓ [PASS] Validates ISO date strings and rejects non-existent dates
  ✓ [PASS] Full subscription payload validation verifies fields and rejects anomalies

[SECTION 7] Financial Calculation Engine & Auto-Advance Invariants
  ✓ [PASS] Normalizes yearly subscriptions accurately ($120.00/yr -> $10.00/mo)
  ✓ [PASS] Normalizes quarterly subscriptions accurately ($90.00/qtr -> $30.00/mo)
  ✓ [PASS] Normalizes weekly subscriptions accurately ($10.00/wk -> (10*52)/12 = $43.33/mo)
  ✓ [PASS] Maintains floating point cents precision without drift
  ✓ [PASS] Auto-advances past monthly dates to next valid occurrence
  ✓ [PASS] Auto-advances past weekly dates to next valid occurrence
  ✓ [PASS] Detects renewals due within 7 days accurately

============================================================
 RESULTS: 36 / 36 Security Test Vectors PASSED (100%)
 ZERO VULNERABILITIES DETECTED
============================================================
```

---

## 8. Production Deployment

Cadence is continuously deployed on **Vercel** at **[https://cadence-ledger.vercel.app](https://cadence-ledger.vercel.app)**.

### Enterprise Header Configuration (`vercel.json`)

The production deployment enforces HTTP security response headers on all routes:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), payment=()"
        }
      ]
    }
  ]
}
```

### Continuous Integration (`.github/workflows/ci.yml`)

Every push and pull request to the `main` branch triggers an automated GitHub Actions pipeline executing dependency integrity verification (`npm ci`), the automated security test suite (`npm run test:security`), and the production typecheck and bundle build (`npm run build`).

---

## 9. Author & License

- **Author & Architect:** [gshumie](https://github.com/gshumie)
- **Repository:** [https://github.com/gshumie/Cadence](https://github.com/gshumie/Cadence)
- **Live Demo:** [https://cadence-ledger.vercel.app](https://cadence-ledger.vercel.app)
- **License:** Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
