'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ReceiptModal({ isOpen, onClose }: ReceiptModalProps) {
    const { t, language } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [rentals, setRentals] = useState<any[]>([]);
    const [selectedRental, setSelectedRental] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    // Fetch active rentals when modal opens
    useEffect(() => {
        if (isOpen) {
            fetch('/api/rentals?status=active')
                .then(res => res.json())
                .then(data => {
                    if (data.data) setRentals(data.data);
                })
                .catch(err => console.error('Failed to fetch rentals', err));
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rentalId: selectedRental,
                    amount: parseFloat(amount),
                    date: new Date(date),
                    category: 'income',
                    type: 'rent_payment',
                    paymentMethod,
                    paidBy: rentals.find(r => r.id === selectedRental)?.customer?.name || 'Tenant',
                    propertyId: rentals.find(r => r.id === selectedRental)?.propertyId,
                    customerId: rentals.find(r => r.id === selectedRental)?.customerId,
                    description: 'Rent Payment'
                }),
            });

            if (res.ok) {
                onClose();
                // Optionally trigger a refresh of dashboard data here
                // For now, simpler to reload or let SWR handle it if used
                window.location.reload();
            } else {
                console.error('Failed to create receipt');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{language === 'ar' ? 'إصدار إيصال' : 'Issue Receipt'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{language === 'ar' ? 'العقار / المستأجر' : 'Property / Tenant'}</label>
                        <select
                            value={selectedRental}
                            onChange={e => setSelectedRental(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">{language === 'ar' ? 'اختر عقد إيجار' : 'Select Rental'}</option>
                            {rentals.map((rental: any) => (
                                <option key={rental.id} value={rental.id}>
                                    {rental.property?.title} - {rental.customer?.firstName} {rental.customer?.lastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{language === 'ar' ? 'المبلغ' : 'Amount'}</label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.000"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{language === 'ar' ? 'التاريخ' : 'Date'}</label>
                        <Input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</label>
                        <select
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="cash">{language === 'ar' ? 'نقد' : 'Cash'}</option>
                            <option value="bank_transfer">{language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                            <option value="cheque">{language === 'ar' ? 'شيك' : 'Cheque'}</option>
                        </select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            {language === 'ar' ? 'الغاء' : 'Cancel'}
                        </Button>
                        <Button type="submit" className="bg-[#cea26e] hover:bg-[#b8915f]" disabled={isLoading || !selectedRental}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {language === 'ar' ? 'إصدار' : 'Issue'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
