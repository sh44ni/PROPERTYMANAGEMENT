'use client';

import { useState, useRef, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Upload,
    FileText,
    File,
    Image,
    FileSpreadsheet,
    Trash2,
    Download,
    Search,
    Filter,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
    ChevronDown,
    FolderOpen,
    Calendar,
} from 'lucide-react';

// Document interface
interface Document {
    id: string;
    name: string;
    originalName: string;
    type: string;
    category: string;
    size: number;
    uploadDate: string;
    fileData?: string; // Base64 for demo
    mimeType: string;
}

// Document categories
const documentCategories = [
    { value: 'legal', label: 'Legal Document' },
    { value: 'rental_agreement', label: 'Rental Agreement' },
    { value: 'sale_contract', label: 'Sale Contract' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'id_document', label: 'ID Document' },
    { value: 'property_deed', label: 'Property Deed' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'tax', label: 'Tax Document' },
    { value: 'correspondence', label: 'Correspondence' },
    { value: 'other', label: 'Other' },
];

// Mock documents
const mockDocuments: Document[] = [
    {
        id: 'doc1',
        name: 'Land Registration Certificate',
        originalName: 'land_cert_villa_47.pdf',
        type: 'pdf',
        category: 'property_deed',
        size: 1250000,
        uploadDate: '2024-01-15',
        mimeType: 'application/pdf',
    },
    {
        id: 'doc2',
        name: 'Rental Agreement - Al-Harthi',
        originalName: 'rental_fatima_alharthi.pdf',
        type: 'pdf',
        category: 'rental_agreement',
        size: 850000,
        uploadDate: '2024-01-10',
        mimeType: 'application/pdf',
    },
    {
        id: 'doc3',
        name: 'Business License 2024',
        originalName: 'business_license_2024.pdf',
        type: 'pdf',
        category: 'legal',
        size: 520000,
        uploadDate: '2024-01-05',
        mimeType: 'application/pdf',
    },
    {
        id: 'doc4',
        name: 'Insurance Policy - Properties',
        originalName: 'insurance_policy.pdf',
        type: 'pdf',
        category: 'insurance',
        size: 1800000,
        uploadDate: '2024-01-02',
        mimeType: 'application/pdf',
    },
];

export default function DocumentsPage() {
    const { t, language } = useLanguage();
    const [documents, setDocuments] = useState<Document[]>(mockDocuments);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Upload form state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentName, setDocumentName] = useState('');
    const [documentCategory, setDocumentCategory] = useState('other');
    const [uploadErrors, setUploadErrors] = useState<Record<string, boolean>>({});
    const [shakeForm, setShakeForm] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Filter documents
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = !searchQuery ||
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.originalName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [documents, searchQuery, categoryFilter]);

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Get file icon
    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return <FileText className="h-5 w-5 text-red-500" />;
            case 'image':
            case 'jpg':
            case 'png':
                return <Image className="h-5 w-5 text-blue-500" />;
            case 'xlsx':
            case 'xls':
            case 'csv':
                return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
            default:
                return <File className="h-5 w-5 text-gray-500" />;
        }
    };

    // Get category label
    const getCategoryLabel = (category: string) => {
        return documentCategories.find(c => c.value === category)?.label || category;
    };

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Auto-populate name from filename (without extension)
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            setDocumentName(nameWithoutExt);
            if (uploadErrors.file) {
                setUploadErrors({ ...uploadErrors, file: false });
            }
        }
    };

    // Handle upload
    const handleUpload = async () => {
        const errors: Record<string, boolean> = {};
        if (!selectedFile) errors.file = true;
        if (!documentName.trim()) errors.name = true;

        setUploadErrors(errors);
        if (Object.keys(errors).length > 0) {
            setShakeForm(true);
            setTimeout(() => setShakeForm(false), 500);
            return;
        }

        setIsUploading(true);

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get file type
        const ext = selectedFile!.name.split('.').pop()?.toLowerCase() || 'file';

        // Create new document
        const newDocument: Document = {
            id: `doc${Date.now()}`,
            name: documentName.trim(),
            originalName: selectedFile!.name,
            type: ext,
            category: documentCategory,
            size: selectedFile!.size,
            uploadDate: new Date().toISOString().split('T')[0],
            mimeType: selectedFile!.type,
        };

        setDocuments([newDocument, ...documents]);
        showToast(`"${documentName}" uploaded successfully`);

        // Reset form
        setSelectedFile(null);
        setDocumentName('');
        setDocumentCategory('other');
        setIsUploadOpen(false);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Handle delete
    const handleDelete = () => {
        if (!deletingDocument) return;
        setDocuments(documents.filter(d => d.id !== deletingDocument.id));
        showToast('Document deleted');
        setIsDeleteOpen(false);
        setDeletingDocument(null);
    };

    // Handle download (mock)
    const handleDownload = (doc: Document) => {
        showToast(`Downloading "${doc.name}"...`);
        // In real app, this would trigger actual download
    };

    // Stats
    const stats = useMemo(() => {
        const totalSize = documents.reduce((sum, d) => sum + d.size, 0);
        return {
            total: documents.length,
            totalSize: formatFileSize(totalSize),
        };
    }, [documents]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Toast */}
                {toast && (
                    <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right ${toast.type === 'success' ? 'bg-green-600' : 'bg-destructive'
                        } text-white`}>
                        {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {toast.message}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t.documents.title}</h1>
                        <p className="text-sm text-muted-foreground">
                            {stats.total} document{stats.total !== 1 ? 's' : ''} • {stats.totalSize} total
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsUploadOpen(true)}
                        className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                    >
                        <Upload className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                        {t.documents.uploadDocument}
                    </Button>
                </div>

                {/* Search and Filter */}
                <Card className="p-4 shadow-sm border-0">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
                            <Input
                                placeholder={`${t.common.search}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="ltr:pl-9 rtl:pr-9"
                            />
                        </div>
                        <div className="relative min-w-[180px]">
                            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 rounded-md border border-border bg-background text-sm appearance-none cursor-pointer"
                            >
                                <option value="all">{t.documents.allCategories}</option>
                                {documentCategories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                </Card>

                {/* Documents List */}
                {filteredDocuments.length === 0 ? (
                    <Card className="p-8 shadow-sm border-0 text-center">
                        <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                            {documents.length === 0 ? t.documents.noDocuments : t.common.noResults}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredDocuments.map(doc => (
                            <Card key={doc.id} className="p-4 shadow-sm border-0 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    {/* File Icon */}
                                    <div className="p-3 rounded-lg bg-muted">
                                        {getFileIcon(doc.type)}
                                    </div>

                                    {/* Document Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{doc.name}</h3>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <span className="px-2 py-0.5 rounded text-xs bg-[#cea26e]/10 text-[#cea26e] font-medium">
                                                    {getCategoryLabel(doc.category)}
                                                </span>
                                            </span>
                                            <span>{formatFileSize(doc.size)}</span>
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(doc.uploadDate)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate mt-1">
                                            {doc.originalName}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                                            title="Download"
                                        >
                                            <Download className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDeletingDocument(doc);
                                                setIsDeleteOpen(true);
                                            }}
                                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Upload Dialog */}
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t.documents.uploadDocument}</DialogTitle>
                        </DialogHeader>
                        <div className={`space-y-4 ${shakeForm ? 'animate-shake' : ''}`}>
                            {/* File Input */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Select File *</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${uploadErrors.file ? 'border-destructive bg-destructive/5' :
                                        selectedFile ? 'border-[#cea26e] bg-[#cea26e]/5' : 'border-border hover:border-[#cea26e]/50'
                                        }`}
                                >
                                    {selectedFile ? (
                                        <div className="flex items-center justify-center gap-3">
                                            {getFileIcon(selectedFile.name.split('.').pop() || '')}
                                            <div className="text-left">
                                                <p className="font-medium text-sm">{selectedFile.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFile(null);
                                                    setDocumentName('');
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                                className="p-1 hover:bg-muted rounded"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                Click to select a file
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                PDF, Word, Excel, Images
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                                />
                            </div>

                            {/* Document Name */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Document Name *</label>
                                <Input
                                    value={documentName}
                                    onChange={(e) => {
                                        setDocumentName(e.target.value);
                                        if (uploadErrors.name) setUploadErrors({ ...uploadErrors, name: false });
                                    }}
                                    placeholder="Enter document name"
                                    className={uploadErrors.name ? 'border-destructive' : ''}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Auto-filled from filename. Edit if needed.
                                </p>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Document Type</label>
                                <select
                                    value={documentCategory}
                                    onChange={(e) => setDocumentCategory(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                                >
                                    {documentCategories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isUploading}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="bg-[#cea26e] hover:bg-[#b8915f]"
                            >
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4 mr-2" />
                                )}
                                Upload
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Delete Document</DialogTitle>
                        </DialogHeader>
                        <p className="text-muted-foreground">
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{deletingDocument?.name}"</span>? This action cannot be undone.
                        </p>
                        <DialogFooter className="mt-4">
                            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
