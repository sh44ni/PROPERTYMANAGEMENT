import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

interface RentalContract {
    id?: string;
    contractNumber: string;
    landlordName: string;
    landlordCR?: string;
    landlordPOBox?: string;
    landlordPostalCode?: string;
    landlordAddress?: string;
    landlordPhone?: string;
    landlordCivilId?: string;
    tenantName: string;
    tenantIdPassport: string;
    tenantLabourCard?: string;
    tenantPhone: string;
    tenantEmail?: string;
    tenantSponsor?: string;
    tenantCR?: string;
    tenantAddress?: string;
    propertyLandNumber?: string;
    propertyArea?: string;
    propertyBuiltUpArea?: string;
    propertyDistrictNumber?: string;
    propertyStreetNumber?: string;
    propertyLocation?: string;
    propertyMapNumber?: string;
    propertyBuildingName?: string;
    propertyApartmentNumber?: string;
    propertyFloorNumber?: string;
    validFrom: string;
    validTo: string;
    agreementPeriod?: string;
    agreementPeriodUnit?: 'months' | 'years';
    monthlyRent: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
    landlordSignature?: string;
    landlordSignDate?: string;
    tenantSignature?: string;
    tenantSignDate?: string;
    createdAt: string;
}

function getLogoSvg(): string {
    try {
        return fs.readFileSync(path.join(process.cwd(), "public", "logo.svg"), "utf-8");
    } catch {
        return "";
    }
}

const fd = (d: string): string => {
    if (!d) return "—";
    try {
        return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
        return d;
    }
};

function generateHTML(c: RentalContract, logoSvg: string): string {
    const payFreqEn =
        c.paymentFrequency === 'monthly'   ? 'Monthly'   :
        c.paymentFrequency === 'quarterly' ? 'Quarterly' :
        c.paymentFrequency === 'yearly'    ? 'Yearly'    : '—';

    const payFreqAr =
        c.paymentFrequency === 'monthly'   ? 'شهري'      :
        c.paymentFrequency === 'quarterly' ? 'ربع سنوي'  :
        c.paymentFrequency === 'yearly'    ? 'سنوي'      : '—';

    const periodUnit    = c.agreementPeriodUnit === 'years' ? 'Year(s) / سنة' : 'Month(s) / شهر';
    const periodUnitAr  = c.agreementPeriodUnit === 'years' ? 'سنة' : 'شهر';

    const logoBlock = logoSvg
        ? `<div class="logo-block">
               <div style="max-width:110px;margin:0 auto;display:flex;align-items:center;justify-content:center">${logoSvg}</div>
           </div>`
        : `<div class="logo-block">
               <div class="logo-name">TELAL AL-BIDAYA</div>
               <div class="logo-arabic">تلال البداية للتجارة والخدمات</div>
               <div class="logo-tagline">Trading &amp; Contracting · Sultanate of Oman</div>
           </div>`;

    const topBar = (pageNum: number, total: number) => `
    <div class="top-bar">
        <div class="meta-text">
            Agreement No: <strong>${c.contractNumber}</strong><br>
            CR: <strong>${c.landlordCR || '1603540'}</strong>
        </div>
        ${logoBlock}
        <div class="meta-text" style="text-align:right">
            Date: <strong>${fd(c.createdAt)}</strong><br>
            Page: <strong>${pageNum} of ${total}</strong>
        </div>
    </div>`;

    const pageFooter = `
    <div class="page-footer">
        <div class="footer-line footer-ar-line">91997970 / 99171889 : تلفاكس - 316 : الرمز البريدي - 500 : ص.ب - 1603540 : ت.س</div>
        <div class="footer-line">CR:1603540, P.O. Box: 500, PCode: 316, GSM: 99171889 / 91997970, Sultanate of Oman</div>
    </div>`;

    const row = (enLabel: string, enVal: string, arVal: string, arLabel: string) => `
    <tr>
        <td class="lbl-en">${enLabel}</td>
        <td class="val-en">${enVal || '—'}</td>
        <td class="val-ar">${arVal || '—'}</td>
        <td class="lbl-ar">${arLabel}</td>
    </tr>`;

    return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<title>Tenancy Agreement – ${c.contractNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Source+Sans+3:wght@300;400;500;600&family=Noto+Naskh+Arabic:wght@400;600&display=swap" rel="stylesheet">
<style>
  :root {
    --ink: #1a1a2e;
    --gold: #b8964a;
    --gold-light: #d4b06a;
    --rule: #c8bca8;
    --bg: #faf8f4;
    --cell-bg: #f4f1eb;
    --header-bg: #1a1a2e;
    --header-text: #e8dfc8;
    --section-bg: #eee9df;
    --text-muted: #6b6250;
    --border: #d4c9b4;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Source Sans 3', sans-serif;
    background: #e8e4de;
    color: var(--ink);
    font-size: 9pt;
  }
  .arabic { font-family: 'Noto Naskh Arabic', serif; direction: rtl; text-align: right; }
  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto 16px;
    background: var(--bg);
    padding: 14mm 14mm 12mm;
    position: relative;
    box-shadow: 0 4px 40px rgba(0,0,0,0.18);
  }
  .page::before {
    content: "TELAL AL-BIDAYA";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%) rotate(-35deg);
    font-family: 'Playfair Display', serif;
    font-size: 58pt;
    color: rgba(184,150,74,0.045);
    white-space: nowrap;
    pointer-events: none;
    letter-spacing: 0.1em;
    z-index: 0;
  }
  .page > * { position: relative; z-index: 1; }
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--rule);
  }
  .meta-text {
    font-size: 7.5pt;
    color: var(--text-muted);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    line-height: 1.7;
  }
  .meta-text strong { color: var(--ink); font-weight: 600; }
  .logo-block { text-align: center; flex: 1; padding: 0 10px; }
  .logo-name { font-family: 'Playfair Display', serif; font-size: 13pt; color: var(--ink); letter-spacing: 0.04em; line-height: 1.2; }
  .logo-arabic { font-family: 'Noto Naskh Arabic', serif; font-size: 10pt; color: var(--gold); margin-top: 2px; direction: rtl; }
  .logo-tagline { font-size: 6.5pt; color: var(--text-muted); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 3px; }
  .title-banner {
    background: var(--header-bg);
    color: var(--header-text);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 9px 14px;
    margin-bottom: 10px;
    border-left: 3px solid var(--gold);
    border-right: 3px solid var(--gold);
  }
  .title-en { font-family: 'Playfair Display', serif; font-size: 13pt; letter-spacing: 0.06em; font-weight: 700; }
  .title-divider { width: 1px; height: 24px; background: rgba(184,150,74,0.5); margin: 0 14px; }
  .title-ar { font-family: 'Noto Naskh Arabic', serif; font-size: 13pt; text-align: right; direction: rtl; color: var(--gold-light); }
  .section-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--section-bg);
    border-top: 2px solid var(--gold);
    border-bottom: 1px solid var(--border);
    padding: 9px 10px;
    margin-bottom: 0;
    margin-top: 14px;
  }
  .section-header .en { font-family: 'Playfair Display', serif; font-size: 9pt; font-weight: 600; color: var(--ink); letter-spacing: 0.04em; }
  .section-header .ar { font-family: 'Noto Naskh Arabic', serif; font-size: 9pt; font-weight: 600; color: var(--ink); text-align: right; direction: rtl; }
  table.data-table { width: 100%; border-collapse: collapse; font-size: 8.2pt; }
  table.data-table tr { border-bottom: 1px solid var(--border); }
  table.data-table tr:last-child { border-bottom: 2px solid var(--rule); }
  table.data-table td { padding: 8px 8px; vertical-align: middle; line-height: 1.5; }
  table.data-table td.lbl-en { width: 20%; color: var(--text-muted); font-weight: 500; font-size: 7.8pt; letter-spacing: 0.02em; }
  table.data-table td.val-en { width: 30%; color: var(--ink); font-weight: 400; border-right: 1px dashed var(--rule); }
  table.data-table td.val-ar { width: 30%; font-family: 'Noto Naskh Arabic', serif; direction: rtl; text-align: right; color: var(--ink); font-size: 8.5pt; border-left: 1px dashed var(--rule); }
  table.data-table td.lbl-ar { width: 20%; font-family: 'Noto Naskh Arabic', serif; direction: rtl; text-align: right; color: var(--text-muted); font-size: 8pt; font-weight: 600; }
  table.data-table tr:nth-child(even) td { background: var(--cell-bg); }
  .period-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 16px; }
  .rent-highlight { border: 1px solid var(--border); padding: 22px 16px; background: var(--header-bg); border-top: 2px solid var(--gold); display: flex; flex-direction: column; justify-content: center; }
  .rent-highlight .rh-label { font-size: 7pt; color: rgba(232,223,200,0.7); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }
  .rent-highlight .rh-amount { font-family: 'Playfair Display', serif; font-size: 20pt; color: var(--gold-light); letter-spacing: 0.04em; }
  .rent-highlight .rh-ar { font-family: 'Noto Naskh Arabic', serif; font-size: 8pt; color: rgba(232,223,200,0.6); direction: rtl; text-align: right; margin-top: 6px; }
  .info-card { border: 1px solid var(--border); padding: 22px 16px; background: var(--cell-bg); border-top: 2px solid var(--rule); }
  .info-card .ic-label-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .info-card .ic-label { font-size: 7pt; color: var(--text-muted); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
  .info-card .ic-label-ar { font-family: 'Noto Naskh Arabic', serif; font-size: 8pt; color: var(--text-muted); direction: rtl; }
  .info-card .ic-value { font-size: 13pt; font-family: 'Playfair Display', serif; color: var(--ink); }
  .period-block { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
  .period-card { border: 1px solid var(--border); padding: 22px 16px; background: var(--cell-bg); border-top: 2px solid var(--gold); }
  .period-card .pc-label-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
  .period-card .pc-label-en { font-size: 7pt; color: var(--text-muted); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
  .period-card .pc-label-ar { font-family: 'Noto Naskh Arabic', serif; font-size: 8pt; color: var(--text-muted); direction: rtl; }
  .period-card .pc-value { font-size: 18pt; font-family: 'Playfair Display', serif; color: var(--ink); letter-spacing: 0.04em; }
  .signature-block { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--rule); }
  .sig-box { border: 1px solid var(--border); padding: 20px 18px; background: var(--cell-bg); border-top: 2px solid var(--gold); }
  .sig-box .sig-role-row { display: flex; justify-content: space-between; margin-bottom: 44px; }
  .sig-box .sig-role-en { font-size: 7.5pt; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); }
  .sig-box .sig-role-ar { font-family: 'Noto Naskh Arabic', serif; font-size: 8pt; color: var(--text-muted); direction: rtl; }
  .sig-line { border-bottom: 1px solid var(--ink); margin-bottom: 8px; height: 36px; }
  .sig-date-row { display: flex; justify-content: space-between; }
  .sig-date-label { font-size: 7pt; color: var(--text-muted); font-weight: 500; }
  .sig-date-label.ar { font-family: 'Noto Naskh Arabic', serif; direction: rtl; font-size: 7.5pt; }
  .page-footer { margin-top: 10px; padding-top: 7px; border-top: 1px solid var(--rule); font-size: 6.8pt; color: var(--text-muted); text-align: center; }
  .page-footer .footer-line { line-height: 1.7; }
  .page-footer .footer-ar-line { font-family: 'Noto Naskh Arabic', serif; direction: rtl; font-size: 7pt; unicode-bidi: embed; }
  .page2-title { background: var(--header-bg); color: var(--header-text); display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 9px 14px; margin-bottom: 12px; border-left: 3px solid var(--gold); border-right: 3px solid var(--gold); }
  .terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid var(--border); }
  .terms-col { padding: 0; }
  .terms-col:first-child { border-right: 1px solid var(--border); }
  .terms-col-header { background: var(--section-bg); padding: 6px 10px; font-size: 7.5pt; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border); }
  .terms-col-header.ar { font-family: 'Noto Naskh Arabic', serif; direction: rtl; text-align: right; font-size: 8.5pt; text-transform: none; letter-spacing: 0; }
  .term-item { padding: 9px 10px; border-bottom: 1px solid var(--border); display: flex; gap: 8px; align-items: flex-start; line-height: 1.55; font-size: 8.2pt; color: var(--ink); }
  .term-item:last-child { border-bottom: none; }
  .term-item.ar { direction: rtl; text-align: right; font-family: 'Noto Naskh Arabic', serif; font-size: 9pt; gap: 6px; flex-direction: row-reverse; }
  .term-num { min-width: 16px; height: 16px; background: var(--gold); color: #fff; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 7.5pt; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
  .term-num.ar { font-family: 'Noto Naskh Arabic', serif; font-size: 8pt; }
  .sig-block-p2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 16px; padding-top: 12px; border-top: 2px solid var(--rule); }
  @media print {
    body { background: none; }
    .page { margin: 0; box-shadow: none; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
  }
  @page { size: A4; margin: 0; }
</style>
</head>
<body>

<!-- PAGE 1 -->
<div class="page">

  ${topBar(1, 2)}

  <div class="title-banner">
    <div class="title-en">Tenancy Agreement</div>
    <div class="title-divider"></div>
    <div class="title-ar">عقد الإيجار</div>
  </div>

  <!-- LANDLORD -->
  <div class="section-header">
    <div class="en">Landlord Details &nbsp;(First Party)</div>
    <div class="ar">تفاصيل المالك (الطرف الأول)</div>
  </div>
  <table class="data-table">
    ${row('Name', c.landlordName, c.landlordName, 'الاسم')}
    ${row('CR No', c.landlordCR || '', c.landlordCR || '', 'رقم السجل التجاري')}
    ${row('P.O. Box', c.landlordPOBox || '', c.landlordPOBox || '', 'صندوق البريد')}
    ${row('Postal Code', c.landlordPostalCode || '', c.landlordPostalCode || '', 'الرمز البريدي')}
    ${row('Phone', c.landlordPhone || '', c.landlordPhone || '', 'رقم الهاتف')}
    ${row('Civil / National ID', c.landlordCivilId || '', c.landlordCivilId || '', 'الرقم المدني')}
    ${row('Address', c.landlordAddress || '', c.landlordAddress || '', 'العنوان')}
  </table>

  <!-- TENANT -->
  <div class="section-header">
    <div class="en">Tenant Details &nbsp;(Second Party)</div>
    <div class="ar">تفاصيل المستأجر (الطرف الثاني)</div>
  </div>
  <table class="data-table">
    ${row('Name', c.tenantName, c.tenantName, 'الاسم')}
    ${row('ID / Passport', c.tenantIdPassport, c.tenantIdPassport, 'رقم الهوية / جواز السفر')}
    ${row('Labour Card', c.tenantLabourCard || '', c.tenantLabourCard || '', 'بطاقة العمل')}
    ${row('Sponsor Name', c.tenantSponsor || '', c.tenantSponsor || '', 'اسم الكفيل')}
    ${row('CR (Companies)', c.tenantCR || 'N/A', c.tenantCR || '—', 'السجل التجاري')}
    ${row('Phone', c.tenantPhone, c.tenantPhone, 'رقم الهاتف')}
    ${row('Email', c.tenantEmail || '', c.tenantEmail || '', 'البريد الإلكتروني')}
    ${row('Address', c.tenantAddress || '', c.tenantAddress || '', 'العنوان')}
  </table>

  <!-- PROPERTY -->
  <div class="section-header">
    <div class="en">Property Data</div>
    <div class="ar">أمانة بيانات العقار</div>
  </div>
  <table class="data-table">
    ${row('Land Number', c.propertyLandNumber || '', c.propertyLandNumber || '', 'رقم الأرض')}
    ${row('Area', c.propertyArea || '', c.propertyArea || '', 'مساحة الأرض')}
    ${row('Built-up Area', c.propertyBuiltUpArea || '', c.propertyBuiltUpArea || '', 'مساحة البناء')}
    ${row('District Number', c.propertyDistrictNumber || '', c.propertyDistrictNumber || '', 'رقم الحي')}
    ${row('Street / Block', c.propertyStreetNumber || '', c.propertyStreetNumber || '', 'رقم السكة')}
    ${row('Location', c.propertyLocation || '', c.propertyLocation || '', 'الموقع')}
    ${row('Map / Plan No', c.propertyMapNumber || '', c.propertyMapNumber || '', 'رقم المخطط')}
    ${row('Building Name', c.propertyBuildingName || '', c.propertyBuildingName || '', 'اسم المبنى')}
    ${row('Apartment No', c.propertyApartmentNumber || '', c.propertyApartmentNumber || '', 'رقم الشقة')}
    ${row('Floor Number', c.propertyFloorNumber || '', c.propertyFloorNumber || '', 'رقم الطابق')}
  </table>

  <!-- CONTRACT PERIOD + RENT -->
  <div class="period-row">
    <div class="rent-highlight">
      <div class="rh-label">Monthly Rental Fee</div>
      <div class="rh-amount">OMR ${c.monthlyRent?.toFixed(3) || '0.000'}</div>
      <div class="rh-ar">الرسوم الإيجارية الشهرية</div>
    </div>
    <div class="info-card">
      <div class="ic-label-row">
        <span class="ic-label">Duration</span>
        <span class="ic-label-ar">مدة العقد</span>
      </div>
      <div class="ic-value">${c.agreementPeriod || '—'}</div>
      <div style="font-size:7pt;color:var(--text-muted);margin-top:2px">${periodUnit}</div>
    </div>
    <div class="info-card">
      <div class="ic-label-row">
        <span class="ic-label">Payment Cycle</span>
        <span class="ic-label-ar">يدفع مقدماً كل</span>
      </div>
      <div class="ic-value">${payFreqEn}</div>
      <div style="font-size:7pt;color:var(--text-muted);margin-top:2px">${payFreqAr}</div>
    </div>
  </div>

  <div class="period-block" style="margin-top:8px">
    <div class="period-card">
      <div class="pc-label-row">
        <span class="pc-label-en">From</span>
        <span class="pc-label-ar">يبدأ في</span>
      </div>
      <div class="pc-value">${fd(c.validFrom)}</div>
    </div>
    <div class="period-card">
      <div class="pc-label-row">
        <span class="pc-label-en">Expiring</span>
        <span class="pc-label-ar">ينتهي في</span>
      </div>
      <div class="pc-value">${fd(c.validTo)}</div>
    </div>
  </div>

  <!-- SIGNATURES -->
  <div class="signature-block">
    <div class="sig-box">
      <div class="sig-role-row">
        <span class="sig-role-en">Landlord Signature</span>
        <span class="sig-role-ar">توقيع المالك</span>
      </div>
      <div class="sig-line">${c.landlordSignature || ''}</div>
      <div class="sig-date-row">
        <span class="sig-date-label">Date: ${fd(c.landlordSignDate || '')}</span>
        <span class="sig-date-label ar">التاريخ:</span>
      </div>
    </div>
    <div class="sig-box">
      <div class="sig-role-row">
        <span class="sig-role-en">Tenant Signature</span>
        <span class="sig-role-ar">توقيع المستأجر</span>
      </div>
      <div class="sig-line">${c.tenantSignature || ''}</div>
      <div class="sig-date-row">
        <span class="sig-date-label">Date: ${fd(c.tenantSignDate || '')}</span>
        <span class="sig-date-label ar">التاريخ:</span>
      </div>
    </div>
  </div>

  ${pageFooter}
</div>


<!-- PAGE 2: TERMS & CONDITIONS -->
<div class="page">

  ${topBar(2, 2)}

  <div class="page2-title">
    <div class="title-en">Terms &amp; Conditions</div>
    <div class="title-divider"></div>
    <div class="title-ar">بنود العقد</div>
  </div>

  <div class="terms-grid">
    <div class="terms-col">
      <div class="terms-col-header">English</div>
      <div class="term-item">
        <div class="term-num">1</div>
        <div>The second party is obliged to clean the property and to carry out the necessary periodic maintenance for it, including air conditioners and heaters, and is obliged to return the property in the condition it received.</div>
      </div>
      <div class="term-item">
        <div class="term-num">2</div>
        <div>The second party is obligated to pay the rent in advance at the beginning of each month. The first party has the right to cancel the tenant's contract in case of non-compliance with the conditions.</div>
      </div>
      <div class="term-item">
        <div class="term-num">3</div>
        <div>This contract is automatically renewed for its duration or other similar periods unless one of the parties has notified in writing to the other party of its desire to vacate the property three months before the end of the current period.</div>
      </div>
      <div class="term-item">
        <div class="term-num">4</div>
        <div>The tenant does not have the right to cancel this contract before the expiry of the specified period. In the event he wants to cancel for convincing reasons accepted by the lessor, the tenant is obliged to provide an alternative or pay the rent amount for three months.</div>
      </div>
      <div class="term-item">
        <div class="term-num">5</div>
        <div>The tenant has no right to transfer this contract to any other party, and it is not permissible for him to sub-lease the property unless written approval has been obtained from the first party.</div>
      </div>
    </div>
    <div class="terms-col">
      <div class="terms-col-header ar">العربية</div>
      <div class="term-item ar">
        <div class="term-num ar">١</div>
        <div>يلتزم الطرف الثاني بنظافة العقار وإجراء الصيانة الدورية اللازمة له بما فيها المكيفات والسخانات ويلتزم بإرجاع العقار بالحالة التي استلمها.</div>
      </div>
      <div class="term-item ar">
        <div class="term-num ar">٢</div>
        <div>يلتزم الطرف الثاني بدفع الإيجار مقدم بداية كل شهر ويحق للطرف الأول إلغاء عقد المستأجر في حالة عدم الالتزام بالشروط.</div>
      </div>
      <div class="term-item ar">
        <div class="term-num ar">٣</div>
        <div>يتجدد هذا العقد تلقائياً إلى مدد أخرى مماثلة له ما لم يعلن أحد الطرفين كتابياً للطرف الآخر عن رغبته في إخلاء العقار قبل انتهاء المدة الجارية بثلاثة أشهر.</div>
      </div>
      <div class="term-item ar">
        <div class="term-num ar">٤</div>
        <div>لا يحق للمستأجر فسخ هذا العقد إلا بعد انقضاء المدة المحددة وفي حال رغب إلغاء العقد قبل موعد انتهاء لأسباب مقنعة يرتضيها المؤجر يلتزم المستأجر بتوفير بديل أو دفع مبلغ الإيجار لثلاثة أشهر.</div>
      </div>
      <div class="term-item ar">
        <div class="term-num ar">٥</div>
        <div>لا يحق للمؤجر نقل العقد إلى أي جهة أخرى كما لا يجوز له تأجير العقار من الباطن ما لم يحصل على موافقة كتابية من الطرف الأول.</div>
      </div>
    </div>
  </div>

  <div class="sig-block-p2">
    <div class="sig-box">
      <div class="sig-role-row">
        <span class="sig-role-en">Landlord Signature</span>
        <span class="sig-role-ar">توقيع المالك</span>
      </div>
      <div class="sig-line">${c.landlordSignature || ''}</div>
      <div class="sig-date-row">
        <span class="sig-date-label">Date: ${fd(c.landlordSignDate || '')}</span>
        <span class="sig-date-label ar">التاريخ:</span>
      </div>
    </div>
    <div class="sig-box">
      <div class="sig-role-row">
        <span class="sig-role-en">Tenant Signature</span>
        <span class="sig-role-ar">توقيع المستأجر</span>
      </div>
      <div class="sig-line">${c.tenantSignature || ''}</div>
      <div class="sig-date-row">
        <span class="sig-date-label">Date: ${fd(c.tenantSignDate || '')}</span>
        <span class="sig-date-label ar">التاريخ:</span>
      </div>
    </div>
  </div>

  ${pageFooter}
</div>

</body>
</html>`;
}

function getChromePath(): string {
    const paths = [
        "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium", "/usr/bin/chromium-browser", "/snap/bin/chromium",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        (process.env.LOCALAPPDATA || "") + "\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    ];
    for (const p of paths) {
        try { fs.accessSync(p); return p; } catch { continue; }
    }
    throw new Error("Chrome/Chromium not found.");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const contract: RentalContract = body.contract;
        if (!contract) return NextResponse.json({ error: "Contract data is required" }, { status: 400 });

        const browser = await puppeteer.launch({
            executablePath: getChromePath(),
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-first-run"],
        });

        const page = await browser.newPage();
        const html = generateHTML(contract, getLogoSvg());
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
        });

        await browser.close();

        return new NextResponse(Buffer.from(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="contract-${contract.contractNumber}.pdf"`,
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
