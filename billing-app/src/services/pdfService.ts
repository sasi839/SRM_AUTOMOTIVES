import type { Invoice, PrintSearchFilter } from '../types/billing';
import { SRM_LOGO_BASE64 } from '../assets/logoBase64';
import { GOOGLE_REVIEW_QR_BASE64 } from '../assets/googleReviewQrBase64';
import { organizeLineItemsByType } from './calculationService';

/**
 * SREE RAJA RAJESWARI MOTORS — PDF & PRINT OUTPUT SERVICE LAYER
 * 
 * Phase 2.12 Final Polish Rules:
 * 1. Database/Supabase is single source of truth.
 * 2. PDF & Print output are professional generated representations.
 * 3. Official business branding: "SREE RAJA RAJESWARI MOTORS".
 * 4. No '#' symbol before invoice numbers or labels.
 * 5. Event date in top-right area; Event total directly underneath final row of event table.
 * 6. Bottom-left footer address: "#184, Renigunta Road, S.V. Autonagar, Tirupati."
 * 7. Multi-page PDF system with row page-break prevention and repeating table headers.
 * 8. Binary PDF download and Web Share API WhatsApp PDF sharing.
 */

import html2pdf from 'html2pdf.js';

export class PdfService {
  private static async generatePdfBlob(htmlContent: string, filename: string): Promise<Blob> {
    // FIX: Position fixed container offscreen (100vh) to render HTML cleanly for html2canvas
    const wrapper = document.createElement('div');
    wrapper.id = 'srm-pdf-export-wrapper';
    wrapper.style.position = 'fixed';
    wrapper.style.top = '100vh';
    wrapper.style.left = '0';
    wrapper.style.width = '794px';
    wrapper.style.height = 'auto';
    wrapper.style.minHeight = '1123px';
    wrapper.style.overflow = 'hidden';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '-9999';

    const container = document.createElement('div');
    container.id = 'srm-pdf-export-container';
    container.style.width = '794px'; // Exact A4 width at 96 DPI
    container.style.background = '#ffffff';
    container.style.margin = '0 auto';
    container.style.padding = '0';
    container.style.boxSizing = 'border-box';
    
    const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    
    if (styleMatch && styleMatch[1]) {
      const styleEl = document.createElement('style');
      styleEl.textContent = styleMatch[1].replace(/body\s*\{/g, '.pdf-container {');
      container.appendChild(styleEl);
    }
    
    if (bodyMatch && bodyMatch[1]) {
      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'pdf-container';
      bodyDiv.style.boxSizing = 'border-box';
      bodyDiv.style.width = '794px';
      bodyDiv.style.margin = '0 auto';
      bodyDiv.style.padding = '0';
      bodyDiv.innerHTML = bodyMatch[1];
      container.appendChild(bodyDiv);
    } else {
      container.innerHTML = htmlContent
        .replace(/<!DOCTYPE[^>]*>/i, '')
        .replace(/<\/?html[^>]*>/gi, '')
        .replace(/<\/?head[^>]*>/gi, '')
        .replace(/<\/?body[^>]*>/gi, '');
    }
    
    wrapper.appendChild(container);
    document.body.appendChild(wrapper);
    
    try {
      const pdfBlob = await (html2pdf as any)().set({
        margin: [4, 0, 8, 0], // Safe top and bottom margins so bottom border never gets cut
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 1.5, 
          useCORS: true, 
          logging: false, 
          allowTaint: true, 
          windowWidth: 794,
          scrollX: 0,
          scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }).from(container).outputPdf('blob');
      
      return pdfBlob;
    } finally {
      if (document.body.contains(wrapper)) {
        document.body.removeChild(wrapper);
      }
    }
  }

  /**
   * Formats a clean WhatsApp text summary (used as fallback or share context)
   */
  static getWhatsAppShareUrl(invoice: Invoice): string {
    const cleanPhone = invoice.mobile_number ? invoice.mobile_number.replace(/[^0-9]/g, '') : '';
    const cleanInvoiceNo = invoice.invoice_number.replace(/^#/, '');

    const itemsListText = invoice.items
      .map((item, i) => `  ${i + 1}. *${item.work_name}* (${item.work_type})\n     ${item.quantity} × ₹${item.rate.toLocaleString('en-IN')} = *₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}*`)
      .join('\n');

    const formattedDate = new Date(invoice.created_at || Date.now()).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const messageText = 
`🚘 *SREE RAJA RAJESWARI MOTORS — SERVICE INVOICE* 🚘
-----------------------------------
Invoice: ${cleanInvoiceNo}
Vehicle Plate: ${invoice.number_plate}
Date: ${formattedDate}
${invoice.mobile_number ? `Mobile: ${invoice.mobile_number}\n` : ''}
*Bill Items Breakdown:*
${itemsListText}

-----------------------------------
*Grand Total Amount:* ₹${invoice.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
-----------------------------------
📍 *Address:* #184, Renigunta Road, S.V. Autonagar, Tirupati.
Thank you for choosing *SREE RAJA RAJESWARI MOTORS* for your vehicle service & maintenance!`;

    const encodedMessage = encodeURIComponent(messageText);
    return cleanPhone 
      ? `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedMessage}`
      : `https://api.whatsapp.com/send?text=${encodedMessage}`;
  }

  /**
   * Formats a WhatsApp share URL for a Multi-Bill Statement
   */
  static getStatementWhatsAppUrl(invoices: Invoice[], filter: PrintSearchFilter): string {
    const firstPhone = invoices.find((inv) => inv.mobile_number)?.mobile_number;
    const cleanPhone = firstPhone ? firstPhone.replace(/[^0-9]/g, '') : '';

    const grandTotal = invoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0);

    const invoiceSummaryText = invoices.map((inv, idx) => {
      const invDate = new Date(inv.created_at || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const worksList = inv.items.map((i) => i.work_name).join(', ');
      return `Event: ${idx + 1} | Invoice: ${inv.invoice_number.replace(/^#/, '')} (${invDate})\n   Works: ${worksList}\n   Event Total: *₹${inv.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}*`;
    }).join('\n\n');

    const modeLabel = filter.mode.replace('_', ' ').toUpperCase();

    const messageText = 
`🚘 *SREE RAJA RAJESWARI MOTORS — INVOICE* 🚘
-----------------------------------
Vehicle Plate: ${filter.number_plate}
Statement Range: ${modeLabel}
Total Events: ${invoices.length} Invoices

*Statement Invoices Breakdown:*
${invoiceSummaryText}

-----------------------------------
*STATEMENT GRAND TOTAL:* ₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
-----------------------------------
📍 *Address:* #184, Renigunta Road, S.V. Autonagar, Tirupati.
Thank you for choosing *SREE RAJA RAJESWARI MOTORS*!`;

    const encodedMessage = encodeURIComponent(messageText);
    return cleanPhone 
      ? `https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodedMessage}`
      : `https://api.whatsapp.com/send?text=${encodedMessage}`;
  }

  /**
   * Generate Professional Printable HTML String for Single Invoice
   * Optimized for exact A4 paper fit with proper double-border
   */
  static generateInvoiceHtml(invoice: Invoice): string {
    const formattedDate = new Date(invoice.created_at || Date.now()).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const cleanInvoiceNo = invoice.invoice_number.replace(/^#/, '');
    const organizedItems = organizeLineItemsByType(invoice.items);
    const labourTotal = organizedItems.filter((i) => i.work_type === 'Labour').reduce((sum, i) => sum + i.amount, 0);
    const partTotal = organizedItems.filter((i) => i.work_type === 'Part').reduce((sum, i) => sum + i.amount, 0);
    const otherTotal = organizedItems.filter((i) => i.work_type !== 'Labour' && i.work_type !== 'Part').reduce((sum, i) => sum + i.amount, 0);
    const discountPct = Number(invoice.labour_discount_percentage) || 0;
    const discountAmt = discountPct > 0 
      ? (invoice.labour_discount_amount || Number(((labourTotal * discountPct) / 100).toFixed(2)))
      : 0;

    const ITEMS_PER_PAGE = 12;
    const pages: any[][] = [];
    for (let i = 0; i < organizedItems.length; i += ITEMS_PER_PAGE) {
      pages.push(organizedItems.slice(i, i + ITEMS_PER_PAGE));
    }
    if (pages.length === 0) pages.push([]);

    const pagesHtml = pages.map((pageItems, pageIndex) => {
      const isLastPage = pageIndex === pages.length - 1;
      const itemsRows = pageItems.map((item) => `
        <tr style="page-break-inside: avoid; break-inside: avoid;">
          <td style="font-family: monospace; text-align: center; font-weight: 700; color: #334155;">${item.s_no}</td>
          <td style="font-weight: 600; color: #0f172a;">${item.work_name}</td>
          <td style="text-align: center; font-size: 9px; font-weight: 600; color: #334155;">${item.work_type}</td>
          <td style="text-align: center; font-weight: 700; color: #0f172a;">${item.quantity}</td>
          <td style="font-family: monospace; text-align: right; color: #334155; font-weight: 600;">₹${item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="font-family: monospace; font-weight: 800; text-align: right; color: #0f172a;">₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('');

      const totalsHtml = isLastPage ? `
        <tfoot>
          <tr style="background: #f8fafc; border-top: 1.5px solid #cbd5e1;">
            <td colspan="4" style="vertical-align: middle; text-align: left;">
              ${invoice.odometer ? `<span style="font-size: 9.5px; color: #475569;">Odometer Reading:</span> <strong style="font-family: monospace; font-size: 11px; color: #0f172a; margin-left: 4px;">${invoice.odometer} km</strong>` : ''}
              ${discountPct > 0 ? `
                <div style="margin-top: 2px;">
                  <span style="background: #ecfdf5; border: 1.5px solid #10b981; color: #047857; font-weight: 800; padding: 2px 7px; border-radius: 4px; font-size: 8.5px; display: inline-block; letter-spacing: 0.2px;">
                    🎉 YOU SAVED ₹${discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ON LABOUR (${discountPct}% OFF)
                  </span>
                </div>
              ` : ''}
            </td>
            <td style="text-align: right; font-size: 9.5px; font-weight: 700; color: #475569;">Labour Subtotal:</td>
            <td style="text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">₹${labourTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          ${discountPct > 0 ? `
          <tr style="background: #f0fdf4;">
            <td colspan="4" style="font-size: 8px; color: #047857; font-weight: 700; vertical-align: middle;">
              Special Labour Discount (${discountPct}% OFF) Applied
            </td>
            <td style="text-align: right; font-size: 9.5px; font-weight: 800; color: #047857;">Less Labour Discount:</td>
            <td style="text-align: right; font-family: monospace; font-weight: 800; color: #047857;">- ₹${discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          ` : ''}
          <tr style="background: #f8fafc;">
            <td colspan="4" style="font-size: 8px; color: #64748b; font-style: italic;">SREE RAJA RAJESWARI MOTORS • Quality Service Assured</td>
            <td style="text-align: right; font-size: 9.5px; font-weight: 700; color: #475569;">Parts Subtotal:</td>
            <td style="text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">₹${partTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          ${otherTotal > 0 ? `
          <tr style="background: #f8fafc;">
            <td colspan="4"></td>
            <td style="text-align: right; font-size: 9.5px; font-weight: 700; color: #475569;">Towing / Other:</td>
            <td style="text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">₹${otherTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          ` : ''}
          <tr style="background: #f1f5f9; border-top: 2px solid #0f172a;">
            <td colspan="4" style="border: 1.5px solid #0f172a; border-right: 1px solid #cbd5e1; vertical-align: middle; font-size: 8.5px; color: #64748b; font-style: italic;">All rates inclusive of applicable charges</td>
            <td style="border-top: 1.5px solid #0f172a; border-bottom: 1.5px solid #0f172a; border-left: none; border-right: 1px solid #cbd5e1; text-align: right; font-size: 11px; font-weight: 900; color: #b91c1c; text-transform: uppercase;">GRAND TOTAL:</td>
            <td style="border: 1.5px solid #0f172a; border-left: none; text-align: right; font-family: monospace; font-size: 14px; font-weight: 900; color: #0f172a;">₹${invoice.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      ` : `
        <tfoot>
          <tr style="background: #f1f5f9; border-top: 1.5px solid #cbd5e1;">
            <td colspan="6" style="padding: 6px; text-align: center; font-size: 9px; font-style: italic; color: #64748b; border: 1px solid #cbd5e1;">Continued on next page...</td>
          </tr>
        </tfoot>
      `;

      return `
        <div class="invoice-card" ${pageIndex < pages.length - 1 ? 'style="page-break-after: always; break-after: page;"' : ''}>
          
          <div class="top-invoice-title">INVOICE</div>

          <div class="header-bar">
            <div class="brand-section">
              <img src="${SRM_LOGO_BASE64}" alt="SREE RAJA RAJESWARI MOTORS Logo" class="brand-logo-img" />
              <div>
                <div class="company-name">SREE RAJA RAJESWARI MOTORS</div>
                <div class="company-sub">Multi-Brand Car Service & Repair Workshop</div>
                <div class="company-address">#184, Renigunta Road, S.V. Autonagar, Tirupati.</div>
              </div>
            </div>
            <div class="invoice-meta">
              <div class="meta-line">Proprietor: <strong>A. Lokesh</strong></div>
              <div class="meta-line">Mobile: <strong>+91 89195 94039</strong></div>
              <div class="meta-line">Invoice: <strong>${cleanInvoiceNo}</strong></div>
              <div class="meta-line">Date: <strong>${formattedDate}</strong></div>
            </div>
          </div>

          <div class="details-row">
            <div class="details-item">
              <span class="details-label">Name:</span>
              <span class="details-val">${invoice.customer_name || 'N/A'}</span>
            </div>
            <div class="details-item">
              <span class="details-label">Vehicle Plate:</span>
              <span class="details-val" style="font-family: monospace; color: #b91c1c; font-size: 12px;">${invoice.number_plate}</span>
            </div>
            <div class="details-item">
              <span class="details-label">Mobile:</span>
              <span class="details-val">${invoice.mobile_number || 'N/A'}</span>
            </div>
          </div>

          <table style="flex-grow: 1;">
            <thead>
              <tr>
                <th style="width: 38px; text-align: center;">S.No</th>
                <th style="text-align: left;">Work Description</th>
                <th style="width: 76px; text-align: center;">Type</th>
                <th style="width: 44px; text-align: center;">Qty</th>
                <th style="width: 86px; text-align: right;">Rate (₹)</th>
                <th style="width: 96px; text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
            ${totalsHtml}
          </table>

          <div style="flex-grow: 1;"></div>

          <div class="bottom-sign-container">
            <div class="signatures-row">
              <div class="customer-sign-box">
                <div class="sig-line"></div>
                <div class="sig-label">Customer Signature</div>
              </div>

              <div class="owner-sign-box">
                <div class="owner-company-title">For SREE RAJA RAJESWARI MOTORS</div>
                <div class="sig-line"></div>
                <div class="sig-label">Owner / Authorised Signatory</div>
              </div>
            </div>

            <div class="footer-bottom-row">
              <div class="qr-review-container">
                <img src="${GOOGLE_REVIEW_QR_BASE64}" alt="Google Review QR" class="qr-code-img" />
                <div class="qr-review-text">
                  <span class="qr-head">Review us on Google</span>
                  <span class="qr-desc">Scan QR to share your feedback</span>
                </div>
              </div>

              <div class="thanks-note-box">
                <div class="thanks-note-title">Thanks for choosing SRM</div>
                <div class="thanks-note-sub">We appreciate your visit & trust • Drive Safe!</div>
                ${pages.length > 1 ? `<div class="page-indicator">Page ${pageIndex + 1} of ${pages.length}</div>` : ''}
              </div>
            </div>
          </div>

        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice ${cleanInvoiceNo} — SREE RAJA RAJESWARI MOTORS</title>
          <link rel="icon" href="${SRM_LOGO_BASE64}" />
          <style>
            .invoice-card, .invoice-card *, .invoice-card *::before, .invoice-card *::after { box-sizing: border-box; }
            @page { size: A4 portrait; margin: 6mm 6mm 10mm 6mm; }
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 0; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .invoice-card { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0f172a; width: 736px; min-height: 940px; display: flex; flex-direction: column; max-width: 100%; margin: 0 auto; background: #ffffff; border: 2px solid #0f172a; outline: 2px solid #b91c1c; outline-offset: -4px; border-radius: 4px; padding: 8px 14px 10px 14px; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid; }
            .invoice-card .top-invoice-title { text-align: center; font-size: 15px; font-weight: 900; color: #b91c1c; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 3px; padding-bottom: 2px; border-bottom: 1.5px dashed #cbd5e1; }
            .invoice-card .header-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1.5px solid #b91c1c; padding-bottom: 5px; margin-bottom: 5px; page-break-inside: avoid; }
            .invoice-card .brand-section { display: flex; gap: 8px; align-items: center; }
            .invoice-card .brand-logo-img { height: 42px; max-width: 145px; object-fit: contain; display: block; }
            .invoice-card .company-name { font-size: 16px; font-weight: 900; color: #0f172a; letter-spacing: -0.3px; line-height: 1.1; }
            .invoice-card .company-sub { font-size: 8.5px; color: #475569; font-weight: 700; text-transform: uppercase; margin-top: 1px; letter-spacing: 0.5px; }
            .invoice-card .company-address { font-size: 8.5px; color: #334155; font-weight: 600; margin-top: 2px; }
            .invoice-card .invoice-meta { text-align: right; font-size: 10px; }
            .invoice-card .meta-line { margin-top: 1px; color: #334155; font-size: 9.5px; }
            .invoice-card .meta-line strong { color: #0f172a; font-family: monospace; font-size: 10.5px; }
            
            .invoice-card .details-row { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 4px; padding: 4px 10px; margin-bottom: 6px; font-size: 10px; page-break-inside: avoid; }
            .invoice-card .details-item { display: flex; gap: 4px; align-items: baseline; }
            .invoice-card .details-label { font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 8.5px; }
            .invoice-card .details-val { font-weight: 800; color: #0f172a; font-size: 10.5px; }
            
            .invoice-card table { width: 100%; border-collapse: collapse; border: 1.5px solid #0f172a; margin-bottom: 6px; font-size: 9px; page-break-inside: auto; background: #ffffff; }
            .invoice-card thead { display: table-header-group; }
            .invoice-card th { background: #0f172a; color: #ffffff; padding: 5px 8px; font-size: 8.5px; text-transform: uppercase; font-weight: 800; text-align: left; letter-spacing: 0.5px; border: 1px solid #334155; }
            .invoice-card td { border: 1px solid #cbd5e1; padding: 4.5px 8px; vertical-align: middle; }
            .invoice-card tbody tr:nth-child(even) { background-color: #f8fafc; }
            .invoice-card tbody tr:nth-child(odd) { background-color: #ffffff; }
            .invoice-card tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            
            .invoice-card .bottom-sign-container { border-top: 1.5px solid #cbd5e1; margin-top: auto; padding-top: 5px; padding-bottom: 2px; page-break-inside: avoid; break-inside: avoid; }
            .invoice-card .signatures-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4px; }
            .invoice-card .customer-sign-box { text-align: left; }
            .invoice-card .sig-line { width: 140px; border-bottom: 1.5px solid #0f172a; margin-bottom: 3px; }
            .invoice-card .sig-label { font-size: 8px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; }
            .invoice-card .owner-sign-box { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
            .invoice-card .owner-company-title { font-size: 9px; font-weight: 800; color: #0f172a; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.3px; }
            
            .invoice-card .footer-bottom-row { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e2e8f0; padding-top: 4px; margin-top: 2px; }
            .invoice-card .qr-review-container { display: flex; align-items: center; gap: 6px; }
            .invoice-card .qr-code-img { width: 34px; height: 34px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px; background: #ffffff; display: block; }
            .invoice-card .qr-review-text { font-size: 7.5px; line-height: 1.25; color: #475569; }
            .invoice-card .qr-head { font-weight: 800; color: #0f172a; display: block; font-size: 8px; }
            .invoice-card .qr-desc { font-size: 7px; color: #64748b; }
            .invoice-card .thanks-note-box { text-align: right; }
            .invoice-card .thanks-note-title { font-size: 9.5px; font-weight: 800; color: #b91c1c; letter-spacing: 0.5px; text-transform: uppercase; }
            .invoice-card .thanks-note-sub { font-size: 7.5px; color: #475569; margin-top: 1px; }
            .invoice-card .page-indicator { font-size: 8px; color: #94a3b8; margin-top: 1px; font-weight: 600; }
            @media print { 
              html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; } 
              .invoice-card { margin: 0 auto !important; border: 2px solid #0f172a !important; outline: 2px solid #b91c1c !important; outline-offset: -4px !important; min-height: 940px !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; page-break-inside: avoid !important; break-inside: avoid !important; } 
            }
          </style>
        </head>
        <body>
          ${pagesHtml}
        </body>
      </html>
    `;
  }

  static generateStatementHtml(invoices: Invoice[], filter: PrintSearchFilter): string {
    const generatedDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const statementGrandTotal = invoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0);
    const customerName = invoices.find((inv) => inv.customer_name)?.customer_name || 'N/A';
    const customerMobile = invoices.find((inv) => inv.mobile_number)?.mobile_number || 'N/A';

    const totalLabourDiscountAcrossStatement = invoices.reduce((sum, inv) => sum + (inv.labour_discount_amount || 0), 0);
    const totalOriginalBeforeDiscount = invoices.reduce((sum, inv) => {
      const sub = inv.subtotal_before_discount || (inv.items || []).reduce((s, it) => s + (it.amount || 0), 0);
      return sum + sub;
    }, 0);

    // SPACE-EFFICIENT CONTINUOUS TABLE ARCHITECTURE:
    // Instead of multiple disjoint tables with duplicated theads and bulky wrappers,
    // all events are unified into a single streamlined table per page.
    const PAGE_CAPACITY = 22; // safe maximum rows per page with ultra-compact height
    const pagesHtml: string[] = [];
    let currentRowsHtml = '';
    let currentWeight = 0;

    invoices.forEach((inv, idx) => {
      const invDate = new Date(inv.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const cleanInvoiceNo = inv.invoice_number.replace(/^#/, '');

      // Check if event banner + at least 1 item fits on current page
      if (currentWeight + 2 > PAGE_CAPACITY && currentWeight > 0) {
        pagesHtml.push(currentRowsHtml);
        currentRowsHtml = '';
        currentWeight = 0;
      }

      // 1. Sleek Event Banner Row spanning all 6 table columns
      currentRowsHtml += `
        <tr style="background: #e2e8f0; border-top: 2px solid #0f172a; border-bottom: 1.5px solid #0f172a; page-break-inside: avoid; break-inside: avoid;">
          <td colspan="6" style="padding: 4px 8px; border: 1px solid #94a3b8; font-size: 9px; color: #1e293b;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #0f172a; font-size: 9.5px; text-transform: uppercase;">Event ${idx + 1}</strong>
                &nbsp;&nbsp;|&nbsp;&nbsp;<span style="color: #475569;">Invoice:</span> <strong style="font-family: monospace; color: #0f172a; font-size: 9.5px;">${cleanInvoiceNo}</strong>
                ${inv.odometer ? `&nbsp;&nbsp;|&nbsp;&nbsp;<span style="color: #475569;">Odometer:</span> <strong style="font-family: monospace; color: #0f172a; font-size: 9.5px;">${inv.odometer} km</strong>` : ''}
              </div>
              <div style="color: #475569; font-size: 8.5px;">
                Date: <strong style="color: #0f172a;">${invDate}</strong>
              </div>
            </div>
          </td>
        </tr>
      `;
      currentWeight += 1;

      // 2. Compact Item Rows for this event (Organized: Parts -> Labour -> Towing -> Other)
      const eventItems = organizeLineItemsByType(inv.items);
      eventItems.forEach((item) => {
        if (currentWeight + 1 > PAGE_CAPACITY) {
          pagesHtml.push(currentRowsHtml);
          currentRowsHtml = '';
          currentWeight = 0;
        }
        currentRowsHtml += `
          <tr style="page-break-inside: avoid; break-inside: avoid;">
            <td style="font-family: monospace; text-align: center; font-size: 8.5px; color: #475569; font-weight: 700;">${item.s_no}</td>
            <td style="font-weight: 600; color: #0f172a;">${item.work_name}</td>
            <td style="text-align: center; font-size: 8.5px; font-weight: 600; color: #334155;">${item.work_type}</td>
            <td style="text-align: center; font-weight: 700; color: #0f172a;">${item.quantity}</td>
            <td style="font-family: monospace; text-align: right; color: #475569; font-weight: 600;">₹${item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="font-family: monospace; font-weight: 800; text-align: right; color: #0f172a;">₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
        currentWeight += 1;
      });

      // 3. Compact Event Subtotal Row with Labour Discount Representation
      const eventDiscountPct = Number(inv.labour_discount_percentage) || 0;
      const eventDiscountAmt = eventDiscountPct > 0 ? (inv.labour_discount_amount || 0) : 0;

      currentRowsHtml += `
        <tr style="background: #f8fafc; border-bottom: 1.5px solid #cbd5e1; page-break-inside: avoid; break-inside: avoid;">
          <td colspan="4" style="text-align: left; font-size: 8px; color: #64748b; font-style: italic;">
            Subtotal for Event ${idx + 1} (${cleanInvoiceNo})
            ${eventDiscountPct > 0 ? `
              &nbsp;&bull;&nbsp;
              <span style="background: #ecfdf5; border: 1px solid #10b981; color: #047857; font-weight: 800; padding: 1px 5px; border-radius: 3px; font-size: 8px;">
                🎉 Labour Discount (${eventDiscountPct}% OFF): -₹${eventDiscountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            ` : ''}
          </td>
          <td style="text-align: right; font-size: 8.5px; font-weight: 700; color: #475569;">Event Total:</td>
          <td style="text-align: right; font-family: monospace; font-size: 10px; font-weight: 800; color: #0f172a;">
            ₹${inv.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>
        </tr>
      `;
      currentWeight += 1;
    });

    if (currentRowsHtml !== '') {
      pagesHtml.push(currentRowsHtml);
    }
    if (pagesHtml.length === 0) pagesHtml.push('');

    const finalPagesHtml = pagesHtml.map((rowsContent, index) => {
      const isLastPage = index === pagesHtml.length - 1;
      const grandSummaryHtml = isLastPage ? `
        <div class="grand-summary-box">
          <div>
            <div class="grand-summary-title">TOTAL STATEMENT AMOUNT</div>
            <div class="grand-summary-sub">
              Total across ${invoices.length} billing event(s) for vehicle <strong>${filter.number_plate}</strong>
            </div>
            ${totalLabourDiscountAcrossStatement > 0 ? `
              <div style="margin-top: 3px;">
                <span style="background: #ecfdf5; border: 1px solid #10b981; color: #047857; font-weight: 800; padding: 2px 6px; border-radius: 4px; font-size: 8.5px; display: inline-block;">
                  🎉 Total Labour Savings: ₹${totalLabourDiscountAcrossStatement.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Applied across discounted events)
                </span>
              </div>
            ` : ''}
          </div>
          <div style="text-align: right;">
            ${totalLabourDiscountAcrossStatement > 0 ? `
              <div style="font-size: 9px; color: #64748b; text-decoration: line-through; font-family: monospace;">
                Original: ₹ ${totalOriginalBeforeDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            ` : ''}
            <div class="grand-summary-amount">₹ ${statementGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            ${totalLabourDiscountAcrossStatement > 0 ? `<div style="font-size: 8px; color: #047857; font-weight: 800; text-transform: uppercase;">Net Amount Payable</div>` : ''}
          </div>
        </div>
      ` : '';

      return `
        <div class="statement-card" ${index < pagesHtml.length - 1 ? 'style="page-break-after: always; break-after: page;"' : ''}>
          
          <div class="top-invoice-title">INVOICE</div>

          <div class="header-bar">
            <div class="brand-section">
              <img src="${SRM_LOGO_BASE64}" alt="SREE RAJA RAJESWARI MOTORS Logo" class="brand-logo-img" />
              <div>
                <div class="company-name">SREE RAJA RAJESWARI MOTORS</div>
                <div class="company-sub">Multi-Brand Car Service & Repair Workshop</div>
                <div class="company-address">#184, Renigunta Road, S.V. Autonagar, Tirupati.</div>
              </div>
            </div>
            <div class="statement-title-box">
              <div class="meta-line">Proprietor: <strong>A. Lokesh</strong></div>
              <div class="meta-line">Mobile: <strong>+91 89195 94039</strong></div>
              <div class="meta-line">Date: <strong>${generatedDate}</strong></div>
            </div>
          </div>

          <div class="details-row">
            <div class="details-item">
              <span class="details-label">Name:</span>
              <span class="details-val">${customerName}</span>
            </div>
            <div class="details-item">
              <span class="details-label">Vehicle Plate:</span>
              <span class="details-val" style="font-family: monospace; color: #b91c1c; font-size: 12px;">${filter.number_plate}</span>
            </div>
            <div class="details-item">
              <span class="details-label">Mobile:</span>
              <span class="details-val">${customerMobile}</span>
            </div>
          </div>

          <div style="flex-grow: 1;">
            <table style="flex-grow: 1;">
              <thead>
                <tr>
                  <th style="width: 34px; text-align: center;">S.No</th>
                  <th style="text-align: left;">Work Description</th>
                  <th style="width: 72px; text-align: center;">Type</th>
                  <th style="width: 38px; text-align: center;">Qty</th>
                  <th style="width: 82px; text-align: right;">Rate (₹)</th>
                  <th style="width: 90px; text-align: right;">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${rowsContent}
              </tbody>
            </table>
            ${grandSummaryHtml}
          </div>

          <div class="bottom-sign-container">
            <div class="signatures-row">
              <div class="customer-sign-box">
                <div class="sig-line"></div>
                <div class="sig-label">Customer Signature</div>
              </div>

              <div class="owner-sign-box">
                <div class="owner-company-title">For SREE RAJA RAJESWARI MOTORS</div>
                <div class="sig-line"></div>
                <div class="sig-label">Owner / Authorised Signatory</div>
              </div>
            </div>

            <div class="footer-bottom-row">
              <div class="qr-review-container">
                <img src="${GOOGLE_REVIEW_QR_BASE64}" alt="Google Review QR" class="qr-code-img" />
                <div class="qr-review-text">
                  <span class="qr-head">Review us on Google</span>
                  <span class="qr-desc">Scan QR to share your feedback</span>
                </div>
              </div>

              <div class="thanks-note-box">
                <div class="thanks-note-title">Thanks for choosing SRM</div>
                <div class="thanks-note-sub">We appreciate your visit & trust • Drive Safe!</div>
                ${pagesHtml.length > 1 ? `<div class="page-indicator">Page ${index + 1} of ${pagesHtml.length}</div>` : ''}
              </div>
            </div>
          </div>

        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice — ${filter.number_plate} — SREE RAJA RAJESWARI MOTORS</title>
          <link rel="icon" href="${SRM_LOGO_BASE64}" />
          <style>
            .statement-card, .statement-card *, .statement-card *::before, .statement-card *::after { box-sizing: border-box; }
            @page { size: A4 portrait; margin: 6mm 6mm 10mm 6mm; }
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 0; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .statement-card { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0f172a; width: 736px; min-height: 940px; display: flex; flex-direction: column; max-width: 100%; margin: 0 auto; background: #ffffff; border: 2px solid #0f172a; outline: 2px solid #b91c1c; outline-offset: -4px; border-radius: 4px; padding: 8px 14px 10px 14px; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid; }
            .statement-card .top-invoice-title { text-align: center; font-size: 16px; font-weight: 900; color: #b91c1c; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 4px; padding-bottom: 2px; border-bottom: 1.5px dashed #cbd5e1; }
            .statement-card .header-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1.5px solid #b91c1c; padding-bottom: 6px; margin-bottom: 6px; page-break-inside: avoid; }
            .statement-card .brand-section { display: flex; gap: 8px; align-items: center; }
            .statement-card .brand-logo-img { height: 44px; max-width: 150px; object-fit: contain; display: block; }
            .statement-card .company-name { font-size: 17px; font-weight: 900; color: #0f172a; letter-spacing: -0.3px; line-height: 1.1; }
            .statement-card .company-sub { font-size: 9px; color: #475569; font-weight: 700; text-transform: uppercase; margin-top: 1px; letter-spacing: 0.5px; }
            .statement-card .company-address { font-size: 9px; color: #334155; font-weight: 600; margin-top: 2px; }
            .statement-card .statement-title-box { text-align: right; font-size: 10.5px; }
            .statement-card .meta-line { margin-top: 1.5px; color: #334155; font-size: 10px; }
            .statement-card .meta-line strong { color: #0f172a; font-family: monospace; font-size: 11px; }
            
            .statement-card .details-row { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 4px; padding: 5px 12px; margin-bottom: 8px; font-size: 10.5px; page-break-inside: avoid; }
            .statement-card .details-item { display: flex; gap: 4px; align-items: baseline; }
            .statement-card .details-label { font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 9px; }
            .statement-card .details-val { font-weight: 800; color: #0f172a; font-size: 11px; }
            
            .statement-card table { width: 100%; border-collapse: collapse; border: 1.5px solid #0f172a; margin-bottom: 8px; font-size: 9px; page-break-inside: auto; background: #ffffff; }
            .statement-card thead { display: table-header-group; }
            .statement-card th { background: #0f172a; color: #ffffff; padding: 5px 8px; font-size: 8.5px; text-transform: uppercase; font-weight: 800; text-align: left; letter-spacing: 0.5px; border: 1px solid #334155; }
            .statement-card td { border: 1px solid #cbd5e1; padding: 4.5px 8px; vertical-align: middle; }
            .statement-card tbody tr:nth-child(even) { background-color: #f8fafc; }
            .statement-card tbody tr:nth-child(odd) { background-color: #ffffff; }
            .statement-card tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            
            .statement-card .grand-summary-box { background: #f8fafc; border: 1.5px solid #0f172a; border-radius: 4px; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; margin-top: 6px; margin-bottom: 6px; page-break-inside: avoid; break-inside: avoid; }
            .statement-card .grand-summary-title { font-size: 9.5px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
            .statement-card .grand-summary-sub { font-size: 8.5px; color: #475569; }
            .statement-card .grand-summary-amount { font-size: 15px; font-weight: 900; font-family: monospace; color: #0f172a; }
            
            .statement-card .bottom-sign-container { border-top: 1.5px solid #cbd5e1; margin-top: auto; padding-top: 6px; page-break-inside: avoid; break-inside: avoid; }
            .statement-card .signatures-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px; }
            .statement-card .customer-sign-box { text-align: left; }
            .statement-card .sig-line { width: 150px; border-bottom: 1.5px solid #0f172a; margin-bottom: 3px; }
            .statement-card .sig-label { font-size: 8px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; }
            .statement-card .owner-sign-box { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
            .statement-card .owner-company-title { font-size: 9px; font-weight: 800; color: #0f172a; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.3px; }
            
            .statement-card .footer-bottom-row { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e2e8f0; padding-top: 5px; margin-top: 3px; }
            .statement-card .qr-review-container { display: flex; align-items: center; gap: 6px; }
            .statement-card .qr-code-img { width: 36px; height: 36px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px; background: #ffffff; display: block; }
            .statement-card .qr-review-text { font-size: 8px; line-height: 1.25; color: #475569; }
            .statement-card .qr-head { font-weight: 800; color: #0f172a; display: block; font-size: 8px; }
            .statement-card .qr-desc { font-size: 7px; color: #64748b; }
            .statement-card .thanks-note-box { text-align: right; }
            .statement-card .thanks-note-title { font-size: 10px; font-weight: 800; color: #b91c1c; letter-spacing: 0.5px; text-transform: uppercase; }
            .statement-card .thanks-note-sub { font-size: 7.5px; color: #475569; margin-top: 1px; }
            .statement-card .page-indicator { font-size: 8px; color: #94a3b8; margin-top: 1px; font-weight: 600; }
            @media print { 
              html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; } 
              .statement-card { 
                margin: 0 auto !important; 
                border: 2px solid #0f172a !important; 
                outline: 2px solid #b91c1c !important; 
                outline-offset: -4px !important; 
                min-height: 940px !important; 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important; 
                page-break-inside: avoid !important; 
                break-inside: avoid !important; 
              } 
            }
          </style>
        </head>
        <body>
          ${finalPagesHtml}
        </body>
      </html>
    `;
  }

  /**
   * Action 1: Print Single Invoice
   */
  static printInvoice(invoice: Invoice): void {
    const htmlContent = this.generateInvoiceHtml(invoice);
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  }

  /**
   * Action 2: Download Single Invoice Binary PDF
   * Uses html2pdf.js for true binary PDF generation with multi-page handling
   */
  static async downloadInvoicePdf(invoice: Invoice): Promise<void> {
    const cleanInvoiceNo = invoice.invoice_number.replace(/^#/, '');
    const filename = `SRM_Invoice_${cleanInvoiceNo}_${invoice.number_plate}.pdf`;
    const htmlContent = this.generateInvoiceHtml(invoice);
    
    try {
      const pdfBlob = await this.generatePdfBlob(htmlContent, filename);
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('PDF generation failed, falling back to HTML download:', err);
      this.fallbackDownloadHtml(htmlContent, filename.replace('.pdf', '.html'));
    }
  }

  /**
   * Action 3: Share Single Invoice via WhatsApp (Uses Web Share API with PDF file when supported)
   */
  static async shareInvoiceViaWhatsApp(invoice: Invoice): Promise<void> {
    const cleanInvoiceNo = invoice.invoice_number.replace(/^#/, '');
    const filename = `SRM_Invoice_${cleanInvoiceNo}_${invoice.number_plate}.pdf`;
    const htmlContent = this.generateInvoiceHtml(invoice);
    
    try {
      const pdfBlob = await this.generatePdfBlob(htmlContent, filename);
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });
      
      // Try Web Share API with PDF file (works on mobile)
      if (typeof navigator.share === 'function' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: `SRM Invoice ${cleanInvoiceNo}`,
          text: `SREE RAJA RAJESWARI MOTORS Service Invoice ${cleanInvoiceNo} for vehicle ${invoice.number_plate}`,
          files: [pdfFile]
        });
        return;
      }
      
      // Desktop fallback: Download PDF first, then open WhatsApp with text message
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
      const url = this.getWhatsAppShareUrl(invoice);
      setTimeout(() => window.open(url, '_blank'), 500);
    } catch (err) {
      console.error('WhatsApp share failed:', err);
      const url = this.getWhatsAppShareUrl(invoice);
      window.open(url, '_blank');
    }
  }

  /**
   * Action 4: Print Multi-Bill Combined Statement
   */
  static printStatement(invoices: Invoice[], filter: PrintSearchFilter): void {
    const htmlContent = this.generateStatementHtml(invoices, filter);
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  }

  /**
   * Action 5: Download Multi-Bill Combined Statement Binary PDF
   */
  static async downloadStatementPdf(invoices: Invoice[], filter: PrintSearchFilter): Promise<void> {
    const filename = `SRM_Statement_${filter.number_plate}_${filter.mode}.pdf`;
    const htmlContent = this.generateStatementHtml(invoices, filter);

    try {
      const pdfBlob = await this.generatePdfBlob(htmlContent, filename);
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('PDF generation failed, falling back to HTML download:', err);
      this.fallbackDownloadHtml(htmlContent, filename.replace('.pdf', '.html'));
    }
  }

  /**
   * Action 6: Share Multi-Bill Statement via WhatsApp (Uses Web Share API with PDF file when supported)
   */
  static async shareStatementViaWhatsApp(invoices: Invoice[], filter: PrintSearchFilter): Promise<void> {
    const filename = `SRM_Statement_${filter.number_plate}_${filter.mode}.pdf`;
    const htmlContent = this.generateStatementHtml(invoices, filter);

    try {
      const pdfBlob = await this.generatePdfBlob(htmlContent, filename);
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });
      
      if (typeof navigator.share === 'function' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: `SRM Statement — ${filter.number_plate}`,
          text: `SREE RAJA RAJESWARI MOTORS Combined Statement for vehicle ${filter.number_plate}`,
          files: [pdfFile]
        });
        return;
      }
      
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      
      const url = this.getStatementWhatsAppUrl(invoices, filter);
      setTimeout(() => window.open(url, '_blank'), 500);
    } catch (err) {
      console.error('WhatsApp share failed:', err);
      const url = this.getStatementWhatsAppUrl(invoices, filter);
      window.open(url, '_blank');
    }
  }

  /**
   * Fallback download method
   */
  private static fallbackDownloadHtml(htmlContent: string, filename: string): void {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
