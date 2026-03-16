import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

interface TaxInvoiceData {
    taxInvoiceNo: string;
    date: string;
    transactionNo: string;
    transactionDate: string;
    ownerName: string;
    tenantName: string;
    contractNumber?: string;
    installmentNumber?: string;
    ownerTaxNumber?: string;
    tenantTaxNumber?: string;
    paymentMethod: string;
    baseAmount: number;
    discount: number;
    netBeforeTax: number;
    taxRate: number;
    vatAmount: number;
    netAfterTax: number;
    notes?: string;
}

function getLogoSvg(): string {
    try {
        const logoPath = path.join(process.cwd(), "public", "logo.svg");
        return fs.readFileSync(logoPath, "utf-8");
    } catch (error) {
        console.error("Failed to load logo SVG:", error);
        return "";
    }
}

const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
        return dateString;
    }
};

const formatCurrency = (amount: number): string => `OMR ${amount.toFixed(3)}`;

const getPaymentMethodLabel = (method: string): { en: string; ar: string } => {
    const labels: Record<string, { en: string; ar: string }> = {
        cash: { en: "Cash", ar: "نقداً" },
        card: { en: "Card", ar: "بطاقة" },
        bank_transfer: { en: "Bank Transfer", ar: "تحويل بنكي" },
        cheque: { en: "Cheque", ar: "شيك" },
    };
    return labels[method] || { en: method, ar: method };
};

function generateHTML(data: TaxInvoiceData, logoSvg: string): string {
    const paymentMethod = getPaymentMethodLabel(data.paymentMethod);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Invoice - ${data.taxInvoiceNo}</title>
    <style>
        @page { size: A4; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        body { background-color: white; color: #333; line-height: 1.4; }
        .receipt-page { width: 210mm; min-height: 148mm; background: white; position: relative; padding: 15mm; }
        .letterhead { padding: 3mm 0 4mm; border-bottom: 2px solid #cea26e; margin-bottom: 8mm; }
        .letterhead-row { display: flex; justify-content: space-between; align-items: center; }
        .letterhead-left { width: 30%; }
        .letterhead-center { width: 40%; text-align: center; display: flex; justify-content: center; }
        .letterhead-center svg { max-width: 150px; height: auto; }
        .letterhead-right { width: 30%; text-align: right; font-size: 10pt; }
        .receipt-title { text-align: center; margin-bottom: 8mm; }
        .receipt-title h1 { font-size: 24pt; color: #605c53; margin-bottom: 2mm; }
        .receipt-title .receipt-no { font-size: 14pt; color: #cea26e; font-weight: bold; }
        .receipt-content { border: 1px solid #ddd; padding: 6mm; margin-bottom: 4mm;}
        .info-row { display: flex; border-bottom: 1px solid #eee; padding: 3mm 0; }
        .info-row:last-child { border-bottom: none; }
        .info-label { width: 30%; font-weight: 600; color: #605c53; }
        .info-value { width: 40%; text-align: center; }
        .info-label-ar { width: 30%; text-align: right; font-weight: 600; color: #605c53; direction: rtl; }
        .amounts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 4mm;
        }
        .amount-box {
            background: #f8f9fa;
            border: 1px solid #ddd;
            padding: 4mm;
            text-align: center;
        }
        .amount-box.highlight {
            border: 2px solid #cea26e;
            background: #fff;
        }
        .amount-label { font-size: 10pt; color: #605c53; margin-bottom: 1mm; font-weight: 600;}
        .amount-value { font-size: 14pt; font-weight: bold; color: #333; }
        .amount-box.highlight .amount-value { font-size: 18pt; color: #cea26e; }
        .footer { margin-top: 15mm; display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 5mm; }
        .signature-box { width: 40%; text-align: center; }
        .signature-line { border-bottom: 1px solid #333; margin-top: 15mm; margin-bottom: 2mm; }
        .notes-section { font-size: 10pt; color: #666; font-style: italic; margin-top: 2mm;}
    </style>
</head>
<body>
    <div class="receipt-page">
        <!-- Letterhead -->
        <div class="letterhead">
            <div class="letterhead-row">
                <div class="letterhead-left">
                    <strong>Telal Al Bidaya</strong><br>
                    Real Estate & Investment<br>
                    CR: 11223344
                </div>
                <div class="letterhead-center">
                    ${logoSvg}
                </div>
                <div class="letterhead-right" dir="rtl">
                    <strong>تلال البداية</strong><br>
                    للعقارات والاستثمار<br>
                    سجل تجاري: ١١٢٢٣٣٤٤
                </div>
            </div>
        </div>

        <div class="receipt-title">
            <h1>TAX INVOICE | فاتورة ضريبية</h1>
            <div class="receipt-no">${data.taxInvoiceNo}</div>
            <div style="color: #666; font-size: 10pt; margin-top: 1mm;">Date / التاريخ: ${formatDate(data.date)}</div>
        </div>

        <div class="receipt-content">
            <div class="info-row">
                <div class="info-label">Original Inv. No</div>
                <div class="info-value text-red">${data.transactionNo}</div>
                <div class="info-label-ar">رقم الفاتورة الأصلية</div>
            </div>
            <div class="info-row">
                <div class="info-label">Property Owner</div>
                <div class="info-value">${data.ownerName} <br/> <small>Tax No: ${data.ownerTaxNumber || '-'}</small></div>
                <div class="info-label-ar">مالك العقار</div>
            </div>
            <div class="info-row">
                <div class="info-label">Customer / Tenant</div>
                <div class="info-value">${data.tenantName} <br/> <small>Tax No: ${data.tenantTaxNumber || '-'}</small></div>
                <div class="info-label-ar">العميل / المستأجر</div>
            </div>
            ${data.contractNumber ? `
            <div class="info-row">
                <div class="info-label">Contract Number</div>
                <div class="info-value">${data.contractNumber}</div>
                <div class="info-label-ar">رقم العقد</div>
            </div>` : ''}
            <div class="info-row">
                <div class="info-label">Payment Method</div>
                <div class="info-value">${paymentMethod.en}</div>
                <div class="info-label-ar">${paymentMethod.ar}</div>
            </div>
        </div>

        <div class="amounts-grid">
            <div class="amount-box">
                <div class="amount-label">Base Amount / المبلغ الأساسي</div>
                <div class="amount-value">${formatCurrency(data.baseAmount)}</div>
            </div>
            <div class="amount-box">
                <div class="amount-label">Discount / خصم</div>
                <div class="amount-value text-red">${formatCurrency(data.discount)}</div>
            </div>
            <div class="amount-box">
                <div class="amount-label">Net Before Tax / الصافي قبل الضريبة</div>
                <div class="amount-value">${formatCurrency(data.netBeforeTax)}</div>
            </div>
            <div class="amount-box">
                <div class="amount-label">VAT / ضريبة القيمة المضافة (${data.taxRate}%)</div>
                <div class="amount-value">${formatCurrency(data.vatAmount)}</div>
            </div>
        </div>

        <div class="amount-box highlight" style="margin-bottom: 4mm;">
            <div class="amount-label">Net After Tax / الإجمالي الشامل للضريبة</div>
            <div class="amount-value">${formatCurrency(data.netAfterTax)}</div>
        </div>

        ${data.notes ? `
        <div class="notes-section">
            <strong>Notes / ملاحظات:</strong> ${data.notes}
        </div>` : ''}

        <div class="footer">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Authorized Signature<br>توقيع المعتمد</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div>Customer Signature<br>توقيع العميل</div>
            </div>
        </div>

    </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
    let browser = null;
    try {
        const body = await req.json();
        
        if (!body.taxInvoice || !body.taxInvoice.taxInvoiceNo) {
            return NextResponse.json({ error: "Invalid tax invoice data provided" }, { status: 400 });
        }

        const logoSvg = getLogoSvg();
        const html = generateHTML(body.taxInvoice, logoSvg);

        const isWindows = process.platform === "win32";
        let defaultExecutablePath = "";

        if (isWindows) {
            const possiblePaths = [
                "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
                "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
                "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
                "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
            ];

            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    defaultExecutablePath = p;
                    break;
                }
            }

            if (!defaultExecutablePath) {
                return NextResponse.json({ error: "Could not find Chrome or Edge executable." }, { status: 500 });
            }
        } else {
            defaultExecutablePath = process.env.CHROME_BIN || "/usr/bin/google-chrome";
        }

        browser = await puppeteer.launch({
            executablePath: defaultExecutablePath,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: true,
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "0", right: "0", bottom: "0", left: "0" },
        });

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="tax_invoice_${body.taxInvoice.taxInvoiceNo}.pdf"`,
            },
        });

    } catch (error: any) {
        console.error("PDF generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate PDF", details: error.message },
            { status: 500 }
        );
    } finally {
        if (browser) {
            await browser.close().catch(console.error);
        }
    }
}
