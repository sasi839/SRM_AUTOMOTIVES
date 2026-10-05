# SRM AUTOMOTIVES — BILLING SYSTEM ARCHITECTURE

## 1. Overview & Isolation Architecture

This document defines the architectural rules, data model, and modular contracts for the **SRM AUTOMOTIVES Billing System**.

The billing system is constructed as an isolated sub-application located in `billing-app/`. It runs independently on local port **5174**.

### Key Isolation Guarantees:
* **Zero Modification to Core Frontend**: The main SRM website and existing Admin Portal UI are untouched.
* **Zero Modification to Authentication**: Existing authentication logic remains unchanged.
* **Database Table Safety**: Existing tables (`site_content`, `site_images`) are untouched. Dedicated tables (`billing_works`, `billing_invoices`, `billing_invoice_items`) handle all billing data.

---

## 2. Dedicated Billing Data Model

### A. Predefined Works Catalogue (`billing_works`)
* `id` (UUID, Primary Key)
* `work_name` (TEXT, Unique) — Predefined service/part name (e.g., "General Service", "Engine Oil Synthetic")
* `work_type` (TEXT) — `'Labour'` or `'Part'`
* `is_active` (BOOLEAN) — Active state indicator
* *Note: The price/rate is NOT stored in the catalogue. Rate is specified per bill line.*

### B. Invoices Header (`billing_invoices`)
* `id` (UUID, Primary Key)
* `invoice_number` (TEXT, Unique) — Sequential or formatted invoice identifier
* `number_plate` (TEXT) — **Primary reference key** for vehicle billing history
* `mobile_number` (TEXT, Optional) — Customer contact number for WhatsApp sharing
* `grand_total` (NUMERIC) — Calculated grand total sum of line items

### C. Invoice Line Items (`billing_invoice_items`)
* `id` (UUID, Primary Key)
* `invoice_id` (UUID, Foreign Key → `billing_invoices.id`)
* `s_no` (INT) — Line sequence number (1, 2, 3...)
* `work_name` (TEXT) — Work description
* `work_type` (TEXT) — `'Labour'` or `'Part'`
* `quantity` (NUMERIC) — Quick selection (1..10) or Custom quantity
* `rate` (NUMERIC) — Admin-entered unit rate
* `amount` (NUMERIC) — Auto-calculated: `Amount = Quantity × Rate`

---

## 3. Strict Billing Business Rules

1. **Bill Table Structure**: `S.No | Work | Type | Quantity | Rate | Amount`
2. **Quantity Selection**: Quick selections `1, 2, 3, ... 10` + `Custom Quantity`. Custom quantity is line-specific and never modifies the catalogue.
3. **Manual Rate Entry**: Admin manually enters the rate for each line item during bill creation.
4. **Amount Calculation**: `Amount = Quantity × Rate`. Never editable directly in the UI.
5. **Grand Total**: Sum of individual line item amounts.
6. **Automatic Work Type Determination**: Selecting a work automatically sets its type (`Labour` or `Part`) based on the catalogue.
7. **Primary Search Reference**: Search is strictly conducted by vehicle **Number Plate**. No customer profiles, owner accounts, or CRM.
8. **Print & Statement Options**:
   * Option 1: **Till Now** (All bills for number plate)
   * Option 2: **Between Two Dates** (Date range)
   * Option 3: **After Specific Date** (From selected date onward)
9. **PDF Source of Truth**: Database is the permanent record. PDF is only a generated presentation view.
10. **Post-Creation Actions**: Immediate **Print | Download PDF | Share through WhatsApp** directly on newly generated bill.

---

## 4. Scope Boundary (Do Not Overbuild)

The following feature domains are explicitly excluded from the billing project:
* ❌ Inventory management & stock tracking
* ❌ Supplier / purchase management
* ❌ Payment tracking & split payments
* ❌ Customer accounts, owner profiles, logins
* ❌ Staff management & payroll
* ❌ CRM & loyalty points
* ❌ Unrequested tax/GST modules
