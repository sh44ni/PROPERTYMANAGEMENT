export type ProjectDocumentTypeKey =
  | 'property_ownership'
  | 'site_sketch'
  | 'building_permit'
  | 'maps_drawings'
  | 'owner_id_card'
  | 'completion_certificate'
  | 'municipality_approval';

export type ProjectDocumentTypeConfig = {
  key: ProjectDocumentTypeKey;
  labelEn: string;
  labelAr: string;
  allowMultiple: boolean;
};

export const PROJECT_DOCUMENT_TYPES: ProjectDocumentTypeConfig[] = [
  {
    key: 'property_ownership',
    labelEn: 'Property Ownership',
    labelAr: 'ملكية العقار',
    allowMultiple: false,
  },
  {
    key: 'site_sketch',
    labelEn: 'Site Sketch / Croquis',
    labelAr: 'كروكي / مخطط الموقع',
    allowMultiple: false,
  },
  {
    key: 'building_permit',
    labelEn: 'Building Permit',
    labelAr: 'رخصة البناء',
    allowMultiple: false,
  },
  {
    key: 'maps_drawings',
    labelEn: 'Maps / Drawings / Plans',
    labelAr: 'خرائط / رسومات / مخططات',
    allowMultiple: true,
  },
  {
    key: 'owner_id_card',
    labelEn: 'Owner ID Card',
    labelAr: 'بطاقة هوية المالك',
    allowMultiple: false,
  },
  {
    key: 'completion_certificate',
    labelEn: 'Building Completion Certificate',
    labelAr: 'شهادة إتمام البناء',
    allowMultiple: false,
  },
  {
    key: 'municipality_approval',
    labelEn: 'Municipality Approval',
    labelAr: 'اعتماد البلدية',
    allowMultiple: false,
  },
];

export function getProjectDocumentTypeConfig(key: string) {
  return PROJECT_DOCUMENT_TYPES.find((t) => t.key === key) || null;
}

export const PROJECT_DOCUMENT_TYPE_KEYS = PROJECT_DOCUMENT_TYPES.map((t) => t.key);

