import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

interface SaleContractInstallmentPdf {
    amount: number;
    amountWords?: string;
    dueDate?: string | null;
    label?: string | null;
    order: number;
}

// Sale Contract interface
interface SaleContract {
    id?: string;
    contractNumber: string;
    // Seller
    sellerId?: string;
    sellerCivilId?: string;
    sellerNationalId?: string;
    sellerName: string;
    sellerCR?: string;
    sellerNationality?: string;
    sellerAddress?: string;
    sellerPhone?: string;
    // Buyer
    buyerId?: string;
    buyerCivilId?: string;
    buyerNationalId?: string;
    buyerName: string;
    buyerCR?: string;
    buyerNationality?: string;
    buyerAddress?: string;
    buyerPhone?: string;
    // Property
    propertyWilaya: string;
    propertyGovernorate?: string;
    propertyPhase?: string;
    propertyLandNumber?: string;
    propertyArea?: string;
    propertyBuiltUpArea?: string;
    propertyDistrictNumber?: string;
    propertyStreetNumber?: string;
    propertyLocation?: string;
    propertyMapNumber?: string;
    // Payment
    totalPrice: number;
    totalPriceWords?: string;
    depositAmount?: number;
    depositAmountWords?: string;
    remainingAmount?: number;
    remainingAmountWords?: string;
    installments?: SaleContractInstallmentPdf[];
    // Construction
    constructionStartDate?: string;
    constructionEndDate?: string;
    contractNotes?: string;
    notes?: string;
    // Signatures
    sellerSignature?: string;
    buyerSignature?: string;
    createdAt: string;
}

// Get logo as SVG string
function getLogoSvg(): string {
    try {
        const logoPath = path.join(process.cwd(), "public", "logo.svg");
        return fs.readFileSync(logoPath, "utf-8");
    } catch (error) {
        console.error("Failed to load logo SVG:", error);
        return "";
    }
}

// Helper to format date
const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
        return dateString;
    }
};

// Generate HTML from template with contract data
function generateHTML(contract: SaleContract, logoSvg: string): string {
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>عقد بيع منزل سكني - ${contract.contractNumber}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Tajawal', sans-serif;
            background-color: white;
            padding: 0;
            direction: rtl;
        }
        
        .page-container {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: white;
            position: relative;
            padding: 0;
            overflow: hidden;
        }
        
        .decorative-frame {
            position: absolute;
            top: 8mm;
            left: 8mm;
            right: 8mm;
            bottom: 8mm;
            border: 3px double #8B4513;
            pointer-events: none;
        }
        
        .decorative-frame::before {
            content: '';
            position: absolute;
            top: 3mm;
            left: 3mm;
            right: 3mm;
            bottom: 3mm;
            border: 1px solid #B8860B;
        }
        
        .corner-ornament {
            position: absolute;
            width: 40px;
            height: 40px;
            border-style: solid;
            border-color: #8B4513;
        }
        
        .corner-ornament::before,
        .corner-ornament::after {
            content: '';
            position: absolute;
            background-color: #8B4513;
        }
        
        .top-left-corner {
            top: 8mm;
            left: 8mm;
            border-width: 3px 0 0 3px;
        }
        
        .top-left-corner::before { width: 15px; height: 3px; top: -3px; left: 5px; }
        .top-left-corner::after { width: 3px; height: 15px; left: -3px; top: 5px; }
        
        .top-right-corner {
            top: 8mm;
            right: 8mm;
            border-width: 3px 3px 0 0;
        }
        
        .top-right-corner::before { width: 15px; height: 3px; top: -3px; right: 5px; }
        .top-right-corner::after { width: 3px; height: 15px; right: -3px; top: 5px; }
        
        .bottom-left-corner {
            bottom: 8mm;
            left: 8mm;
            border-width: 0 0 3px 3px;
        }
        
        .bottom-left-corner::before { width: 15px; height: 3px; bottom: -3px; left: 5px; }
        .bottom-left-corner::after { width: 3px; height: 15px; left: -3px; bottom: 5px; }
        
        .bottom-right-corner {
            bottom: 8mm;
            right: 8mm;
            border-width: 0 3px 3px 0;
        }
        
        .bottom-right-corner::before { width: 15px; height: 3px; bottom: -3px; right: 5px; }
        .bottom-right-corner::after { width: 3px; height: 15px; right: -3px; bottom: 5px; }
        
        .content-wrapper {
            position: relative;
            z-index: 1;
            padding: 14mm 18mm 25mm 18mm;
        }
        
        .header {
            text-align: center;
            margin-bottom: 10px;
        }
        
        .logo-placeholder {
            width: 300px;
            height: auto;
            margin: 0 auto 6px;
            display: ${logoSvg ? 'block' : 'none'};
        }
        
        .logo-placeholder svg {
            width: 100%;
            height: auto;
        }
        
        .company-name {
            font-size: 11px;
            color: #8B4513;
            font-weight: 700;
            margin-bottom: 4px;
            line-height: 1.5;
            letter-spacing: 0.3px;
        }
        
        .document-number {
            font-size: 11px;
            color: #333;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .document-title {
            font-size: 20px;
            font-weight: 900;
            color: #000;
            margin-bottom: 4px;
        }
        
        .document-subtitle {
            font-size: 11px;
            color: #333;
            line-height: 1.6;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
            font-size: 9.5px;
        }
        
        .info-table th,
        .info-table td {
            border: 1px solid #555;
            padding: 3px 6px;
            text-align: center;
        }
        
        .info-table th {
            background-color: #d3d3d3;
            font-weight: 700;
            color: #000;
        }
        
        .info-table td {
            background-color: #f9f9f9;
            font-weight: 400;
        }
        
        .terms-section {
            margin-bottom: 6px;
        }
        
        .term-item {
            margin-bottom: 4px;
            line-height: 1.55;
            font-size: 10px;
            text-align: justify;
            font-weight: 400;
        }
        
        .term-number {
            font-weight: 700;
            margin-left: 5px;
        }
        
        .highlight {
            background-color: #ffff00;
            padding: 2px 4px;
            font-weight: 600;
        }
        
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 12px;
            margin-bottom: 10px;
            gap: 20px;
        }
        
        .signature-box {
            text-align: center;
            width: 48%;
        }
        
        .signature-label {
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 25px;
            color: #8B4513;
        }
        
        .signature-line {
            border-top: 1.5px solid #333;
            margin-top: 25px;
            padding-top: 5px;
            font-size: 10px;
        }
        
        .disclaimer {
            font-size: 8px;
            color: #666;
            line-height: 1.5;
            margin-top: 10px;
            margin-bottom: 10px;
            text-align: center;
            padding: 8px 15px;
            background-color: #f9f9f9;
            border-radius: 4px;
        }
        
        .footer {
            text-align: center;
            padding-top: 8px;
            border-top: 2px solid #8B4513;
            margin-top: 10px;
        }
        
        .footer-content {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 25px;
            flex-wrap: wrap;
            font-size: 10px;
            color: #333;
            line-height: 1.4;
        }
        
        .footer-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .footer-icon {
            width: 24px;
            height: 24px;
            background-color: #8B4513;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            flex-shrink: 0;
        }
        
        .footer-item span:not(.footer-icon) {
            text-align: right;
        }
        
        @media print {
            body { padding: 0; background: white; }
            .page-container { box-shadow: none; width: 210mm; height: 297mm; margin: 0; }
        }
    </style>
</head>
<body>
    <div class="page-container">
        <div class="decorative-frame"></div>
        
        <div class="corner-ornament top-left-corner"></div>
        <div class="corner-ornament top-right-corner"></div>
        <div class="corner-ornament bottom-left-corner"></div>
        <div class="corner-ornament bottom-right-corner"></div>
        
        <div class="content-wrapper">
            <div class="header">
                ${logoSvg ? `<div class="logo-placeholder">${logoSvg}</div>` : ''}
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div class="document-number" style="margin-bottom: 0; text-align: left;">
                        #${contract.contractNumber}
                    </div>
                    <div class="document-number" style="margin-bottom: 0; text-align: right;">
                        الإصدار:الموافق ${formatDate(contract.createdAt)}
                    </div>
                </div>
                
                <h1 class="document-title">عقد بيع منزل سكني</h1>
                
                <p class="document-subtitle">
                    تم بحمد لله الإتفاق بين الأطراف الموضحة بياناتهم فيما يلي :
                </p>
            </div>

            <h3 style="font-size: 11px; font-weight: bold; margin-bottom: 3px; color: #8B4513; text-align: center; border-bottom: 1px solid #8B4513; padding-bottom: 2px;">بيـــانـــات الأطـــراف</h3>
            <table class="info-table">
                <thead>
                    <tr>
                        <th style="width:22%;">الطرف الثاني ( المشتري )</th>
                        <th style="width:22%;">الطرف الأول ( البائع )</th>
                        <th style="width:12%;">الأطراف</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${contract.buyerName || '-'}</td>
                        <td>${contract.sellerName || '-'}</td>
                        <td>الاسم</td>
                    </tr>
                    <tr>
                        <td>${contract.buyerNationalId || contract.buyerCivilId || '-'}</td>
                        <td>${contract.sellerNationalId || contract.sellerCivilId || contract.sellerCR || '-'}</td>
                        <td>الرقم المدني</td>
                    </tr>
                    <tr>
                        <td>${contract.buyerNationality || '-'}</td>
                        <td>${contract.sellerNationality || '-'}</td>
                        <td>الجنسية</td>
                    </tr>
                    <tr>
                        <td>${contract.buyerAddress || '-'}</td>
                        <td>${contract.sellerAddress || '-'}</td>
                        <td>العنوان</td>
                    </tr>
                    <tr>
                        <td>${contract.buyerPhone || '-'}</td>
                        <td>${contract.sellerPhone || '-'}</td>
                        <td>رقم الهاتف</td>
                    </tr>
                </tbody>
            </table>
            
            <h3 style="font-size: 13px; font-weight: bold; margin-bottom: 5px; margin-top: 10px; color: #8B4513; text-align: center;">بيانات العقار</h3>
            <table class="info-table">
                <tbody>
                    <tr>
                        <td>${contract.propertyLandNumber || '.........................'}</td>
                        <th style="width: 15%;">رقم الارض</th>
                        <td>${contract.propertyArea ? contract.propertyArea + ' متر مربع' : '.........................'}</td>
                        <th style="width: 15%;">مساحة الارض</th>
                    </tr>
                    <tr>
                        <td>${contract.propertyBuiltUpArea ? contract.propertyBuiltUpArea + ' متر مربع' : '.........................'}</td>
                        <th>مساحة البناء</th>
                        <td>${contract.propertyDistrictNumber || '.........................'}</td>
                        <th>رقم الحي</th>
                    </tr>
                    <tr>
                        <td>${contract.propertyGovernorate || contract.propertyWilaya || '.........................'}</td>
                        <th>المحافظة</th>
                        <td>${contract.propertyWilaya || '.........................'}</td>
                        <th>الولاية</th>
                    </tr>
                    <tr>
                        <td>${contract.propertyStreetNumber || '.........................'}</td>
                        <th>رقم السكة</th>
                        <td>${contract.propertyLocation || '.........................'}</td>
                        <th>المنطقة / الموقع</th>
                    </tr>
                    <tr>
                        <td colspan="3">${contract.propertyMapNumber || '.........................'}</td>
                        <th>رقم المخطط</th>
                    </tr>
                </tbody>
            </table>
            
            <h3 style="font-size: 11px; font-weight: bold; margin: 6px 0 4px; color: #8B4513; text-align: center; border-bottom: 1px solid #8B4513; padding-bottom: 2px;">بنود الاتفاق</h3>

            <div class="terms-section">
                <div class="term-item">
                    <span class="term-number">1-</span>
                    باع الطرف الأول إلى الطرف الثاني منزلًا سكنيًا جاهزًا مقامًا على قطعة الأرض رقم (${contract.propertyLandNumber || '........'})، الكائنة في محافظة ${contract.propertyGovernorate || '........'} – ولاية ${contract.propertyWilaya || '........'} – منطقة ${contract.propertyLocation || '........'}${contract.propertyPhase ? ` (${contract.propertyPhase})` : ''}، سلطنة عُمان.
                </div>

                <div class="term-item">
                    <span class="term-number">2-</span>
                    تم هذا الاتفاق مقابل مبلغ إجمالي قدره <strong>(${contract.totalPrice?.toLocaleString('en-US') || '0'})</strong> ${contract.totalPriceWords || '........'} ريال عماني فقط.
                </div>

                <div class="term-item">
                    <span class="term-number">3-</span>
                    يقر الطرف الأول بأنه استلم مبلغًا وقدره <strong>(${contract.depositAmount?.toLocaleString('en-US') || '........'})</strong> ${contract.depositAmountWords || '........'} ريال عماني كدفعة مقدمة من ثمن البيع.
                </div>

                <div class="term-item">
                    <span class="term-number">4-</span>
                    يقر الطرف الثاني بالتزامه بسداد المبلغ المتبقي وقدره <strong>(${contract.remainingAmount?.toLocaleString('en-US') || '........'})</strong> ${contract.remainingAmountWords || '........'} ريال عماني عند التنازل الرسمي في وزارة الإسكان.
                </div>

                <div class="term-item">
                    <span class="term-number">5-</span>
                    يقر الطرف الأول بأن العقار خالٍ من أي رهون أو حجوزات أو موانع قانونية، وفي حال ظهور خلاف ذلك يحق للطرف الثاني (المشتري) المطالبة برد كامل المبلغ المدفوع.
                </div>

                <div class="term-item">
                    <span class="term-number">6-</span>
                    يقر الطرف الثاني (المشتري) بأنه قام بمعاينة العقار واطلع على سند الملكية والكروكي الخاص به، وقد قبل به بحالته الراهنة، نافيًا للجهالة.
                </div>

                <div class="term-item">
                    <span class="term-number">7-</span>
                    يتعهد الطرف الأول بضمان الإنشاءات ضد العيوب مثل التسربات والتشققات، ولا يشمل الضمان غير ذلك، على أن تكون ضمانات المواد من مسؤولية الشركات الموردة.
                </div>

                <div class="term-item">
                    <span class="term-number">8-</span>
                    يتحمل الطرف الثاني تكلفة أي تعديلات أو إضافات يطلبها بعد توقيع هذه الاتفاقية.
                </div>

                ${contract.contractNotes ? `
                <div class="term-item" style="margin-top:4px;">
                    <strong style="color:#8B4513;">ملاحظات: </strong>${contract.contractNotes}
                </div>` : `
                <div class="term-item" style="margin-top:4px;">
                    <strong style="color:#8B4513;">ملاحظات: </strong>مدة تجهيز العقار والانتهاء من الأعمال من قبل المقاول هي (20) يومًا من تاريخ توقيع الاتفاقية، وفي حال طلب الطرف الثاني أي إضافات، يتم تمديد المدة حسب طبيعة الأعمال المطلوبة.
                </div>`}

                <div class="term-item" style="margin-top:6px; line-height:1.7;">
                    تم هذا الاتفاق بحضور الطرفين، وقد أقرا بأهليتهما القانونية للتعاقد والتصرف شرعًا وقانونًا، واتفقا على أن العلاقة بينهما تخضع لأحكام هذا العقد، حيث يُعد هذا العقد شريعة المتعاقدين.
                </div>
                <div class="term-item" style="line-height:1.7;">
                    وقد حُرر هذا العقد من نسختين، بيد كل طرف نسخة للعمل بموجبها، وتم التوقيع عليهما مع اعتماد الشركة.
                </div>
            </div>

            <h3 style="font-size: 11px; font-weight: bold; margin: 6px 0 4px; color: #8B4513; text-align: center;">جدول المدفوعات</h3>
            <table class="info-table" style="margin-bottom:10px">
                <thead>
                    <tr>
                        <th style="width:5%;">#</th>
                        <th>الدفعة</th>
                        <th>المبلغ (ر.ع)</th>
                        <th>كتابةً</th>
                        <th>التاريخ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>—</td>
                        <td>السعر الكلي</td>
                        <td>${contract.totalPrice?.toFixed(3) || '—'}</td>
                        <td>${contract.totalPriceWords || '—'}</td>
                        <td>—</td>
                    </tr>
                    ${(contract.installments && contract.installments.length > 0)
                        ? contract.installments.map((inst, idx) => `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${inst.label || `الدفعة ${idx + 1}`}</td>
                        <td>${inst.amount?.toFixed(3) || '—'}</td>
                        <td>${inst.amountWords || '—'}</td>
                        <td>${inst.dueDate ? formatDate(inst.dueDate) : '—'}</td>
                    </tr>`).join('')
                        : '<tr><td colspan="5" style="text-align:center;color:#999;">لا توجد دفعات مسجلة</td></tr>'
                    }
                    ${(contract.contractNotes || contract.notes) ? `
                    <tr>
                        <td colspan="5" style="text-align:right; background-color:#fffbf0; border-top: 2px solid #8B4513; padding: 6px 10px;">
                            <strong style="color:#8B4513;">الملاحظات الإضافية: </strong>${contract.contractNotes || contract.notes}
                        </td>
                    </tr>` : ''}
                </tbody>
            </table>

            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-label">توقيع الطرف الثاني:</div>
                    <div class="signature-line">${contract.buyerSignature || ''}</div>
                </div>
                
                <div class="signature-box">
                    <div class="signature-label">توقيع الطرف الأول:</div>
                    <div class="signature-line">${contract.sellerSignature || ''}</div>
                </div>
            </div>
            
            <div class="footer">
                <div>91939730 / 99371889 : تلفاكس - 316 : الرمز البريدي - 500 : ص.ب - 1603540 : ت.س</div>
                <div>CR:1603540, P.O. Box: 500, PCode: 316, GSM: 99371889 / 91939730, Sultanate of Oman</div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// Find Chrome executable path
function getChromePath(): string {
    const paths = [
        // Linux (Ubuntu/Debian VPS)
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/snap/bin/chromium",
        // Windows
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        (process.env.LOCALAPPDATA || "") + "\\Google\\Chrome\\Application\\chrome.exe",
        // Edge (as fallback)
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        // Mac
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    ];

    for (const p of paths) {
        try {
            fs.accessSync(p);
            return p;
        } catch {
            continue;
        }
    }

    throw new Error("Chrome/Chromium not found. Please install Chrome or Chromium.");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const contract: SaleContract = body.contract;

        if (!contract) {
            return NextResponse.json(
                { error: "Contract data is required" },
                { status: 400 }
            );
        }

        const chromePath = getChromePath();

        // Launch browser with memory-optimized settings
        const browser = await puppeteer.launch({
            executablePath: chromePath,
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-first-run",
            ],
        });

        const page = await browser.newPage();
        const logoSvg = getLogoSvg();
        const html = generateHTML(contract, logoSvg);

        await page.setContent(html, {
            waitUntil: "networkidle0",
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
        });

        await browser.close();

        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="sale-contract-${contract.contractNumber}.pdf"`,
            },
        });
    } catch (error) {
        console.error("PDF generation error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate PDF" },
            { status: 500 }
        );
    }
}
