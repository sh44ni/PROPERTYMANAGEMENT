// ============================================
// SHARED TYPES FOR TELAL APP
// These types match the Prisma schema and are
// used by both frontend pages and API routes
// ============================================

// ============================================
// PROJECTS
// ============================================
export interface Project {
    id: string;
    name: string;
    description?: string | null;
    location?: string | null;
    image?: string | null;
    budget: number;
    spent: number;
    totalUnits: number;
    soldUnits: number;
    status: 'planning' | 'in_progress' | 'completed';
    progress: number;
    startDate?: string | null;
    endDate?: string | null;
    createdAt: string;
    updatedAt: string;
    updates?: ProjectUpdate[];
}

export interface ProjectUpdate {
    id: string;
    projectId: string;
    details: string;
    progress: number;
    updatedAt: string;
}

export interface CreateProjectInput {
    name: string;
    description?: string;
    location?: string;
    image?: string;
    budget: number;
    totalUnits: number;
    startDate?: string;
    endDate?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
    status?: 'planning' | 'in_progress' | 'completed';
    progress?: number;
    spent?: number;
    soldUnits?: number;
}

// ============================================
// PROPERTIES
// ============================================
export interface Property {
    id: string;
    projectId?: string | null;
    project?: Project | null;
    title: string;
    type: 'villa' | 'apartment' | 'land' | 'building' | 'commercial';
    status: 'available' | 'rented' | 'sold';
    area?: string | null;
    location?: string | null;
    price: number;
    bedrooms?: number | null;
    bathrooms?: number | null;
    description?: string | null;
    images: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CreatePropertyInput {
    projectId?: string;
    title: string;
    type: 'villa' | 'apartment' | 'land' | 'building' | 'commercial';
    area?: string;
    location?: string;
    price: number;
    bedrooms?: number;
    bathrooms?: number;
    description?: string;
    images: string[];
}

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
    status?: 'available' | 'rented' | 'sold';
}

// ============================================
// CUSTOMERS
// ============================================
export interface Customer {
    id: string;
    name: string;
    email?: string | null;
    phone: string;
    nationality?: string | null;
    address?: string | null;
    idType1?: string | null;
    idNumber1?: string | null;
    idImage1?: string | null;
    idType2?: string | null;
    idNumber2?: string | null;
    idImage2?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCustomerInput {
    name: string;
    email?: string;
    phone: string;
    nationality?: string;
    address?: string;
    idType1?: string;
    idNumber1?: string;
    idImage1?: string;
    idType2?: string;
    idNumber2?: string;
    idImage2?: string;
    notes?: string;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

// ============================================
// RENTALS
// ============================================
export interface Rental {
    id: string;
    propertyId: string;
    property?: Property;
    customerId: string;
    customer?: Customer;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    depositAmount: number;
    paymentDay: number;
    status: 'active' | 'expired' | 'terminated';
    paidUntil?: string | null;
    paymentStatus: 'paid' | 'pending' | 'overdue';
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRentalInput {
    propertyId: string;
    customerId: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    depositAmount?: number;
    paymentDay?: number;
    notes?: string;
}

export interface UpdateRentalInput extends Partial<CreateRentalInput> {
    status?: 'active' | 'expired' | 'terminated';
    paidUntil?: string;
    paymentStatus?: 'paid' | 'pending' | 'overdue';
}

// ============================================
// TRANSACTIONS (Accounts)
// ============================================
export interface Transaction {
    id: string;
    transactionNo: string;
    category: 'income' | 'expense';
    type: string;
    amount: number;
    paidBy: string;
    customerId?: string | null;
    customer?: Customer | null;
    propertyId?: string | null;
    property?: Property | null;
    rentalId?: string | null;
    rental?: Rental | null;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque';
    reference?: string | null;
    description?: string | null;
    receiptImage?: string | null;
    date: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTransactionInput {
    category: 'income' | 'expense';
    type: string;
    amount: number;
    paidBy: string;
    customerId?: string;
    propertyId?: string;
    rentalId?: string;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'cheque';
    reference?: string;
    description?: string;
    receiptImage?: string;
    date?: string;
}

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

// ============================================
// CONTRACTS - RENTAL
// ============================================
export interface RentalContract {
    id: string;
    contractNumber: string;
    status: 'draft' | 'signed' | 'terminated';
    // Landlord
    landlordName: string;
    landlordCR?: string | null;
    landlordPOBox?: string | null;
    landlordPostalCode?: string | null;
    landlordAddress?: string | null;
    // Tenant
    tenantId?: string | null;
    tenant?: Customer | null;
    tenantName: string;
    tenantIdPassport: string;
    tenantLabourCard?: string | null;
    tenantPhone: string;
    tenantEmail?: string | null;
    tenantSponsor?: string | null;
    tenantCR?: string | null;
    // Terms
    validFrom: string;
    validTo: string;
    agreementPeriod?: string | null;
    monthlyRent: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
    // Signatures
    landlordSignature?: string | null;
    landlordSignDate?: string | null;
    tenantSignature?: string | null;
    tenantSignDate?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRentalContractInput {
    landlordName: string;
    landlordCR?: string;
    landlordPOBox?: string;
    landlordPostalCode?: string;
    landlordAddress?: string;
    tenantId?: string;
    tenantName: string;
    tenantIdPassport: string;
    tenantLabourCard?: string;
    tenantPhone: string;
    tenantEmail?: string;
    tenantSponsor?: string;
    tenantCR?: string;
    validFrom: string;
    validTo: string;
    agreementPeriod?: string;
    monthlyRent: number;
    paymentFrequency?: 'monthly' | 'quarterly' | 'yearly';
}

// ============================================
// CONTRACTS - SALE
// ============================================
export interface SaleContract {
    id: string;
    contractNumber: string;
    status: 'draft' | 'signed' | 'completed';
    // Seller
    sellerNationalId?: string | null;
    sellerName: string;
    sellerCR?: string | null;
    sellerNationality?: string | null;
    sellerAddress?: string | null;
    sellerPhone?: string | null;
    // Buyer
    buyerId?: string | null;
    buyer?: Customer | null;
    buyerNationalId?: string | null;
    buyerName: string;
    buyerCR?: string | null;
    buyerNationality?: string | null;
    buyerAddress?: string | null;
    buyerPhone?: string | null;
    // Property
    propertyWilaya: string;
    propertyGovernorate?: string | null;
    propertyPhase?: string | null;
    propertyLandNumber?: string | null;
    propertyArea?: string | null;
    // Payment
    totalPrice: number;
    totalPriceWords?: string | null;
    depositAmount: number;
    depositAmountWords?: string | null;
    depositDate?: string | null;
    remainingAmount: number;
    remainingAmountWords?: string | null;
    remainingDueDate?: string | null;
    finalPaymentAmount: number;
    finalPaymentWords?: string | null;
    // Construction
    constructionStartDate?: string | null;
    constructionEndDate?: string | null;
    notes?: string | null;
    sellerSignature?: string | null;
    buyerSignature?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSaleContractInput {
    sellerNationalId?: string;
    sellerName: string;
    sellerCR?: string;
    sellerNationality?: string;
    sellerAddress?: string;
    sellerPhone?: string;
    buyerId?: string;
    buyerNationalId?: string;
    buyerName: string;
    buyerCR?: string;
    buyerNationality?: string;
    buyerAddress?: string;
    buyerPhone?: string;
    propertyWilaya: string;
    propertyGovernorate?: string;
    propertyPhase?: string;
    propertyLandNumber?: string;
    propertyArea?: string;
    totalPrice: number;
    totalPriceWords?: string;
    depositAmount?: number;
    depositAmountWords?: string;
    depositDate?: string;
    remainingAmount?: number;
    remainingAmountWords?: string;
    remainingDueDate?: string;
    finalPaymentAmount?: number;
    finalPaymentWords?: string;
    constructionStartDate?: string;
    constructionEndDate?: string;
    notes?: string;
}

// ============================================
// DOCUMENTS
// ============================================
export interface Document {
    id: string;
    name: string;
    originalName: string;
    type: string;
    category: string;
    size: number;
    mimeType: string;
    filePath?: string | null;
    fileUrl?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDocumentInput {
    name: string;
    originalName: string;
    type: string;
    category: string;
    size: number;
    mimeType: string;
    filePath?: string;
    fileUrl?: string;
}

// ============================================
// SETTINGS
// ============================================
export interface Area {
    id: string;
    name: string;
    createdAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
