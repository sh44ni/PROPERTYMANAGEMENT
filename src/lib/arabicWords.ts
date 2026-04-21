/**
 * Converts a number to Arabic words (Omani Rial context).
 * Supports integers and up to 3 decimal places (fils).
 * e.g. 5000 → "خمسة آلاف ريال عماني"
 *      1250.500 → "ألف ومئتان وخمسون ريالاً عمانياً وخمسمائة فلس"
 */

const ones = [
    '', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة',
    'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر',
    'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر',
];

const tens = [
    '', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون',
];

const hundreds = [
    '', 'مئة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة',
    'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة',
];

function threeDigits(n: number): string {
    if (n === 0) return '';
    const h = Math.floor(n / 100);
    const remainder = n % 100;
    const t = Math.floor(remainder / 10);
    const o = remainder % 10;

    const parts: string[] = [];

    if (h > 0) parts.push(hundreds[h]);

    if (remainder > 0) {
        if (remainder < 20) {
            parts.push(ones[remainder]);
        } else {
            if (o > 0) {
                parts.push(ones[o] + ' و' + tens[t]);
            } else {
                parts.push(tens[t]);
            }
        }
    }

    return parts.join(' و');
}

function integerToArabic(n: number): string {
    if (n === 0) return 'صفر';
    if (n < 0) return 'سالب ' + integerToArabic(-n);

    const billion = Math.floor(n / 1_000_000_000);
    const million = Math.floor((n % 1_000_000_000) / 1_000_000);
    const thousand = Math.floor((n % 1_000_000) / 1_000);
    const rest = n % 1_000;

    const parts: string[] = [];

    if (billion > 0) {
        if (billion === 1) parts.push('مليار');
        else if (billion === 2) parts.push('ملياران');
        else if (billion <= 10) parts.push(threeDigits(billion) + ' مليارات');
        else parts.push(threeDigits(billion) + ' مليار');
    }

    if (million > 0) {
        if (million === 1) parts.push('مليون');
        else if (million === 2) parts.push('مليونان');
        else if (million <= 10) parts.push(threeDigits(million) + ' ملايين');
        else parts.push(threeDigits(million) + ' مليون');
    }

    if (thousand > 0) {
        if (thousand === 1) parts.push('ألف');
        else if (thousand === 2) parts.push('ألفان');
        else if (thousand <= 10) parts.push(threeDigits(thousand) + ' آلاف');
        else parts.push(threeDigits(thousand) + ' ألف');
    }

    if (rest > 0) {
        parts.push(threeDigits(rest));
    }

    return parts.join(' و');
}

/**
 * Converts a numeric amount to Arabic text with "ريال عماني".
 * Handles up to 3 decimal places as fils (فلس).
 */
export function numberToArabicWords(amount: number): string {
    if (isNaN(amount) || amount === 0) return '';

    // Split into integer and decimal parts
    const rounded = Math.round(amount * 1000) / 1000;
    const intPart = Math.floor(rounded);
    const decPart = Math.round((rounded - intPart) * 1000); // fils (0–999)

    const rialText = integerToArabic(intPart);
    const rialSuffix = intPart === 1 ? 'ريال عماني' : intPart === 2 ? 'ريالان عمانيان' : 'ريال عماني';

    if (decPart === 0) {
        return `${rialText} ${rialSuffix}`;
    }

    const filsText = integerToArabic(decPart);
    const filsSuffix = decPart === 1 ? 'فلس' : decPart === 2 ? 'فلسان' : 'فلس';

    return `${rialText} ${rialSuffix} و${filsText} ${filsSuffix}`;
}
