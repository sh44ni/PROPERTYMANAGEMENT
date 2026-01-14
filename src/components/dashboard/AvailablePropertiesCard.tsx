'use client';

import Link from 'next/link';
import { Search, Home, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

interface Property {
    id: string;
    propertyId: string;
    name: string;
    nameAr: string;
    location: string;
    locationAr: string;
    type: 'villa' | 'apartment';
    rent: number;
    bedrooms: number;
    area: number;
    image?: string;
}

interface AvailablePropertiesCardProps {
    properties?: Property[];
}

const defaultProperties: Property[] = [
    {
        id: '1',
        propertyId: 'PRP-0012',
        name: 'Modern Villa',
        nameAr: 'فيلا حديثة',
        location: 'Al Khuwair, Muscat',
        locationAr: 'الخوير، مسقط',
        type: 'villa',
        rent: 650,
        bedrooms: 4,
        area: 280,
    },
    {
        id: '2',
        propertyId: 'PRP-0015',
        name: 'Luxury Apartment',
        nameAr: 'شقة فاخرة',
        location: 'Qurum, Muscat',
        locationAr: 'القرم، مسقط',
        type: 'apartment',
        rent: 380,
        bedrooms: 2,
        area: 120,
    },
    {
        id: '3',
        propertyId: 'PRP-0018',
        name: 'Family Villa',
        nameAr: 'فيلا عائلية',
        location: 'Al Hail, Muscat',
        locationAr: 'الحيل، مسقط',
        type: 'villa',
        rent: 800,
        bedrooms: 5,
        area: 350,
    },
    {
        id: '4',
        propertyId: 'PRP-0022',
        name: 'Studio Apartment',
        nameAr: 'شقة استوديو',
        location: 'Al Ghubra, Muscat',
        locationAr: 'الغبرة، مسقط',
        type: 'apartment',
        rent: 220,
        bedrooms: 1,
        area: 55,
    },
];

export function AvailablePropertiesCard({
    properties = defaultProperties,
}: AvailablePropertiesCardProps) {
    const { t, language } = useLanguage();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language === 'ar' ? 'ar-OM' : 'en-OM', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const currencyLabel = language === 'ar' ? 'ر.ع' : 'OMR';
    const bedroomLabel = language === 'ar' ? 'غرفة' : 'BR';
    const monthLabel = language === 'ar' ? '/شهر' : '/mo';

    return (
        <Card className="p-5 shadow-sm border-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-base font-semibold text-foreground">
                    {t.dashboard.availableProperties}
                </h3>
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    {properties.length}
                </Badge>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
                <Input
                    type="search"
                    placeholder={`${t.common.search}...`}
                    className="h-10 pl-10 rtl:pl-4 rtl:pr-10 bg-muted/50 border-0"
                />
            </div>

            {/* Property List */}
            <div className="space-y-3">
                {properties.slice(0, 4).map((property) => {
                    const Icon = property.type === 'villa' ? Home : Building2;

                    return (
                        <div
                            key={property.id}
                            className="flex items-start gap-3 rounded-xl p-3 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                            {/* Icon or Image */}
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#cea26e]/10">
                                <Icon className="h-6 w-6 text-[#cea26e]" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] h-5 border-[#cea26e]/30 text-[#cea26e] bg-[#cea26e]/5"
                                    >
                                        {property.propertyId}
                                    </Badge>
                                </div>
                                <p className="text-sm font-medium text-foreground truncate">
                                    {language === 'ar' ? property.nameAr : property.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate mb-1">
                                    {language === 'ar' ? property.locationAr : property.location}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                        {formatCurrency(property.rent)} {currencyLabel}
                                    </span>
                                    {monthLabel} · {property.bedrooms} {bedroomLabel} · {property.area}m²
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View All Link */}
            <div className="mt-4 text-center">
                <Link
                    href="/properties"
                    className="text-sm font-medium text-[#cea26e] hover:text-[#b8915f] transition-colors"
                >
                    {language === 'ar' ? 'عرض جميع العقارات' : 'View All Properties'}
                </Link>
            </div>
        </Card>
    );
}
