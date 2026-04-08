'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { PROJECT_DOCUMENT_TYPES, type ProjectDocumentTypeKey } from '@/lib/projectDocumentTypes';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Download,
  Eye,
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

type ApiUser = { id: string; name: string; email: string };

type ProjectDocument = {
  id: string;
  projectId: string;
  documentType: ProjectDocumentTypeKey;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy?: ApiUser | null;
  notes?: string | null;
  previewStoragePath?: string | null; // not used in UI directly
};

function formatFileSize(bytes: number) {
  if (!bytes && bytes !== 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageMime(mime: string) {
  return mime.startsWith('image/');
}

function isPdfMime(mime: string) {
  return mime === 'application/pdf';
}

function getFileTypeIcon(mimeType: string) {
  if (isPdfMime(mimeType)) return <FileText className="h-5 w-5 text-red-500" />;
  if (isImageMime(mimeType)) return <ImageIcon className="h-5 w-5 text-blue-500" />;
  return <FileIcon className="h-5 w-5 text-muted-foreground" />;
}

export default function ProjectDocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [previewDoc, setPreviewDoc] = useState<ProjectDocument | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<ProjectDocument | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const uploadInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const replaceInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const grouped = useMemo(() => {
    const map = new Map<ProjectDocumentTypeKey, ProjectDocument[]>();
    for (const t of PROJECT_DOCUMENT_TYPES) map.set(t.key, []);
    for (const d of documents) {
      const arr = map.get(d.documentType) || [];
      arr.push(d);
      map.set(d.documentType, arr);
    }
    return map;
  }, [documents]);

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/documents`),
      ]);
      const pJson = await pRes.json();
      if (pJson?.data?.name) setProjectName(pJson.data.name);

      const dJson = await dRes.json();
      setDocuments(dJson?.data?.documents || []);
    } catch {
      showToast(isAr ? 'فشل تحميل مستندات المشروع' : 'Failed to load project documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const uploadFiles = async (documentType: ProjectDocumentTypeKey, files: FileList | File[]) => {
    if (!id) return;
    const list = Array.isArray(files) ? files : Array.from(files);
    if (list.length === 0) return;

    setBusyId(`upload:${documentType}`);
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      for (const f of list) formData.append('files', f);

      const res = await fetch(`/api/projects/${id}/documents`, { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Upload failed');

      showToast(isAr ? 'تم رفع الملفات بنجاح' : 'Files uploaded successfully');
      await fetchAll();
    } catch (e: any) {
      showToast(e?.message || (isAr ? 'فشل رفع الملف' : 'Failed to upload'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const replaceFile = async (doc: ProjectDocument, file: File) => {
    if (!id) return;
    setBusyId(`replace:${doc.id}`);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/projects/${id}/documents/${doc.id}`, { method: 'PUT', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Replace failed');

      showToast(isAr ? 'تم استبدال الملف' : 'File replaced');
      await fetchAll();
    } catch (e: any) {
      showToast(e?.message || (isAr ? 'فشل الاستبدال' : 'Failed to replace'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!id || !deleteDoc) return;
    setBusyId(`delete:${deleteDoc.id}`);
    try {
      const res = await fetch(`/api/projects/${id}/documents/${deleteDoc.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Delete failed');
      showToast(isAr ? 'تم حذف الملف' : 'File deleted');
      setDeleteDoc(null);
      await fetchAll();
    } catch (e: any) {
      showToast(e?.message || (isAr ? 'فشل الحذف' : 'Failed to delete'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const openPreview = (doc: ProjectDocument) => {
    setPreviewDoc(doc);
  };

  const download = (doc: ProjectDocument) => {
    if (!id) return;
    window.open(`/api/projects/${id}/documents/${doc.id}/download`, '_blank', 'noopener,noreferrer');
  };

  const previewUrl = previewDoc && id ? `/api/projects/${id}/documents/${previewDoc.id}/preview` : '';

  const accept = '.pdf,.jpg,.jpeg,.png,.heic,.heif,.webp';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#cea26e]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={dir}>
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-destructive'
            } text-white`}
          >
            {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {toast.message}
          </div>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground transition-colors">
            {isAr ? 'المشاريع' : 'Projects'}
          </Link>
          {isAr ? <ArrowRight className="h-3 w-3 rotate-180" /> : <ArrowRight className="h-3 w-3" />}
          <Link href={`/projects/${id}`} className="hover:text-foreground transition-colors">
            {projectName || (isAr ? 'تفاصيل المشروع' : 'Project Details')}
          </Link>
          {isAr ? <ArrowRight className="h-3 w-3 rotate-180" /> : <ArrowRight className="h-3 w-3" />}
          <span className="text-foreground font-medium">{isAr ? 'مستندات المشروع' : 'Project Documents'}</span>
        </div>

        {/* Header */}
        <Card className="p-6 shadow-sm border-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">{isAr ? 'مستندات المشروع' : 'Project Documents'}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {projectName ? (
                  <>
                    {isAr ? 'المشروع:' : 'Project:'} <span className="font-medium text-foreground">{projectName}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">{isAr ? 'إدارة ملفات المشروع' : 'Manage project files'}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {isAr ? 'الصيغ المدعومة:' : 'Supported formats:'} PDF, JPG, JPEG, PNG, HEIC/HEIF{', '}
                {isAr ? 'و' : 'and'} WEBP
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchAll}>
                <RefreshCw className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {isAr ? 'تحديث' : 'Refresh'}
              </Button>
              <Link href={`/projects/${id}`}>
                <Button className="bg-[#cea26e] hover:bg-[#b8915f] text-white">
                  {isAr ? <ArrowRight className="h-4 w-4 ml-2" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
                  {isAr ? 'العودة' : 'Back'}
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Document Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {PROJECT_DOCUMENT_TYPES.map((type) => {
            const items = grouped.get(type.key) || [];
            const status =
              items.length === 0 ? (isAr ? 'غير مرفوع' : 'Not uploaded') : items.length === 1 ? (isAr ? 'مرفوع' : 'Uploaded') : isAr ? 'عدة ملفات' : 'Multiple files';

            return (
              <Card key={type.key} className="p-5 shadow-sm border-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-base">{isAr ? type.labelAr : type.labelEn}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">{isAr ? 'الحالة:' : 'Status:'}</span> {status}
                      {!type.allowMultiple && (
                        <span className="ml-2 rtl:ml-0 rtl:mr-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded bg-muted">
                          {isAr ? 'ملف واحد' : 'Single file'}
                        </span>
                      )}
                      {type.allowMultiple && (
                        <span className="ml-2 rtl:ml-0 rtl:mr-2 inline-flex items-center text-[11px] px-2 py-0.5 rounded bg-muted">
                          {isAr ? 'عدة ملفات' : 'Multi file'}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={(el) => {
                        uploadInputsRef.current[type.key] = el;
                      }}
                      type="file"
                      className="hidden"
                      accept={accept}
                      multiple={type.allowMultiple}
                      onChange={(e) => {
                        if (e.target.files) uploadFiles(type.key, e.target.files);
                        e.currentTarget.value = '';
                      }}
                    />
                    <Button
                      onClick={() => uploadInputsRef.current[type.key]?.click()}
                      className="bg-[#cea26e] hover:bg-[#b8915f] text-white"
                      disabled={busyId === `upload:${type.key}`}
                    >
                      {busyId === `upload:${type.key}` ? (
                        <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      )}
                      {items.length === 0 ? (isAr ? 'رفع' : 'Upload') : type.allowMultiple ? (isAr ? 'إضافة' : 'Add') : isAr ? 'استبدال' : 'Replace'}
                    </Button>
                  </div>
                </div>

                {/* Drop area */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dropped = Array.from(e.dataTransfer.files || []);
                    if (!type.allowMultiple && dropped.length > 1) {
                      showToast(isAr ? 'هذا النوع يسمح بملف واحد فقط' : 'This type only allows a single file', 'error');
                      return;
                    }
                    uploadFiles(type.key, dropped);
                  }}
                  className="mt-4 border-2 border-dashed rounded-xl p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#cea26e]/10 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-[#cea26e]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {isAr ? 'اسحب وأفلت الملفات هنا' : 'Drag & drop files here'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isAr ? 'أو اضغط زر الرفع' : 'or click Upload'} • {accept}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Files list */}
                <div className="mt-4 space-y-2">
                  {items.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-3">
                      {isAr ? 'لا يوجد ملفات مرفوعة لهذا المستند بعد.' : 'No files uploaded for this document yet.'}
                    </div>
                  ) : (
                    items.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
                      >
                        <div className="p-2 rounded-md bg-muted">{getFileTypeIcon(doc.mimeType)}</div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.originalFileName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatFileSize(doc.fileSize)} •{' '}
                            {new Date(doc.uploadedAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {doc.uploadedBy?.name ? ` • ${doc.uploadedBy.name}` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openPreview(doc)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title={isAr ? 'عرض' : 'View'}
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => download(doc)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title={isAr ? 'تحميل' : 'Download'}
                          >
                            <Download className="h-4 w-4 text-muted-foreground" />
                          </button>

                          <input
                            ref={(el) => {
                              replaceInputsRef.current[doc.id] = el;
                            }}
                            type="file"
                            className="hidden"
                            accept={accept}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) replaceFile(doc, f);
                              e.currentTarget.value = '';
                            }}
                          />
                          <button
                            onClick={() => replaceInputsRef.current[doc.id]?.click()}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title={isAr ? 'استبدال' : 'Replace'}
                            disabled={busyId === `replace:${doc.id}`}
                          >
                            {busyId === `replace:${doc.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>

                          <button
                            onClick={() => setDeleteDoc(doc)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                            title={isAr ? 'حذف' : 'Delete'}
                            disabled={busyId === `delete:${doc.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Preview Dialog */}
        <Dialog open={!!previewDoc} onOpenChange={(v) => !v && setPreviewDoc(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{isAr ? 'معاينة الملف' : 'File Preview'}</DialogTitle>
            </DialogHeader>

            {!previewDoc ? null : isImageMime(previewDoc.mimeType) || previewDoc.mimeType === 'image/heic' || previewDoc.mimeType === 'image/heif' ? (
              // Use preview endpoint (HEIC will be converted to JPEG preview server-side)
              <div className="rounded-lg overflow-hidden border border-border bg-black/5">
                <img src={previewUrl} alt={previewDoc.originalFileName} className="w-full h-auto max-h-[70vh] object-contain bg-black/5" />
              </div>
            ) : isPdfMime(previewDoc.mimeType) ? (
              <div className="rounded-lg overflow-hidden border border-border">
                <iframe title="PDF Preview" src={previewUrl} className="w-full h-[70vh]" />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {isAr ? 'المعاينة غير مدعومة لهذا النوع. يمكنك التحميل.' : 'Preview not supported for this file type. You can download it.'}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewDoc(null)}>
                <X className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {isAr ? 'إغلاق' : 'Close'}
              </Button>
              {previewDoc && (
                <Button className="bg-[#cea26e] hover:bg-[#b8915f] text-white" onClick={() => download(previewDoc)}>
                  <Download className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {isAr ? 'تحميل' : 'Download'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteDoc} onOpenChange={(v) => !v && setDeleteDoc(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isAr ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm">
              {isAr ? 'هل أنت متأكد من حذف الملف:' : 'Are you sure you want to delete:'}{' '}
              <span className="font-semibold text-foreground">"{deleteDoc?.originalFileName}"</span>؟
            </p>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setDeleteDoc(null)} disabled={busyId?.startsWith('delete:')}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={busyId?.startsWith('delete:')}>
                {busyId?.startsWith('delete:') ? <Loader2 className="h-4 w-4 ltr:mr-2 rtl:ml-2 animate-spin" /> : null}
                {isAr ? 'حذف' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

