import type { Invoice, PrintSearchFilter } from '../types/billing';
import { SRM_LOGO_BASE64 } from '../assets/logoBase64';

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
    wrapper.style.position = 'fixed';
    wrapper.style.top = '100vh';
    wrapper.style.left = '0';
    wrapper.style.width = '100vw';
    wrapper.style.height = '100vh';
    wrapper.style.overflow = 'hidden';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '-1';

    const container = document.createElement('div');
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
      bodyDiv.style.padding = '10px 0';
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
        margin: [4, 0, 6, 0], // Zero horizontal margin so 794px canvas maps 1-to-1 centered on A4
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
`🚘 *SREE RAJA RAJESWARI MOTORS — COMBINED STATEMENT* 🚘
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
   * Includes bottom-left address: #184, Renigunta Road, S.V. Autonagar, Tirupati.
   * Includes multi-page CSS break handling.
   */
    static generateInvoiceHtml(invoice: Invoice): string {
    const formattedDate = new Date(invoice.created_at || Date.now()).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const cleanInvoiceNo = invoice.invoice_number.replace(/^#/, '');
    const labourTotal = invoice.items.filter((i) => i.work_type === 'Labour').reduce((sum, i) => sum + i.amount, 0);
    const partTotal = invoice.items.filter((i) => i.work_type === 'Part').reduce((sum, i) => sum + i.amount, 0);

    const ITEMS_PER_PAGE = 15;
    const pages: any[][] = [];
    for (let i = 0; i < invoice.items.length; i += ITEMS_PER_PAGE) {
      pages.push(invoice.items.slice(i, i + ITEMS_PER_PAGE));
    }
    if (pages.length === 0) pages.push([]);

    const pagesHtml = pages.map((pageItems, pageIndex) => {
      const isLastPage = pageIndex === pages.length - 1;
      const itemsRows = pageItems.map((item) => `
        <tr style="page-break-inside: avoid; break-inside: avoid;">
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; text-align: center;">${item.s_no}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${item.work_name}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">
            <span style="padding: 3px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; border-radius: 4px; ${item.work_type === 'Labour' ? 'background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1;' : 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;'}">${item.work_type}</span>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 600;">${item.quantity}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; text-align: right;">₹${item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: 700; text-align: right; color: #0f172a;">₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('');

      const totalsHtml = isLastPage ? `
        <tfoot>
          <tr style="background: #f8fafc; border-top: 2px solid #cbd5e1;">
            <td colspan="4"></td>
            <td style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 700; color: #475569;">Labour Subtotal:</td>
            <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">₹${labourTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td colspan="4"></td>
            <td style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 700; color: #475569;">Parts Subtotal:</td>
            <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">₹${partTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr style="background: #f1f5f9; border-top: 2px solid #0f172a;">
            <td colspan="4"></td>
            <td style="padding: 12px 12px; text-align: right; font-size: 12px; font-weight: 900; color: #b91c1c;">GRAND TOTAL:</td>
            <td style="padding: 12px 12px; text-align: right; font-family: monospace; font-size: 16px; font-weight: 900; color: #0f172a;">₹${invoice.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      ` : `
        <tfoot>
          <tr style="background: #f1f5f9; border-top: 2px solid #cbd5e1;">
            <td colspan="6" style="padding: 12px; text-align: center; font-size: 11px; font-style: italic; color: #64748b;">Continued on next page...</td>
          </tr>
        </tfoot>
      `;

      return `
        <div class="invoice-card" ${pageIndex < pages.length - 1 ? 'style="page-break-after: always; break-after: page; margin-bottom: 20px;"' : ''}>
          <div class="header-bar">
            <div class="brand-section">
              <img src="${SRM_LOGO_BASE64}" alt="SREE RAJA RAJESWARI MOTORS Logo" class="brand-logo-img" />
              <div>
                <div class="company-name">SREE RAJA RAJESWARI MOTORS</div>
                <div class="company-sub">Multi-Brand Car Service & Repair Workshop</div>
              </div>
            </div>
            <div class="invoice-meta">
              <div class="invoice-title">SERVICE INVOICE</div>
              <div class="meta-line">Invoice: <strong>${cleanInvoiceNo}</strong></div>
              <div class="meta-line">Date: <strong>${formattedDate}</strong></div>
            </div>
          </div>

          <div class="details-grid">
            <div>
              <span class="details-label">Vehicle Number Plate</span>
              <span class="details-val" style="font-family: monospace; color: #b91c1c; font-size: 15px;">${invoice.number_plate}</span>
            </div>
            <div>
              <span class="details-label">Mobile Number</span>
              <span class="details-val">${invoice.mobile_number || 'N/A'}</span>
            </div>
            <div>
              <span class="details-label">Payment Status</span>
              <span class="details-val" style="color: #166534;">PAID / VERIFIED</span>
            </div>
          </div>

          <table style="flex-grow: 1;">
            <thead>
              <tr>
                <th style="width: 45px; text-align: center;">S.No</th>
                <th>Work Description</th>
                <th style="width: 85px;">Type</th>
                <th style="width: 60px; text-align: center;">Qty</th>
                <th style="width: 100px; text-align: right;">Rate (₹)</th>
                <th style="width: 110px; text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
            ${totalsHtml}
          </table>

          <div style="flex-grow: 1;"></div>

          <div class="footer-line-container">
            <div class="footer-address">
              #184, Renigunta Road, S.V. Autonagar, Tirupati.
            </div>
            <div class="footer-thanks">
              ${pages.length > 1 ? `Page ${pageIndex + 1} of ${pages.length} &nbsp;|&nbsp; ` : ''}Thank you for choosing <strong>SREE RAJA RAJESWARI MOTORS</strong>!
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
            *, *::before, *::after { box-sizing: border-box; }
            @page { size: A4 portrait; margin: 8mm; }
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 10px 0; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .invoice-card { width: 745px; min-height: 1060px; display: flex; flex-direction: column; max-width: 100%; margin: 0 auto; background: #ffffff; border: 2px solid #0f172a; outline: 2px solid #b91c1c; outline-offset: -5px; border-radius: 8px; padding: 26px 30px; box-sizing: border-box; }
            .header-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #b91c1c; padding-bottom: 18px; margin-bottom: 22px; page-break-inside: avoid; }
            .brand-section { display: flex; flex-col; gap: 8px; }
            .brand-logo-img { height: 60px; max-width: 260px; object-fit: contain; display: block; }
            .company-name { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.3px; margin-top: 6px; }
            .company-sub { font-size: 11px; color: #475569; font-weight: 600; text-transform: uppercase; margin-top: 2px; letter-spacing: 0.5px; }
            .invoice-meta { text-align: right; font-size: 13px; }
            .invoice-title { font-size: 20px; font-weight: 900; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.5px; }
            .meta-line { margin-top: 6px; color: #334155; font-size: 12px; }
            .meta-line strong { color: #0f172a; font-family: monospace; font-size: 13px; }
            .details-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; background: #f8fafc; padding: 14px 18px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 22px; font-size: 12px; page-break-inside: avoid; }
            .details-label { color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 2px; }
            .details-val { font-weight: 700; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 12px; page-break-inside: auto; }
            thead { display: table-header-group; }
            th { background: #0f172a; color: #ffffff; padding: 10px 12px; font-size: 10px; text-transform: uppercase; font-weight: 700; text-align: left; letter-spacing: 0.5px; }
            tr { page-break-inside: avoid !important; break-inside: avoid !important; }
            .footer-line-container { border-top: 1px solid #cbd5e1; margin-top: auto; padding-top: 12px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #475569; page-break-inside: avoid; break-inside: avoid; }
            .footer-address { font-weight: 700; color: #0f172a; font-size: 11px; }
            .footer-thanks { font-weight: 600; color: #64748b; font-size: 11px; text-align: right; }
            @media print { body { padding: 0; background: #fff; } .invoice-card { border: 2px solid #0f172a; outline: 2px solid #b91c1c; outline-offset: -5px; } }
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
    const modeLabels: Record<string, string> = {
      till_now: 'Option 1: Till Now (All Invoices)',
      between_dates: `Option 2: Between ${filter.start_date || ''} and ${filter.end_date || ''}`,
      after_date: `Option 3: After Date ${filter.start_date || ''}`
    };
    const statementGrandTotal = invoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0);

    const PAGE_CAPACITY = 20; // safe maximum lines per page
    const pagesHtml: string[] = [];
    let currentWeight = 0;
    let currentPageContent = '';
    let invoiceOpen = false;

    invoices.forEach((inv, idx) => {
      const invDate = new Date(inv.created_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const cleanInvoiceNo = inv.invoice_number.replace(/^#/, '');
      
      const headerHtml = `
        <div class="event-block" style="margin-bottom: 0; border: 1px solid #cbd5e1; border-bottom: none; border-radius: 6px 6px 0 0; overflow: hidden; page-break-inside: avoid; break-inside: avoid;">
          <div style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
            <div>
              <strong style="color: #0f172a;">Event: ${idx + 1}</strong> &nbsp;|&nbsp; 
              <span style="color: #475569;">Invoice: <strong style="font-family: monospace; color: #0f172a;">${cleanInvoiceNo}</strong></span>
            </div>
            <div style="color: #475569; font-size: 12px;">
              Date: <strong style="color: #0f172a;">${invDate}</strong>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; background: #ffffff;">
            <thead>
              <tr style="background: #0f172a; color: #ffffff; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;">
                <th style="padding: 8px 10px; text-align: center; width: 45px;">S.No</th>
                <th style="padding: 8px 10px; text-align: left;">Work Description</th>
                <th style="padding: 8px 10px; text-align: left; width: 80px;">Type</th>
                <th style="padding: 8px 10px; text-align: center; width: 50px;">Qty</th>
                <th style="padding: 8px 10px; text-align: right; width: 90px;">Rate (₹)</th>
                <th style="padding: 8px 10px; text-align: right; width: 100px;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      const footerHtml = `
            </tbody>
            <tfoot>
              <tr style="background: #f1f5f9; font-weight: 700; border-top: 2px solid #0f172a;">
                <td colspan="5" style="padding: 8px 10px; text-align: right; font-size: 11px; color: #334155;">Event Total:</td>
                <td style="padding: 8px 10px; text-align: right; font-family: monospace; font-size: 12px; font-weight: 800; color: #0f172a;">
                  ₹${inv.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style="height: 22px;"></div> <!-- Spacer after event block -->
      `;

      if (currentWeight + 3 > PAGE_CAPACITY && currentWeight > 0) {
        if (invoiceOpen) currentPageContent += `</tbody></table></div><div style="height: 22px;"></div>`;
        pagesHtml.push(currentPageContent);
        currentPageContent = '';
        currentWeight = 0;
        if (invoiceOpen) {
          currentPageContent += headerHtml;
          currentWeight += 2;
        }
      }

      if (!invoiceOpen) {
        currentPageContent += headerHtml;
        currentWeight += 2;
        invoiceOpen = true;
      }

      inv.items.forEach((item) => {
        if (currentWeight + 1 > PAGE_CAPACITY) {
          currentPageContent += `</tbody></table></div><div style="height: 22px;"></div>`;
          pagesHtml.push(currentPageContent);
          currentPageContent = headerHtml;
          currentWeight = 2;
        }
        currentPageContent += `
          <tr>
            <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; text-align: center;">${item.s_no}</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${item.work_name}</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">
              <span style="padding: 2px 6px; font-size: 9px; font-weight: 700; text-transform: uppercase; border-radius: 4px; ${item.work_type === 'Labour' ? 'background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1;' : 'background: #fef3c7; color: #92400e; border: 1px solid #fde68a;'}">${item.work_type}</span>
            </td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 600;">${item.quantity}</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; text-align: right;">₹${item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: 700; text-align: right; color: #0f172a;">₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
        currentWeight += 1;
      });

      if (currentWeight + 2 > PAGE_CAPACITY) {
        currentPageContent += `</tbody></table></div><div style="height: 22px;"></div>`;
        pagesHtml.push(currentPageContent);
        currentPageContent = headerHtml;
        currentWeight = 2;
      }
      currentPageContent += footerHtml;
      currentWeight += 2;
      invoiceOpen = false;
    });

    if (currentPageContent !== '') {
      pagesHtml.push(currentPageContent);
    }
    if (pagesHtml.length === 0) pagesHtml.push('');

    const finalPagesHtml = pagesHtml.map((content, index) => {
      const isLastPage = index === pagesHtml.length - 1;
      const grandSummaryHtml = isLastPage ? `
        <div class="grand-summary-box">
          <div>
            <div class="grand-summary-title">STATEMENT GRAND TOTAL</div>
            <div class="grand-summary-sub">
              Calculated sum across all ${invoices.length} billing events for vehicle <strong>${filter.number_plate}</strong>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="grand-summary-amount">₹ ${statementGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      ` : '';

      return `
        <div class="statement-card" ${index < pagesHtml.length - 1 ? 'style="page-break-after: always; break-after: page; margin-bottom: 20px;"' : ''}>
          <div class="header-bar">
            <div class="brand-section">
              <img src="${SRM_LOGO_BASE64}" alt="SREE RAJA RAJESWARI MOTORS Logo" class="brand-logo-img" />
              <div>
                <div class="company-name">SREE RAJA RAJESWARI MOTORS</div>
                <div class="company-sub">Multi-Brand Car Service & Repair Workshop</div>
              </div>
            </div>
            <div class="statement-title-box">
              <div class="statement-title-text">COMBINED STATEMENT</div>
              <div class="statement-date-text">Generated: ${generatedDate}</div>
            </div>
          </div>

          <div class="meta-banner">
            <div>
              <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #94a3b8;">VEHICLE NUMBER PLATE</div>
              <div class="plate-badge">${filter.number_plate}</div>
            </div>
            <div style="text-align: right;" class="filter-info">
              <div><strong>Range Filter:</strong> ${modeLabels[filter.mode] || filter.mode}</div>
              <div style="margin-top: 3px;"><strong>Total Events:</strong> ${invoices.length} Invoices</div>
            </div>
          </div>

          <div style="flex-grow: 1;">
            ${content}
            ${grandSummaryHtml}
          </div>

          <div class="footer-line-container">
            <div class="footer-address">
              #184, Renigunta Road, S.V. Autonagar, Tirupati.
            </div>
            <div class="footer-thanks">
              ${pagesHtml.length > 1 ? `Page ${index + 1} of ${pagesHtml.length} &nbsp;|&nbsp; ` : ''}Official Combined Statement — <strong>SREE RAJA RAJESWARI MOTORS</strong>
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
          <title>Statement — ${filter.number_plate} — SREE RAJA RAJESWARI MOTORS</title>
          <link rel="icon" href="${SRM_LOGO_BASE64}" />
          <style>
            *, *::before, *::after { box-sizing: border-box; }
            @page { size: A4 portrait; margin: 8mm; }
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 10px 0; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .statement-card { width: 745px; min-height: 1060px; display: flex; flex-direction: column; max-width: 100%; margin: 0 auto; background: #ffffff; border: 2px solid #0f172a; outline: 2px solid #b91c1c; outline-offset: -5px; border-radius: 8px; padding: 26px 30px; box-sizing: border-box; }
            .header-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #b91c1c; padding-bottom: 18px; margin-bottom: 22px; page-break-inside: avoid; }
            .brand-section { display: flex; flex-col; gap: 8px; }
            .brand-logo-img { height: 60px; max-width: 260px; object-fit: contain; display: block; }
            .company-name { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.3px; margin-top: 6px; }
            .company-sub { font-size: 11px; color: #475569; font-weight: 600; text-transform: uppercase; margin-top: 2px; letter-spacing: 0.5px; }
            .statement-title-box { text-align: right; }
            .statement-title-text { font-size: 18px; font-weight: 900; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.5px; }
            .statement-date-text { font-size: 11px; color: #475569; margin-top: 4px; }
            .meta-banner { display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #ffffff; padding: 14px 20px; border-radius: 6px; margin-bottom: 22px; page-break-inside: avoid; }
            .plate-badge { font-size: 20px; font-family: monospace; font-weight: 900; color: #fca5a5; letter-spacing: 1px; }
            .filter-info { font-size: 11px; color: #cbd5e1; }
            .grand-summary-box { background: #f8fafc; border: 2px solid #0f172a; border-radius: 6px; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 25px; page-break-inside: avoid; break-inside: avoid; }
            .grand-summary-title { font-size: 12px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
            .grand-summary-sub { font-size: 11px; color: #475569; margin-top: 2px; }
            .grand-summary-amount { font-size: 22px; font-weight: 900; font-family: monospace; color: #0f172a; }
            .footer-line-container { border-top: 1px solid #cbd5e1; margin-top: auto; padding-top: 12px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #475569; page-break-inside: avoid; break-inside: avoid; }
            .footer-address { font-weight: 700; color: #0f172a; font-size: 11px; }
            .footer-thanks { font-weight: 600; color: #64748b; font-size: 11px; text-align: right; }
            @media print { body { padding: 0; background: #fff; } .statement-card { border: 2px solid #0f172a; outline: 2px solid #b91c1c; outline-offset: -5px; } }
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
