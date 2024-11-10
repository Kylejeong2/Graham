import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useState } from "react";
import { createPhoneNumberSubscription } from '../setup-functions/createPhoneNumberSubscription';
import type { User } from '@graham/db';

interface BuyPhoneNumberModalProps {
    isOpen: boolean;
    onClose: () => void;
    userPhoneNumbers: string[];
    setUserPhoneNumbers: (numbers: string[]) => void;
    user: User;
    agentId: string;
}

export const BuyPhoneNumberModal = ({ isOpen, onClose, userPhoneNumbers, setUserPhoneNumbers, user, agentId }: BuyPhoneNumberModalProps) => {
    const [availableNumbers, setAvailableNumbers] = useState([]);
    const [selectedAreaCode, setSelectedAreaCode] = useState('');
    const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);
    const [searchStep, setSearchStep] = useState<'input' | 'results'>('input');
    const [countryCode, setCountryCode] = useState('US');
    const [searchError, setSearchError] = useState('');
    const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

    const handleSearchNumbers = async () => {
        setIsLoadingNumbers(true);
        setSearchError('');

        try {
            if (!selectedAreaCode || selectedAreaCode.length !== 3) {
                throw new Error('Please enter a valid 3-digit area code');
            }

            const response = await fetch('/api/twilio/get-phone-numbers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    areaCode: selectedAreaCode,
                    countryCode
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch numbers');
            }

            if (data.numbers.length === 0) {
                throw new Error('No available numbers found for this area code');
            }

            setAvailableNumbers(data.numbers);
            setSearchStep('results');
        } catch (error: any) {
            setSearchError(error.message);
            toast.error(error.message);
        } finally {
            setIsLoadingNumbers(false);
        }
    };

    const handleBuyNumber = async (phoneNumber: string) => {
        setIsPurchasing(phoneNumber);
        try {
            const payment = await createPhoneNumberSubscription(
                phoneNumber, 
                user.id, 
                agentId
            );

            if (!payment?.success) {
                toast.error('Failed to create subscription');
                return;
            }

            if (payment?.number) {
                toast.success('Phone number purchased successfully');
                onClose();
                setUserPhoneNumbers([...userPhoneNumbers, payment.number]);
            }
        } catch (error) {
            toast.error('Failed to purchase number. Your subscription will be cancelled.');
            throw error;
        } finally {
            setIsPurchasing(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Purchase Phone Number</DialogTitle>
                </DialogHeader>
                
                {isPurchasing ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-6">
                        <div className="w-16 h-16 mb-4 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-opacity-50"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                        </div>
                        <h3 className="text-lg font-medium text-blue-900 mb-2">Processing Payment</h3>
                        <p className="text-sm text-blue-600">Please wait while we set up your phone number...</p>
                    </div>
                ) : searchStep === 'input' ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <select 
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="US">United States (+1)</option>
                                <option value="CA">Canada (+1)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Area Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g., 415"
                                    value={selectedAreaCode}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setSelectedAreaCode(value);
                                    }}
                                    maxLength={3}
                                    className="font-mono"
                                />
                                <Button 
                                    onClick={handleSearchNumbers} 
                                    disabled={isLoadingNumbers || selectedAreaCode.length !== 3}
                                >
                                    {isLoadingNumbers ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Search'
                                    )}
                                </Button>
                            </div>
                            {searchError && (
                                <p className="text-sm text-red-500">{searchError}</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                Found {availableNumbers.length} numbers in {selectedAreaCode}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSearchStep('input')}
                            >
                                New Search
                            </Button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto space-y-2">
                            {availableNumbers.map((number: any) => (
                                <div 
                                    key={number.phoneNumber} 
                                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                                >
                                    <div className="space-y-1">
                                        <p className="font-mono font-medium">{number.friendlyName}</p>
                                        <div className="flex gap-2">
                                            <Badge variant="secondary">
                                                {number.locality || number.region}
                                            </Badge>
                                            {number.capabilities.voice && (
                                                <Badge variant="outline">Voice</Badge>
                                            )}
                                            {number.capabilities.SMS && (
                                                <Badge variant="outline">SMS</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => handleBuyNumber(number.phoneNumber)}
                                        className="ml-4"
                                        disabled={isPurchasing === number.phoneNumber}
                                    >
                                        Purchase
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
