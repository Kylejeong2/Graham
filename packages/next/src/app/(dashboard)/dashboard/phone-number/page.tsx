'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, AlertCircle, ExternalLink, DollarSign } from "lucide-react"

export default function PhoneNumberPage() {
    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">
                Phone Number Setup
            </h1>

            {/* Status Card */}
            <Card className="mb-6 border-orange-200 bg-orange-50">
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
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Registration Options Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-orange-500" />
                        Registration Options
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-medium text-blue-900 mb-2">Standard Registration</h3>
                            <ul className="text-sm text-blue-700 space-y-2">
                                <li>• $44 one-time brand registration</li>
                                <li>• $15 per campaign one-time vetting fee</li>
                                <li>• $1.50-$10 per campaign monthly</li>
                                <li>• For businesses with EIN sending 6,000+ messages/day</li>
                            </ul>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-lg">
                            <h3 className="font-medium text-green-900 mb-2">Low-Volume Registration</h3>
                            <ul className="text-sm text-green-700 space-y-2">
                                <li>• $4 one-time brand registration</li>
                                <li>• $15 per campaign one-time vetting fee</li>
                                <li>• $1.50-$10 per campaign monthly</li>
                                <li>• For businesses with EIN sending under 6,000 messages/day</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => window.open('https://pages.twilio.com/10DLC-HelpArticles-WW.html?_gl=1*z9cstp*_gcl_aw*R0NMLjE3MzA0OTYyNjcuQ2p3S0NBanctSkc1QmhCWkVpd0F0N0pSNl9tb2ZaM29CWUdWTkVtd2RMWDVBc0UtUk1xaWZkclprb2EweTk4TlRlSmlfX2M0T0lxY1dob0NGc1lRQXZEX0J3RQ..*_gcl_au*Nzk0MzE0NTY2LjE3MzA0OTE3MTM.*_ga*OTg5NDYyMjM1LjE3MzA0OTE3MTM.*_ga_RRP8K4M4F3*MTczMDY5NzM4My45LjEuMTczMDY5NzQ0My4wLjAuMA..', '_blank')}
                        >
                            Start Registration
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-blue-200"
                            onClick={() => window.open('https://help.twilio.com/articles/4418081745179-How-do-I-check-that-I-have-completed-US-A2P-10DLC-registration', '_blank')}
                        >
                            Troubleshooting
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Process Steps Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-orange-500" />
                        Registration Process
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sm text-blue-600 font-medium">1</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-blue-900 mb-1">Brand Registration</h3>
                                <p className="text-sm text-gray-600">
                                    Provide information about your business and who will be sending the messages.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sm text-blue-600 font-medium">2</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-blue-900 mb-1">Campaign Setup</h3>
                                <p className="text-sm text-gray-600">
                                    Register your use cases and how you'll manage customer consent for messaging.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sm text-blue-600 font-medium">3</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-blue-900 mb-1">Number Assignment</h3>
                                <p className="text-sm text-gray-600">
                                    Add your phone numbers to the registered campaign in a Messaging Service.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button 
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => window.open('https://help.twilio.com/articles/223179348-Porting-a-Phone-Number-to-Twilio', '_blank')}
                        >
                            Start Registration
                        </Button>
                        <Button 
                            variant="outline" 
                            className="flex-1 border-blue-200"
                            onClick={() => window.open('https://www.twilio.com/docs/verify/api', '_blank')}
                        >
                            <span>Learn More</span>
                            <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
