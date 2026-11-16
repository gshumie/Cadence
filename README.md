# Cadence 
> **Precision Recurring Expense & Subscription Ledger**

[![Live Demo](https://img.shields.io/badge/Live-Demo-emerald?style=for-the-badge&logo=vercel)](https://cadence-ledger.vercel.app)
[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://cadence-ledger.vercel.app)
[![Integrity Hardened](https://img.shields.io/badge/Integrity-Hardened-10B981?style=for-the-badge&logo=shield)](scripts/test-security.ts)
[![CWE-1236 Protected](https://img.shields.io/badge/Security-CWE--1236%20Protected-38BDF8?style=for-the-badge)](scripts/test-security.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](LICENSE)

---

## 🚀 Overview

**Cadence** is a high-precision financial ledger and subscription tracking web application built with an intentional, Swiss-grid financial layout. Engineered for developers, finance teams, and power users, it provides real-time tracking of monthly normalized burn rates, projected annual run rates, and intelligent upcoming renewal alerts with zero decorative bloat.

![Cadence Main Dashboard](assets/dashboard.png)

- **Live Production URL:** [https://cadence-ledger.vercel.app](https://cadence-ledger.vercel.app)
- **Key Metrics Tracked:** Active subscriptions (e.g., GitHub Copilot Enterprise, Spotify Premium Family, Adobe Creative Cloud, Equinox Fitness Club, and AWS Cloud Infrastructure) with granular countdowns to next billing events.

---

## ✨ Key Features

* **Swiss-Grid Financial Layout:** Structured, high-density dashboard displaying normalized monthly burn rates (e.g., `$519.80 / mo`) and projected annual run rates (`$6,237.63 / yr`) using tabular monospace numerals (`font-variant-numeric: tabular-nums`).
* **Smart Renewal Alerts:** Real-time urgency highlights for subscriptions renewing within 7 days, flagging imminent billing charges and trial expirations before payments process.
* **Category Breakdown & Search:** Instant filtering across `Fitness`, `Software`, `Infrastructure`, `Utilities`, `Media`, and `Other` with multi-parameter search across service names, payment methods, and ledger notes.
* **Dual Presentation Modes:**
  * **Ledger View:** Sortable tabular view for auditing, bulk actions, and rapid editing.
  * **Timeline View:** 30-day chronological schedule mapping daily cashflow outflows.
* **Keyboard-First Quick Entry:** Slide-out drawer with hotkeys (<kbd>N</kbd> for new entry, <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to save, <kbd>Esc</kbd> to close), quick-fill templates, and direct links to cancellation portals.
* **Automated Calendar Advancement:** Past billing dates are automatically advanced forward by their billing cycle (weekly, monthly, quarterly, yearly) to the next valid calendar occurrence, preserving anchor days of the month.

---

## 🔒 Data Portability & Security (CWE-1236 Protected)

Cadence includes an enterprise-grade **Data Portability & Persistence** module designed to safeguard your local and spreadsheet financial data:

![Data Portability & Persistence Modal](assets/data-portability.png)

* **Export as CSV (`.csv`):** Formatted for spreadsheet accounting in Microsoft Excel, Apple Numbers, and Google Sheets, complete with normalized monthly costs, payment cards, and notes.
* **Export Backup (`.json`):** Full structured ledger schema maintaining complete metadata for 1:1 cross-device restoration.
* **Drag-and-Drop Restoration:** One-click import for previous `.json` backups and `.csv` files with instant client-side schema verification.
* **Security Guardrails (CWE-1236 Neutralization):** Automatically escapes any cell starting with formula trigger characters (`=`, `+`, `-`, `@`, `\t`, or `\r`) by prepending a single quote (`'`), completely neutralizing Dynamic Data Exchange (DDE) and formula injection attacks when opened in spreadsheet software.
* **Prototype Pollution Protection:** Deep scanning and reviver checks rejecting `__proto__`, `constructor`, and `prototype` keys on import.
* **Strict XSS & Amount Sanitization:** Ingested strings are neutralized via DOMPurify, and amounts are validated strictly within `[$0.01, $999,999.99]`, rejecting `NaN`, `Infinity`, and negative values.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 19, TypeScript 5.x (Strict Mode)
* **Build Tool & Bundler:** Vite 8
* **Styling & Design Tokens:** Tailwind CSS v4, custom Swiss Deep Carbon surface palette
* **Security & Sanitization:** DOMPurify, Custom RFC 4180 / CWE-1236 Sanitization Engine
* **Testing:** Node.js Native Test Runner, `tsx`, `jsdom` (36/36 automated test suite)
* **Deployment:** Production-hosted on Vercel with strict HTTP security response headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`)

---

## ⚙️ Getting Started & Local Development

To run Cadence locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gshumie/Cadence.git
   cd Cadence
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Run the automated security test suite:**
   ```bash
   npm run test:security
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🧪 Security Test Suite

Cadence includes an automated security harness testing 36 distinct test vectors covering XSS neutralization, formula injection escaping, prototype pollution rejection, and financial calculation invariants:

```text
============================================================
 CADENCE PRECISION SECURITY AUDIT & HARDENING TEST SUITE
============================================================

[SECTION 1] XSS & Malicious Payload Neutralization: 7 PASSED
[SECTION 2] CSV Formula Injection (DDE) Neutralization: 7 PASSED
[SECTION 3] Prototype Pollution Protection on JSON Import: 3 PASSED
[SECTION 4] Numeric Bounds & Overflow / Underflow Rejection: 5 PASSED
[SECTION 5] Filename Sanitization & Path Traversal Neutralization: 4 PASSED
[SECTION 6] File Upload Constraints: 3 PASSED
[SECTION 7] Financial Calculation Engine & Auto-Advance Invariants: 7 PASSED

============================================================
 RESULTS: 36 / 36 Security Test Vectors PASSED (100%)
 ZERO VULNERABILITIES DETECTED
============================================================
```

---

## 📄 License

Distributed under the **MIT License**. Created by [gshumie](https://github.com/gshumie). See [LICENSE](LICENSE) for details.
