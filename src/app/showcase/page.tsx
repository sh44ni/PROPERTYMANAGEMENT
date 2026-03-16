'use client';

import { useState, useEffect } from 'react';

/* ─── SVG ICON COMPONENTS ─────────────────────────────────── */

const Icons = {
  building: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
  ),
  receipt: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 10h8M8 14h4" />
    </svg>
  ),
  taxInvoice: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M9 15h6M9 11h6" />
      <circle cx="12" cy="18" r="0.5" fill="currentColor" />
    </svg>
  ),
  handshake: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42Z" />
      <path d="M12 5.36 8.87 8.5a2.13 2.13 0 0 0 0 3 2.13 2.13 0 0 0 3 0l3.13-3.14" />
    </svg>
  ),
  contract: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  users: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  chart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
    </svg>
  ),
  folder: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
      <path d="M12 10v6M9 13h6" />
    </svg>
  ),
  globe: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
  arrowRight: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  chevronDown: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  play: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  printer: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  key: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  ),
  home: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  bell: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  creditCard: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  image: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
};

/* ─── TRANSLATIONS ────────────────────────────────────────── */

const en = {
  badge: 'Property Management Platform',
  heroTitle: 'Telal Al-Bidaya',
  heroSubtitle: 'A complete, professional property management system built for Oman — contracts, receipts, tax invoices, rentals, and more. All in one place.',
  trySystem: 'Try the System',
  exploreFeatures: 'Explore Features',
  featuresTitle: 'Everything You Need',
  featuresSubtitle: 'One powerful platform to run your entire real estate operation',
  guideTitle: 'How It Works',
  guideSubtitle: 'See the system in action — here\'s how each core workflow is handled',
  techTitle: 'Built With Modern Technology',
  footerText: 'Telal Al-Bidaya LLC · Property Management System',
  features: [
    {
      icon: 'building',
      title: 'Projects & Properties',
      desc: 'Track real estate developments with budget, progress, units sold, and individual property management for villas, apartments, land, and commercial units.',
      highlights: ['Budget tracking', 'Unit progress', 'Multi-type support'],
    },
    {
      icon: 'receipt',
      title: 'Accounts & Receipts',
      desc: 'Issue and cancel receipts, record owner payments with commission deductions, and maintain a full transaction ledger with PDF export.',
      highlights: ['PDF generation', 'Commission calc', 'Full ledger'],
    },
    {
      icon: 'taxInvoice',
      title: 'Tax Invoices (VAT)',
      desc: 'Generate formal VAT/tax invoices from any receipt. Auto-calculates net before tax, VAT amount, and net after tax. Bilingual Arabic/English PDF.',
      highlights: ['Auto-calculation', 'VAT compliant', 'Bilingual PDF'],
    },
    {
      icon: 'handshake',
      title: 'Rental Management',
      desc: 'Full rental lifecycle: agreements, payment tracking, overdue alerts, automated email reminders, and status monitoring.',
      highlights: ['Payment tracking', 'Email alerts', 'Status monitor'],
    },
    {
      icon: 'contract',
      title: 'Legal Contracts',
      desc: 'Generate Oman-standard rental and sale contracts with landlord/tenant details, property specs, payment schedules, and digital signatures.',
      highlights: ['Oman standard', 'Digital sign', 'Auto-fill'],
    },
    {
      icon: 'users',
      title: 'Customers & Owners',
      desc: 'Complete registry with ID document uploads, nationality, payment history, and linked properties for both tenants and property owners.',
      highlights: ['ID uploads', 'Payment history', 'Property links'],
    },
    {
      icon: 'chart',
      title: 'Dashboard Analytics',
      desc: 'Real-time KPIs: total revenue, active rentals, occupancy rate, upcoming payments, and monthly income vs expense charts.',
      highlights: ['Real-time KPIs', 'Revenue charts', 'Occupancy rate'],
    },
    {
      icon: 'folder',
      title: 'Document Storage',
      desc: 'Upload, organize, and retrieve legal documents, invoices, and agreements categorized by type with instant download.',
      highlights: ['Smart organize', 'Instant search', 'Categorized'],
    },
    {
      icon: 'globe',
      title: 'Arabic & English',
      desc: 'Full RTL Arabic and LTR English with instant switching. All menus, forms, and PDFs support both languages seamlessly.',
      highlights: ['RTL support', 'Instant switch', 'Full coverage'],
    },
  ],
  guide: [
    {
      icon: 'receipt',
      title: 'Issue a Receipt',
      desc: 'Navigate to Accounts → Issue Receipt. Select the customer, project, amount, and payment method. A professional PDF receipt is generated and downloads instantly — ready for records or sharing.',
      action: 'Accounts → Issue Receipt',
      result: 'Professional PDF receipt generated',
    },
    {
      icon: 'taxInvoice',
      title: 'Create a Tax Invoice',
      desc: 'Click Tax Invoice or the tag icon on any receipt. Enter owner and tenant tax registration numbers and VAT rate. Net before tax, VAT amount, and net after tax are auto-calculated. Download bilingual PDF.',
      action: 'Tax Invoice → Fill Tax Details',
      result: 'VAT invoice with auto-calculations',
    },
    {
      icon: 'contract',
      title: 'Generate a Contract',
      desc: 'Go to Contracts → New Rental or Sale Contract. Tenant details auto-fill from your customer registry. Customize terms, payment schedule, and property details. Download the formatted legal PDF.',
      action: 'Contracts → New Contract',
      result: 'Oman-standard legal PDF contract',
    },
    {
      icon: 'bell',
      title: 'Track Rentals',
      desc: 'All active rentals show real-time payment status — Paid, Pending, or Overdue. Send automated email reminders to tenants with one click. Never miss a collection date again.',
      action: 'Rentals → View Status',
      result: 'Real-time status with email alerts',
    },
    {
      icon: 'creditCard',
      title: 'Owner Payouts',
      desc: 'Record owner payments under Accounts → Owner Payment. Set the commission rate and the system automatically calculates and records the net payout amount.',
      action: 'Accounts → Owner Payment',
      result: 'Auto-calculated net payout',
    },
    {
      icon: 'home',
      title: 'Manage Properties',
      desc: 'Add properties with images, link them to projects and owners, track status (Available / Rented / Sold), and update details anytime. Full property lifecycle management.',
      action: 'Properties → Add / Edit',
      result: 'Complete property lifecycle tracking',
    },
  ],
};

const ar = {
  badge: 'منصة إدارة العقارات',
  heroTitle: 'تلال البداية',
  heroSubtitle: 'نظام متكامل واحترافي لإدارة العقارات مصمم لسلطنة عُمان — عقود، إيصالات، فواتير ضريبية، إيجارات، والمزيد. كل شيء في مكان واحد.',
  trySystem: 'جرّب النظام',
  exploreFeatures: 'استكشف المميزات',
  featuresTitle: 'كل ما تحتاجه',
  featuresSubtitle: 'منصة قوية واحدة لإدارة عمليات العقارات بالكامل',
  guideTitle: 'كيف يعمل النظام',
  guideSubtitle: 'شاهد النظام أثناء العمل — إليك كيفية التعامل مع كل سير عمل أساسي',
  techTitle: 'مبني بأحدث التقنيات',
  footerText: 'شركة تلال البداية ذ.م.م · نظام إدارة العقارات',
  features: [
    {
      icon: 'building',
      title: 'المشاريع والعقارات',
      desc: 'تتبع المشاريع العقارية بالميزانية، التقدم، الوحدات المباعة، وإدارة الفلل والشقق والأراضي والوحدات التجارية.',
      highlights: ['تتبع الميزانية', 'تقدم الوحدات', 'دعم متعدد الأنواع'],
    },
    {
      icon: 'receipt',
      title: 'الحسابات والإيصالات',
      desc: 'إصدار وإلغاء الإيصالات، تسجيل مدفوعات الملاك مع خصم العمولات، والاحتفاظ بسجل معاملات كامل مع تصدير PDF.',
      highlights: ['إنشاء PDF', 'حساب العمولة', 'سجل كامل'],
    },
    {
      icon: 'taxInvoice',
      title: 'الفواتير الضريبية',
      desc: 'إنشاء فواتير ضريبية رسمية من أي إيصال. احتساب تلقائي للصافي قبل الضريبة ومبلغ الضريبة والصافي بعدها. PDF ثنائي اللغة.',
      highlights: ['احتساب تلقائي', 'متوافق مع الضريبة', 'PDF ثنائي اللغة'],
    },
    {
      icon: 'handshake',
      title: 'إدارة الإيجارات',
      desc: 'دورة حياة الإيجار الكاملة: العقود، تتبع المدفوعات، تنبيهات التأخر، تذكيرات البريد الإلكتروني، ومراقبة الحالة.',
      highlights: ['تتبع المدفوعات', 'تنبيهات البريد', 'مراقبة الحالة'],
    },
    {
      icon: 'contract',
      title: 'العقود القانونية',
      desc: 'إنشاء عقود إيجار وبيع وفق المعايير العُمانية مع تفاصيل المالك والمستأجر والعقار وجداول الدفع والتوقيعات الرقمية.',
      highlights: ['معيار عُماني', 'توقيع رقمي', 'تعبئة تلقائية'],
    },
    {
      icon: 'users',
      title: 'العملاء والملاك',
      desc: 'سجل كامل مع رفع وثائق الهوية والجنسية وسجل المدفوعات والعقارات المرتبطة للمستأجرين وأصحاب العقارات.',
      highlights: ['رفع الهوية', 'سجل المدفوعات', 'ربط العقارات'],
    },
    {
      icon: 'chart',
      title: 'تحليلات لوحة القيادة',
      desc: 'مؤشرات أداء فورية: إجمالي الإيرادات، الإيجارات النشطة، نسبة الإشغال، المدفوعات القادمة، ورسوم الدخل مقابل المصروفات.',
      highlights: ['مؤشرات فورية', 'رسوم الإيرادات', 'نسبة الإشغال'],
    },
    {
      icon: 'folder',
      title: 'تخزين المستندات',
      desc: 'رفع وتنظيم واسترجاع الوثائق القانونية والفواتير والعقود مصنفة حسب النوع مع تنزيل فوري.',
      highlights: ['تنظيم ذكي', 'بحث فوري', 'مصنف'],
    },
    {
      icon: 'globe',
      title: 'عربي وإنجليزي',
      desc: 'دعم كامل للغة العربية (RTL) والإنجليزية (LTR) مع تبديل فوري. جميع القوائم والنماذج وملفات PDF تدعم اللغتين.',
      highlights: ['دعم RTL', 'تبديل فوري', 'تغطية كاملة'],
    },
  ],
  guide: [
    {
      icon: 'receipt',
      title: 'إصدار إيصال',
      desc: 'اذهب إلى الحسابات ← إصدار إيصال. اختر العميل والمشروع والمبلغ وطريقة الدفع. يتم تنزيل إيصال PDF احترافي فوراً.',
      action: 'الحسابات ← إصدار إيصال',
      result: 'إيصال PDF احترافي',
    },
    {
      icon: 'taxInvoice',
      title: 'إنشاء فاتورة ضريبية',
      desc: 'انقر على فاتورة ضريبية أو أيقونة العلامة على أي إيصال. أدخل الأرقام الضريبية ونسبة ضريبة القيمة المضافة — يتم احتساب المبالغ تلقائياً.',
      action: 'فاتورة ضريبية ← التفاصيل',
      result: 'فاتورة ضريبية بحسابات تلقائية',
    },
    {
      icon: 'contract',
      title: 'إنشاء عقد',
      desc: 'اذهب إلى العقود ← عقد إيجار جديد أو بيع جديد. تعبئة تلقائية لبيانات المستأجر من قائمة العملاء، ثم تنزيل PDF المنسق.',
      action: 'العقود ← عقد جديد',
      result: 'عقد قانوني PDF بالمعيار العُماني',
    },
    {
      icon: 'bell',
      title: 'تتبع الإيجارات',
      desc: 'جميع الإيجارات النشطة تظهر حالة الدفع (مدفوع / قيد الانتظار / متأخر). إرسال تذكيرات البريد الإلكتروني للمستأجرين بنقرة واحدة.',
      action: 'الإيجارات ← عرض الحالة',
      result: 'حالة لحظية مع تنبيهات البريد',
    },
    {
      icon: 'creditCard',
      title: 'مدفوعات الملاك',
      desc: 'سجّل مدفوعات الملاك في الحسابات ← سداد الملاك. حدد نسبة العمولة ويتم احتساب وتسجيل الصافي تلقائياً.',
      action: 'الحسابات ← سداد الملاك',
      result: 'صافي الدفعة محسوب تلقائياً',
    },
    {
      icon: 'home',
      title: 'إدارة العقارات',
      desc: 'أضف عقارات مع صور، اربطها بالمشاريع والملاك، تتبع الحالة (متاح / مؤجر / مباع)، وقم بتحديث التفاصيل في أي وقت.',
      action: 'العقارات ← إضافة / تعديل',
      result: 'إدارة دورة حياة العقار الكاملة',
    },
  ],
};

const techStack = [
  { name: 'Next.js 16', color: '#000000', bg: '#ffffff', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#000"><path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.253 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.86-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.572 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z"/></svg>
  )},
  { name: 'React 19', color: '#61dafb', bg: '#20232a', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#61dafb"><path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.31 0-.592.068-.846.198-1.048.554-1.397 2.234-.93 4.613C3.099 7.002 1.75 8.369 1.75 9.73c0 1.408 1.44 2.822 3.775 3.727-.457 2.33-.095 3.974.95 4.526.255.134.535.198.845.198 1.346 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.31 0 .592-.067.845-.197 1.05-.554 1.398-2.234.931-4.613.027-.012.054-.022.08-.033 2.262-.884 3.638-2.232 3.638-3.586 0-1.407-1.44-2.822-3.775-3.727.457-2.33.095-3.974-.95-4.526a1.757 1.757 0 0 0-.844-.198zM16.878 2.5a.72.72 0 0 1 .345.083c.569.3.835 1.456.507 3.184a15.27 15.27 0 0 1-.31 1.313 23.845 23.845 0 0 0-3.136-.604 23.5 23.5 0 0 0-2.043-2.452c1.564-1.458 3.035-2.305 4.083-2.382.185-.013.37-.025.554-.142zM7.122 2.5c.148.117.314.13.498.142 1.048.077 2.519.924 4.084 2.383a23.41 23.41 0 0 0-2.03 2.44A23.77 23.77 0 0 0 6.544 8.08a15.27 15.27 0 0 1-.31-1.313c-.327-1.728-.061-2.884.508-3.184a.72.72 0 0 1 .38-.083zm4.87 3.68a21.564 21.564 0 0 1 1.506 1.81c-.488-.025-.992-.038-1.502-.038a21.357 21.357 0 0 1-1.498.037 22.37 22.37 0 0 1 1.494-1.81zm-5.386 3.05c.307-.586.638-1.158.994-1.71a21.79 21.79 0 0 1 1.104-1.613 22.39 22.39 0 0 1 1.86.302c.636.14 1.26.305 1.87.496a22.09 22.09 0 0 1-.94 1.926c-.348.633-.716 1.244-1.105 1.832a22.37 22.37 0 0 1-1.86.302 22.39 22.39 0 0 1-1.923-.535zM18.1 9.73c0 .655-.81 1.534-2.305 2.285a22.03 22.03 0 0 0-.825-1.908c.28-.599.537-1.212.77-1.836a13.894 13.894 0 0 1 .888.404c.901.476 1.472 1.004 1.472 1.055zm-12.2 0c0-.05.572-.58 1.473-1.056.26-.137.544-.267.852-.39.233.622.49 1.233.77 1.831a22.22 22.22 0 0 0-.825 1.91C6.71 11.263 5.9 10.384 5.9 9.73zm6.505 3.805c-.488.025-.992.038-1.502.038-.506 0-1.007-.013-1.492-.037a22.31 22.31 0 0 1-1.507-1.813 21.564 21.564 0 0 1 1.506-1.81c.488.025.992.038 1.502.038.506 0 1.008-.013 1.493-.037.52.582 1.02 1.186 1.507 1.813a21.582 21.582 0 0 1-1.507 1.808zm1.7-.412c.348-.634.672-1.28.968-1.936a22.3 22.3 0 0 1 .944 1.925c-.3.116-.615.224-.94.322a22.37 22.37 0 0 1-.973-.31zm-5.594.413a21.79 21.79 0 0 1-.994-1.71 22.39 22.39 0 0 1 1.934.536c.31.594.644 1.173 1.001 1.734a22.37 22.37 0 0 1-1.942-.56zm5.49 3.956c-.568.3-1.49-.014-2.57-.808a14.02 14.02 0 0 1-1.514-1.234 23.5 23.5 0 0 0 2.043-2.452 23.845 23.845 0 0 0 3.136-.604c.11.43.205.86.283 1.28.328 1.729.062 2.884-.507 3.184a.72.72 0 0 1-.346.083c-.184.013-.37.026-.525.55zm-7.8-.55c-.155-.524-.341-.537-.525-.55a.72.72 0 0 1-.345-.084c-.568-.3-.835-1.455-.508-3.183.078-.42.172-.85.283-1.28a23.77 23.77 0 0 0 3.13.616 23.41 23.41 0 0 0 2.03 2.44 14.02 14.02 0 0 1-1.514 1.233c-1.08.794-2.002 1.108-2.57.808z"/></svg>
  )},
  { name: 'TypeScript', color: '#3178c6', bg: '#f0f4ff', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#3178c6"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.42.276.69.394c.268.118.564.228.886.33.424.143.828.309 1.213.496.385.187.72.406 1.004.656.285.25.51.544.675.882.164.339.246.728.246 1.17 0 .534-.107.992-.321 1.373-.215.382-.517.696-.908.943a4.33 4.33 0 0 1-1.385.574 7.01 7.01 0 0 1-1.705.199c-.63 0-1.229-.078-1.793-.234a4.968 4.968 0 0 1-1.391-.591v-2.54a4.664 4.664 0 0 0 .861.562c.327.163.657.29.987.374.33.085.648.127.958.127.221 0 .422-.017.601-.052a1.52 1.52 0 0 0 .47-.163.874.874 0 0 0 .313-.293.801.801 0 0 0 .113-.429c0-.214-.066-.399-.198-.556-.133-.157-.32-.302-.562-.435a6.395 6.395 0 0 0-.867-.39 12.46 12.46 0 0 0-1.117-.413 5.79 5.79 0 0 1-1.117-.547 3.528 3.528 0 0 1-.823-.715 2.874 2.874 0 0 1-.501-.934c-.114-.354-.171-.762-.171-1.222 0-.498.1-.954.303-1.367.202-.413.487-.768.855-1.065.367-.296.815-.526 1.34-.69a6.224 6.224 0 0 1 1.755-.245zm-10.5.172h7.05v2.137H13.1v8.714h-2.706v-8.714H8.488V9.922z"/></svg>
  )},
  { name: 'PostgreSQL', color: '#336791', bg: '#eef4ff', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#336791"><path d="M17.128 0a10.134 10.134 0 0 0-2.755.403l-.063.02A10.922 10.922 0 0 0 12.6.258C11.422.238 10.34.524 9.445.98 8.742.698 7.36.326 5.878.455 4.588.568 3.153 1.14 2.112 2.576.233 5.295-.478 9.643.542 13.541c.262 1.009.692 2.1 1.29 3.037.269.42.583.828.972 1.143.389.315.901.51 1.416.42.594-.103.953-.54 1.193-.937.112-.184.206-.378.299-.572l.147.043c-.009.2-.025.402-.03.605-.022.726.07 1.568.578 2.17.497.588 1.248.727 2.013.65.6-.06 1.24-.2 1.858-.38v.054c-.053.646-.085 1.307.047 1.903.127.575.416 1.128.983 1.395.293.138.627.157.954.126.56-.054 1.168-.303 1.758-.644a10.2 10.2 0 0 0 1.55-1.1.322.322 0 0 0 .063-.023c1.06-.137 1.95-.57 2.593-1.204.768-.758 1.195-1.775 1.378-2.863.102-.601.132-1.233.037-1.838l-.01-.062c.334-.296.605-.64.82-1.02.402-.712.588-1.536.611-2.39.014-.52-.02-1.095-.13-1.684a1.772 1.772 0 0 0-.047-.205c.047-.137.103-.277.146-.418.375-1.217.457-2.54.236-3.73-.242-1.3-.85-2.468-1.887-3.19-1.063-.74-2.37-1.013-3.772-1.065H17.128zM16.904.855c1.296.044 2.503.3 3.436.948.898.625 1.433 1.647 1.654 2.837.205 1.098.133 2.328-.218 3.467l-.05.165c.031.15.06.296.078.452.095.566.124 1.092.112 1.574-.021.786-.191 1.529-.545 2.169-.165.299-.378.572-.636.822.032.489.02.998-.056 1.499-.171 1.013-.569 1.94-1.244 2.607-.547.54-1.294.916-2.188 1.07a.322.322 0 0 0-.093.044c-.428.354-.913.674-1.437 1.016-.564.335-1.095.552-1.558.596-.24.023-.448.012-.617-.067-.336-.158-.528-.548-.635-1.026-.112-.503-.087-1.094-.038-1.69v-.004a5.23 5.23 0 0 1-.552.15c-.532.116-1.09.184-1.591.168a1.975 1.975 0 0 1-.93-.266c-.329-.22-.542-.534-.708-.908-.272-.611-.386-1.357-.415-2.118-.018-.475.005-.975.05-1.458a.322.322 0 0 0-.088-.11 3.24 3.24 0 0 1-.395-.407c-.313-.39-.567-.854-.789-1.33-.543-.938-.959-1.986-1.207-2.94C.648 9.385 1.329 5.223 3.097 2.673c.919-1.325 2.23-1.825 3.375-1.929 1.374-.125 2.676.219 3.39.477.906-.422 1.95-.674 3.1-.656.393.006.789.046 1.197.13l.016.004c.262-.072.541-.137.812-.186.297-.054.594-.096.879-.126l.037-.002.04-.005a10.36 10.36 0 0 1 .961-.052z"/></svg>
  )},
  { name: 'Prisma ORM', color: '#2D3748', bg: '#f7f7f7', icon: (
    <svg width="20" height="22" viewBox="0 0 24 24" fill="#2D3748"><path d="M21.807 18.285L13.553.756a1.324 1.324 0 0 0-1.129-.754 1.31 1.31 0 0 0-1.206.626l-8.952 14.5a1.356 1.356 0 0 0 .016 1.455l4.376 6.778a1.408 1.408 0 0 0 1.58.581l12.703-3.757c.389-.115.707-.39.873-.755s.164-.783-.007-1.145zm-1.848.752L8.886 22.153a.288.288 0 0 1-.378-.137L4.87 16.35a.288.288 0 0 1 .023-.284l8.17-13.207a.288.288 0 0 1 .508.053l7.475 15.957a.288.288 0 0 1-.087.368z"/></svg>
  )},
  { name: 'Tailwind v4', color: '#06b6d4', bg: '#ecfeff', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#06b6d4"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/></svg>
  )},
  { name: 'Puppeteer', color: '#40b5a4', bg: '#f0fdf9', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#40b5a4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><circle cx="8.5" cy="9" r="1.5" fill="#40b5a4"/><circle cx="15.5" cy="9" r="1.5" fill="#40b5a4"/><path d="M9 13s1.5 1.5 3 1.5 3-1.5 3-1.5"/></svg>
  )},
  { name: 'Recharts', color: '#ff7300', bg: '#fff7ed', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff7300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/><circle cx="7" cy="14.3" r="1.5" fill="#ff7300"/><circle cx="10.8" cy="10.5" r="1.5" fill="#ff7300"/><circle cx="13.6" cy="13.2" r="1.5" fill="#ff7300"/><circle cx="18.7" cy="8" r="1.5" fill="#ff7300"/></svg>
  )},
];

/* ─── ICON GETTER ─────────────────────────────────────────── */
const getIcon = (name: string) => (Icons as Record<string, React.ReactNode>)[name] || Icons.building;

/* ─── MAIN COMPONENT ──────────────────────────────────────── */
export default function ShowcasePage() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeGuide, setActiveGuide] = useState(0);
  const t = lang === 'en' ? en : ar;
  const isRTL = lang === 'ar';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#09090b] text-white overflow-x-hidden"
      style={{ fontFamily: isRTL ? "'Cairo', 'Segoe UI', sans-serif" : "'Inter', 'Segoe UI', sans-serif" }}
    >
      {/* Fonts & Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes glow-pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes slide-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse-ring { 0%{transform:scale(0.8);opacity:0.5} 50%{transform:scale(1.2);opacity:0} 100%{transform:scale(0.8);opacity:0} }
        @keyframes dash-draw { to{stroke-dashoffset:0} }

        .float-animation { animation: float 6s ease-in-out infinite; }
        .glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
        .slide-up { animation: slide-up 0.7s ease forwards; }
        .shimmer-text {
          background: linear-gradient(90deg, #cea26e, #f5d5a8, #cea26e, #b8915f, #cea26e);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .glass {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .gold-glass {
          background: rgba(206,162,110,0.06);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(206,162,110,0.15);
        }
        .card-hover {
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-6px);
          background: rgba(206,162,110,0.1);
          border-color: rgba(206,162,110,0.4);
          box-shadow: 0 20px 60px rgba(206,162,110,0.12);
        }
        .card-hover:hover .feature-icon-wrap {
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(206,162,110,0.3);
        }
        .btn-primary {
          background: linear-gradient(135deg, #cea26e, #b8915f);
          transition: all 0.3s ease;
          box-shadow: 0 0 30px rgba(206,162,110,0.3);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 50px rgba(206,162,110,0.5);
          background: linear-gradient(135deg, #d4aa7a, #cea26e);
        }
        .btn-outline {
          border: 1px solid rgba(206,162,110,0.4);
          transition: all 0.3s ease;
        }
        .btn-outline:hover {
          background: rgba(206,162,110,0.1);
          border-color: rgba(206,162,110,0.8);
          transform: translateY(-2px);
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          pointer-events: none;
        }
        .animate-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .animate-section.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .feature-icon-wrap {
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .guide-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .guide-card.active {
          background: rgba(206,162,110,0.1);
          border-color: rgba(206,162,110,0.5);
          box-shadow: 0 0 40px rgba(206,162,110,0.1), inset 0 1px 0 rgba(206,162,110,0.2);
        }
        .workflow-line {
          position: absolute;
          width: 2px;
          background: linear-gradient(180deg, rgba(206,162,110,0.5), rgba(206,162,110,0.1));
        }
        .highlight-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 10px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 500;
          background: rgba(206,162,110,0.08);
          border: 1px solid rgba(206,162,110,0.15);
          color: #cea26e;
        }
      `}</style>

      {/* ─── NAVBAR ──────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: scrollY > 50 ? 'rgba(9,9,11,0.85)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'all 0.4s ease',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #cea26e, #b8915f)', color: 'white' }}
          >
            ت
          </div>
          <span className="font-bold text-white text-sm hidden sm:block">
            {isRTL ? 'تلال البداية' : 'Telal Al-Bidaya'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="btn-outline rounded-full px-4 py-1.5 text-xs font-semibold text-[#cea26e]"
          >
            {lang === 'en' ? 'عربي' : 'English'}
          </button>
          <a
            href="/login"
            className="btn-primary rounded-full px-5 py-2 text-sm font-bold text-white"
          >
            {t.trySystem} →
          </a>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        <div className="orb w-[600px] h-[600px] glow-pulse" style={{ background: '#cea26e', top: '-150px', left: '-200px' }} />
        <div className="orb w-[400px] h-[400px]" style={{ background: '#b8915f', bottom: '-100px', right: '-100px' }} />
        <div className="orb w-[300px] h-[300px]" style={{ background: '#6b4c2a', top: '40%', left: '60%' }} />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(206,162,110,1) 1px, transparent 1px), linear-gradient(90deg, rgba(206,162,110,1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="slide-up inline-flex items-center gap-2 gold-glass rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#cea26e] glow-pulse" />
            <span className="text-[#cea26e] text-xs font-semibold tracking-wider uppercase">{t.badge}</span>
          </div>

          <h1
            className="slide-up font-black mb-6 leading-none"
            style={{ animationDelay: '0.1s', fontSize: 'clamp(3rem, 10vw, 7rem)' }}
          >
            <span className="shimmer-text">{t.heroTitle}</span>
          </h1>

          <p
            className="slide-up text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ animationDelay: '0.2s', fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}
          >
            {t.heroSubtitle}
          </p>

          <div className="slide-up flex flex-col sm:flex-row gap-4 items-center justify-center" style={{ animationDelay: '0.3s' }}>
            <a
              href="/login"
              className="btn-primary rounded-2xl px-8 py-4 text-lg font-bold text-white flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              <span className="text-[#fff9]">{Icons.play}</span>
              {t.trySystem}
            </a>
            <a
              href="#features"
              className="btn-outline rounded-2xl px-8 py-4 text-lg font-semibold text-[#cea26e] w-full sm:w-auto text-center"
            >
              {t.exploreFeatures} ↓
            </a>
          </div>

          {/* Stats */}
          <div
            className="slide-up grid grid-cols-3 gap-4 max-w-xl mx-auto mt-16 glass rounded-2xl p-6"
            style={{ animationDelay: '0.4s' }}
          >
            {[
              { val: '10+', label: isRTL ? 'وحدة إدارية' : 'Admin Modules' },
              { val: '21', label: isRTL ? 'نقطة API' : 'API Endpoints' },
              { val: '100%', label: isRTL ? 'ثنائي اللغة' : 'Bilingual' },
            ].map((s) => (
              <div key={s.val} className="text-center">
                <p className="text-2xl font-black shimmer-text">{s.val}</p>
                <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs text-zinc-500">{isRTL ? 'انتقل لأسفل' : 'Scroll'}</span>
          <div className="w-5 h-9 rounded-full border border-zinc-600 flex items-start justify-center pt-2">
            <div
              className="w-1 h-2 rounded-full bg-[#cea26e]"
              style={{ animation: 'float 1.5s ease-in-out infinite' }}
            />
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────── */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div
            id="features-header"
            data-animate
            className={`text-center mb-16 animate-section ${isVisible('features-header') ? 'visible' : ''}`}
          >
            <p className="text-[#cea26e] text-sm font-semibold tracking-widest uppercase mb-3">
              {isRTL ? 'المميزات' : 'Features'}
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">{t.featuresTitle}</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">{t.featuresSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.features.map((f, i) => (
              <div
                key={i}
                id={`feature-${i}`}
                data-animate
                className={`animate-section ${isVisible(`feature-${i}`) ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * 0.07}s` }}
              >
                <div className="glass card-hover rounded-2xl p-6 h-full cursor-default">
                  {/* Icon */}
                  <div
                    className="feature-icon-wrap w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-[#cea26e]"
                    style={{ background: 'rgba(206,162,110,0.12)', border: '1px solid rgba(206,162,110,0.2)' }}
                  >
                    {getIcon(f.icon)}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">{f.desc}</p>
                  
                  {/* Highlight tags */}
                  <div className="flex flex-wrap gap-2">
                    {f.highlights.map((h, hi) => (
                      <span key={hi} className="highlight-tag">
                        <span style={{ color: '#cea26e' }}>{Icons.check}</span>
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── USER GUIDE (Interactive Workflow) ──────────── */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="orb w-[500px] h-[500px]" style={{ background: '#cea26e', top: '0', left: '50%', transform: 'translateX(-50%)', opacity: 0.06 }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div
            id="guide-header"
            data-animate
            className={`text-center mb-16 animate-section ${isVisible('guide-header') ? 'visible' : ''}`}
          >
            <p className="text-[#cea26e] text-sm font-semibold tracking-widest uppercase mb-3">
              {isRTL ? 'سير العمل' : 'Workflow'}
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">{t.guideTitle}</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">{t.guideSubtitle}</p>
          </div>

          {/* Interactive guide layout */}
          <div
            id="guide-grid"
            data-animate
            className={`animate-section ${isVisible('guide-grid') ? 'visible' : ''}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
              {/* Left: Step list */}
              <div className="flex flex-col gap-2">
                {t.guide.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveGuide(i)}
                    className={`guide-card glass rounded-xl px-5 py-4 text-left flex items-center gap-4 ${activeGuide === i ? 'active' : ''}`}
                    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: activeGuide === i ? 'linear-gradient(135deg, #cea26e, #b8915f)' : 'rgba(206,162,110,0.1)',
                        color: activeGuide === i ? '#fff' : '#cea26e',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {getIcon(step.icon)}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold text-sm ${activeGuide === i ? 'text-white' : 'text-zinc-300'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">{step.action}</p>
                    </div>
                    <div
                      className="shrink-0 opacity-40"
                      style={{
                        marginLeft: isRTL ? '0' : 'auto',
                        marginRight: isRTL ? 'auto' : '0',
                        transform: `rotate(${isRTL ? '180deg' : '0deg'})`,
                      }}
                    >
                      {Icons.arrowRight}
                    </div>
                  </button>
                ))}
              </div>

              {/* Right: Active step detail */}
              <div
                className="gold-glass rounded-2xl p-8 lg:p-10 relative overflow-hidden"
                style={{ minHeight: 340 }}
              >
                {/* Step number watermark */}
                <div
                  className="absolute top-4 opacity-[0.06] font-black leading-none pointer-events-none"
                  style={{
                    fontSize: '12rem',
                    right: isRTL ? 'auto' : '20px',
                    left: isRTL ? '20px' : 'auto',
                    color: '#cea26e',
                  }}
                >
                  {String(activeGuide + 1).padStart(2, '0')}
                </div>

                <div className="relative z-10">
                  {/* Step indicator */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                      style={{ background: 'linear-gradient(135deg, #cea26e, #b8915f)' }}
                    >
                      {getIcon(t.guide[activeGuide].icon)}
                    </div>
                    <div>
                      <p className="text-xs text-[#cea26e] font-semibold tracking-wider uppercase">
                        {isRTL ? `الخطوة ${activeGuide + 1}` : `Step ${activeGuide + 1}`} / {t.guide.length}
                      </p>
                      <h3 className="text-2xl font-bold text-white">{t.guide[activeGuide].title}</h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-zinc-300 text-base leading-relaxed mb-8 max-w-lg">
                    {t.guide[activeGuide].desc}
                  </p>

                  {/* Action & Result cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-4">
                      <p className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">
                        {isRTL ? 'الإجراء' : 'Action'}
                      </p>
                      <p className="text-sm text-[#cea26e] font-semibold flex items-center gap-2">
                        <span className="opacity-60">{Icons.arrowRight}</span>
                        {t.guide[activeGuide].action}
                      </p>
                    </div>
                    <div className="glass rounded-xl p-4">
                      <p className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">
                        {isRTL ? 'النتيجة' : 'Result'}
                      </p>
                      <p className="text-sm text-emerald-400 font-semibold flex items-center gap-2">
                        <span className="opacity-80">{Icons.check}</span>
                        {t.guide[activeGuide].result}
                      </p>
                    </div>
                  </div>

                  {/* Step progress dots */}
                  <div className="flex items-center gap-2 mt-8">
                    {t.guide.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveGuide(i)}
                        className="transition-all duration-300"
                        style={{
                          width: activeGuide === i ? 28 : 8,
                          height: 8,
                          borderRadius: 100,
                          background: activeGuide === i
                            ? 'linear-gradient(90deg, #cea26e, #b8915f)'
                            : 'rgba(206,162,110,0.2)',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            id="guide-cta"
            data-animate
            className={`text-center mt-16 animate-section ${isVisible('guide-cta') ? 'visible' : ''}`}
          >
            <a
              href="/login"
              className="btn-primary inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-xl font-bold text-white"
            >
              <span className="opacity-80">{Icons.play}</span>
              {t.trySystem}
            </a>
          </div>
        </div>
      </section>

      {/* ─── TECH STACK ─────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div
            id="tech-header"
            data-animate
            className={`text-center mb-12 animate-section ${isVisible('tech-header') ? 'visible' : ''}`}
          >
            <p className="text-[#cea26e] text-sm font-semibold tracking-widest uppercase mb-3">
              {isRTL ? 'التقنيات' : 'Technology'}
            </p>
            <h2 className="text-4xl font-black text-white">{t.techTitle}</h2>
          </div>

          <div
            id="tech-grid"
            data-animate
            className={`grid grid-cols-2 sm:grid-cols-4 gap-4 animate-section ${isVisible('tech-grid') ? 'visible' : ''}`}
          >
            {techStack.map((tech, i) => (
              <div
                key={i}
                className="glass card-hover rounded-2xl p-5 text-center"
                style={{ transitionDelay: `${i * 0.05}s` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black mx-auto mb-3"
                  style={{ background: tech.bg, color: tech.color }}
                >
                  {tech.icon}
                </div>
                <p className="text-white text-xs font-semibold">{tech.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="orb w-[800px] h-[400px]" style={{ background: '#cea26e', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.08 }} />

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#cea26e]/10 pointer-events-none"
          style={{ animation: 'spin-slow 30s linear infinite' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-[#cea26e]/10 pointer-events-none"
          style={{ animation: 'spin-slow 20s linear infinite reverse' }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div
            id="final-cta"
            data-animate
            className={`animate-section ${isVisible('final-cta') ? 'visible' : ''}`}
          >
            <p className="text-[#cea26e] text-sm font-semibold tracking-widest uppercase mb-4">
              {isRTL ? 'جاهز للبدء؟' : 'Ready to Begin?'}
            </p>
            <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
              {isRTL ? (
                <>ابدأ إدارة<br /><span className="shimmer-text">عقاراتك الآن</span></>
              ) : (
                <>Start Managing<br /><span className="shimmer-text">Your Properties</span></>
              )}
            </h2>
            <p className="text-zinc-400 text-lg mb-10">
              {isRTL
                ? 'نظام متكامل يغطي كل جانب من جوانب إدارة العقارات.'
                : 'A complete system covering every aspect of property management.'}
            </p>
            <a
              href="/login"
              className="btn-primary inline-flex items-center gap-3 rounded-2xl px-12 py-5 text-xl font-bold text-white"
            >
              {t.trySystem} →
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #cea26e, #b8915f)', color: 'white' }}
            >
              ت
            </div>
            <span className="text-zinc-500 text-sm">{t.footerText}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="text-zinc-500 text-xs hover:text-[#cea26e] transition-colors"
            >
              {lang === 'en' ? 'عربي' : 'English'}
            </button>
            <a href="/login" className="text-zinc-500 text-xs hover:text-[#cea26e] transition-colors">
              {t.trySystem}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
