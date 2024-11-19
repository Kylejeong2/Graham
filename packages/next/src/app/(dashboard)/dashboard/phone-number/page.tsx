'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, AlertCircle, ExternalLink, Loader2 } from "lucide-react"
import { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { BuyPhoneNumberModal } from "@/components/Agent/setup/modals/buy-phone-number";

export default function PhoneNumberPage() {
    const [setupChoice, setSetupChoice] = useState('routing');
    const [userPhoneNumbers, setUserPhoneNumbers] = useState<string[]>([]);
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/user/get-info');
                const data = await response.json();
                setUserPhoneNumbers(data.phoneNumbers || []);
                setUser(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Failed to load user data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">
                Phone Number Management
            </h1>

            <div className="flex gap-4 mb-6">
                <Button
                    variant={setupChoice === 'routing' ? 'default' : 'outline'}
                    onClick={() => setSetupChoice('routing')}
                    className={setupChoice === 'routing' ? 'bg-blue-600' : 'border-blue-200'}
                >
                    Quick Call Routing Setup
                </Button>
                <Button
                    variant={setupChoice === 'twilio' ? 'default' : 'outline'}
                    onClick={() => setSetupChoice('twilio')}
                    className={setupChoice === 'twilio' ? 'bg-blue-600' : 'border-blue-200'}
                >
                    Twilio Registration
                </Button>
            </div>

            {setupChoice === 'routing' ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-blue-900 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-green-500" />
                            Call Routing Setup
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {userPhoneNumbers.length > 0 ? (
                            <>
                                <div className="p-4 bg-blue-50 rounded-lg space-y-4">
                                    <h3 className="font-medium text-blue-900">Call Forwarding Instructions</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm text-blue-600 font-medium">1</span>
                                            </div>
                                            <p className="text-sm text-blue-700">
                                                From your phone, dial *72 (AT&T/Verizon) or *21* (T-Mobile)
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm text-blue-600 font-medium">2</span>
                                            </div>
                                            <p className="text-sm text-blue-700">
                                                Enter the 10-digit number where you want calls forwarded
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm text-blue-600 font-medium">3</span>
                                            </div>
                                            <p className="text-sm text-blue-700">
                                                Wait for the confirmation tone (2 short beeps)
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm text-blue-600 font-medium">4</span>
                                            </div>
                                            <p className="text-sm text-blue-700">
                                                To disable forwarding later, dial *73 and wait for confirmation tone
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2">Note: These instructions may vary by carrier. Contact your carrier if these codes don't work.</p>
                                </div>

                                <div className="p-4 bg-orange-50 rounded-lg space-y-3">
                                    <h3 className="font-medium text-orange-900">Want to Port Your Existing Number?</h3>
                                    <p className="text-sm text-orange-700">
                                        You can port your existing number to our service. Requirements:
                                    </p>
                                    <ul className="text-sm text-orange-700 list-disc pl-5 space-y-1">
                                        <li>Active service with current carrier</li>
                                        <li>Account number and PIN from current carrier</li>
                                        <li>Latest phone bill</li>
                                        <li>Authorized user on the account</li>
                                    </ul>
                                    <Button 
                                        variant="outline"
                                        className="mt-2"
                                        onClick={() => window.open('https://www.twilio.com/console/phone-numbers/porting', '_blank')}
                                    >
                                        Start Porting Process <ExternalLink className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="p-6 text-center space-y-4">
                                <div className="bg-blue-50 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
                                    <Phone className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-medium text-blue-900">No Phone Number Found</h3>
                                    <p className="text-sm text-blue-600">First, let's get you a phone number to set up call routing.</p>
                                </div>
                                <Button 
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => setIsPhoneModalOpen(true)}
                                >
                                    Purchase Phone Number
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                            <div>
                                <h3 className="font-medium text-orange-900 mb-1">
                                    A2P 10DLC Registration Required
                                </h3>
                                <p className="text-sm text-orange-700">
                                    All US phone numbers must be registered through Twilio's A2P 10DLC process. Registration typically takes 1-2 business days.
                                </p>
                                <Button 
                                    className="mt-4"
                                    onClick={() => window.open('https://www.twilio.com/console/sms/settings/10dlc-registration', '_blank')}
                                >
                                    Register with Twilio
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <BuyPhoneNumberModal 
                isOpen={isPhoneModalOpen}
                onClose={() => setIsPhoneModalOpen(false)}
                userPhoneNumbers={userPhoneNumbers}
                setUserPhoneNumbers={setUserPhoneNumbers}
                user={user}
                agentId=""
            />
        </div>
    );
}
