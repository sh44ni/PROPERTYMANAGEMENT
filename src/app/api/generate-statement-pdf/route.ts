import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

// Transaction interface
interface Transaction {
    id: string;
    transactionNo: string;
    category: 'income' | 'expense';
    type: string;
    amount: number;
    paidBy: string;
    paymentMethod: string;
    date: string;
    description?: string;
}

// Statement request interface
interface StatementRequest {
    startDate: string;
    endDate: string;
    transactions: Transaction[];
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
}

// Get logo as base64 data URL
function getLogoDataUrl(): string {
    try {
        const logoPath = path.join(process.cwd(), "public", "logo-full.png");
        const logoBuffer = fs.readFileSync(logoPath);
        const base64 = logoBuffer.toString("base64");
        return `data:image/png;base64,${base64}`;
    } catch (error) {
        console.error("Failed to load logo:", error);
        return "";
    }
}

// Helper to format date
const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
        return dateString;
    }
};

// Helper to format currency
const formatCurrency = (amount: number): string => {
    return `OMR ${amount.toFixed(3)}`;
};

// Get type label
const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        'rent_payment': 'Rent Payment',
        'deposit': 'Deposit',
        'other_income': 'Other Income',
        'maintenance': 'Maintenance',
        'utilities': 'Utilities',
        'insurance': 'Insurance',
        'taxes': 'Taxes',
        'management_fees': 'Management Fees',
        'repairs': 'Repairs',
        'other_expense': 'Other Expense',
    };
    return labels[type] || type;
};

// Generate HTML statement
function generateHTML(data: StatementRequest, logoDataUrl: string): string {
    const statementDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

    // Separate income and expenses
    const incomeTransactions = data.transactions.filter(t => t.category === 'income');
    const expenseTransactions = data.transactions.filter(t => t.category === 'expense');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Financial Statement</title>
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        body {
            background-color: white;
            color: #333;
            font-size: 10pt;
            line-height: 1.4;
        }
        .page {
            max-width: 210mm;
            margin: 0 auto;
            padding: 0;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #cea26e;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .logo {
            width: 80px;
            height: auto;
        }
        .company-info h1 {
            font-size: 18pt;
            color: #cea26e;
            font-weight: 700;
            margin-bottom: 3px;
        }
        .company-info p {
            font-size: 8pt;
            color: #666;
        }
        .statement-info {
            text-align: right;
        }
        .statement-info h2 {
            font-size: 16pt;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .statement-info p {
            font-size: 9pt;
            color: #666;
            margin-bottom: 3px;
        }
        .statement-info .period {
            background: #cea26e;
            color: white;
            padding: 5px 12px;
            border-radius: 4px;
            display: inline-block;
            font-weight: 600;
            margin-top: 5px;
        }
        
        /* Summary Cards */
        .summary-section {
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
        }
        .summary-card {
            flex: 1;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-card.income {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }
        .summary-card.expense {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
        }
        .summary-card.net {
            background: linear-gradient(135deg, #cea26e 0%, #b8915f 100%);
            color: white;
        }
        .summary-card .label {
            font-size: 9pt;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        .summary-card .amount {
            font-size: 16pt;
            font-weight: 700;
        }
        
        /* Transaction Tables */
        .section-title {
            font-size: 12pt;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e5e7eb;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .section-title .icon {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10pt;
        }
        .section-title .icon.income { background: #10b981; color: white; }
        .section-title .icon.expense { background: #ef4444; color: white; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 9pt;
        }
        th {
            background: #f3f4f6;
            padding: 10px 8px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        th:last-child, td:last-child {
            text-align: right;
        }
        td {
            padding: 10px 8px;
            border-bottom: 1px solid #e5e7eb;
            color: #4b5563;
        }
        tr:nth-child(even) {
            background: #f9fafb;
        }
        .amount-positive {
            color: #059669;
            font-weight: 600;
        }
        .amount-negative {
            color: #dc2626;
            font-weight: 600;
        }
        .subtotal-row {
            background: #f3f4f6 !important;
            font-weight: 600;
        }
        .subtotal-row td {
            border-top: 2px solid #e5e7eb;
        }
        
        /* Footer */
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 8pt;
            color: #9ca3af;
        }
        .footer p {
            margin-bottom: 3px;
        }
        .footer .contact {
            color: #cea26e;
            font-weight: 500;
        }
        
        /* Empty state */
        .empty-state {
            text-align: center;
            padding: 20px;
            color: #9ca3af;
            font-style: italic;
        }
        
        @media print {
            body { padding: 0; }
            .page { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="page">
        <!-- Header -->
        <div class="header">
            <div class="logo-section">
                ${logoDataUrl ? `<img src="${logoDataUrl}" alt="Logo" class="logo" />` : ''}
                <div class="company-info">
                    <h1>Telal Al-Bidaya</h1>
                    <p>Real Estate Management</p>
                    <p>Sultanate of Oman</p>
                </div>
            </div>
            <div class="statement-info">
                <h2>Financial Statement</h2>
                <p>Generated: ${statementDate}</p>
                <div class="period">${formatDate(data.startDate)} - ${formatDate(data.endDate)}</div>
            </div>
        </div>
        
        <!-- Summary Cards -->
        <div class="summary-section">
            <div class="summary-card income">
                <div class="label">Total Income</div>
                <div class="amount">${formatCurrency(data.totalIncome)}</div>
            </div>
            <div class="summary-card expense">
                <div class="label">Total Expenses</div>
                <div class="amount">${formatCurrency(data.totalExpenses)}</div>
            </div>
            <div class="summary-card net">
                <div class="label">Net Income</div>
                <div class="amount">${formatCurrency(data.netIncome)}</div>
            </div>
        </div>
        
        <!-- Income Section -->
        <div class="section-title">
            <span class="icon income">↑</span>
            Income Transactions (${incomeTransactions.length})
        </div>
        ${incomeTransactions.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Transaction #</th>
                    <th>Type</th>
                    <th>Received From</th>
                    <th>Method</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${incomeTransactions.map(t => `
                <tr>
                    <td>${formatDate(t.date)}</td>
                    <td>${t.transactionNo}</td>
                    <td>${getTypeLabel(t.type)}</td>
                    <td>${t.paidBy}</td>
                    <td>${t.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                    <td class="amount-positive">+${formatCurrency(t.amount)}</td>
                </tr>
                `).join('')}
                <tr class="subtotal-row">
                    <td colspan="5">Subtotal Income</td>
                    <td class="amount-positive">${formatCurrency(data.totalIncome)}</td>
                </tr>
            </tbody>
        </table>
        ` : '<div class="empty-state">No income transactions in this period</div>'}
        
        <!-- Expenses Section -->
        <div class="section-title">
            <span class="icon expense">↓</span>
            Expense Transactions (${expenseTransactions.length})
        </div>
        ${expenseTransactions.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Transaction #</th>
                    <th>Type</th>
                    <th>Paid To</th>
                    <th>Method</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${expenseTransactions.map(t => `
                <tr>
                    <td>${formatDate(t.date)}</td>
                    <td>${t.transactionNo}</td>
                    <td>${getTypeLabel(t.type)}</td>
                    <td>${t.paidBy}</td>
                    <td>${t.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                    <td class="amount-negative">-${formatCurrency(t.amount)}</td>
                </tr>
                `).join('')}
                <tr class="subtotal-row">
                    <td colspan="5">Subtotal Expenses</td>
                    <td class="amount-negative">${formatCurrency(data.totalExpenses)}</td>
                </tr>
            </tbody>
        </table>
        ` : '<div class="empty-state">No expense transactions in this period</div>'}
        
        <!-- Footer -->
        <div class="footer">
            <p>This is a computer-generated statement and does not require a signature.</p>
            <p class="contact">Telal Al-Bidaya LLC | CR: 1603540 | Tel: +968 9917 1889 / 9199 7970</p>
            <p>P.O. Box 500, Postal Code 316, Sultanate of Oman</p>
        </div>
    </div>
</body>
</html>`;
}

// Find Chrome executable path
function getChromePath(): string {
    const paths = [
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/snap/bin/chromium",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        (process.env.LOCALAPPDATA || "") + "\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
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

    throw new Error("Chrome/Chromium not found.");
}

export async function POST(request: NextRequest) {
    try {
        const body: StatementRequest = await request.json();

        if (!body.startDate || !body.endDate) {
            return NextResponse.json(
                { error: "Start date and end date are required" },
                { status: 400 }
            );
        }

        const chromePath = getChromePath();

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
        const logoDataUrl = getLogoDataUrl();
        const html = generateHTML(body, logoDataUrl);

        await page.setContent(html, {
            waitUntil: "networkidle0",
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
        });

        await browser.close();

        const filename = `statement-${body.startDate}-to-${body.endDate}.pdf`;

        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Statement PDF generation error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate statement" },
            { status: 500 }
        );
    }
}
