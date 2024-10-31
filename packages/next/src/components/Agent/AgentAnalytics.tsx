import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PhoneCall, MessageSquare, ThumbsUp, Clock } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
}

export const AgentAnalytics: React.FC<{ agent: Agent }> = ({ agent }) => {
    return (
        // <div className="grid grid-cols-3 gap-6">
        <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-r from-[#F5E6D3] to-[#E6CCB2] rounded-lg shadow-lg">
            {/* <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-[#E6CCB2]">
                    <CardTitle className="text-[#8B4513] flex items-center">
                        <PhoneCall className="w-5 h-5 mr-2" />
                        Call Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-[#5D4037] font-semibold mb-2">Total Calls</h3>
                            <p className="text-3xl font-bold text-[#8B4513]">1,234</p>
                        </div>
                        <div>
                            <h3 className="text-[#5D4037] font-semibold mb-2">Average Call Duration</h3>
                            <p className="text-3xl font-bold text-[#8B4513]">3m 45s</p>
                        </div>
                        <div>
                            <h3 className="text-[#5D4037] font-semibold mb-2">Call Volume by Time</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#795548]">Morning</span>
                                    <Progress value={30} className="w-2/3" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#795548]">Afternoon</span>
                                    <Progress value={50} className="w-2/3" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#795548]">Evening</span>
                                    <Progress value={20} className="w-2/3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-[#E6CCB2]">
                    <CardTitle className="text-[#8B4513] flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Common Queries
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center">
                            <span className="text-[#5D4037]">Business Hours</span>
                            <span className="text-[#8B4513] font-semibold">32%</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-[#5D4037]">Product Information</span>
                            <span className="text-[#8B4513] font-semibold">28%</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-[#5D4037]">Pricing</span>
                            <span className="text-[#8B4513] font-semibold">18%</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-[#5D4037]">Support</span>
                            <span className="text-[#8B4513] font-semibold">14%</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-[#5D4037]">Other</span>
                            <span className="text-[#8B4513] font-semibold">8%</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
                <CardHeader className="border-b border-[#E6CCB2]">
                    <CardTitle className="text-[#8B4513] flex items-center">
                        <ThumbsUp className="w-5 h-5 mr-2" />
                        Customer Satisfaction
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-[#5D4037] font-semibold mb-2">Overall Satisfaction Score</h3>
                            <p className="text-3xl font-bold text-[#8B4513]">4.7 / 5.0</p>
                        </div>
                        <div>
                            <h3 className="text-[#5D4037] font-semibold mb-2">Resolution Rate</h3>
                            <Progress value={92} className="h-4" />
                            <p className="text-right text-[#795548] mt-1">92%</p>
                        </div>
                        <div>
                            <h3 className="text-[#5D4037] font-semibold mb-2">Average Response Time</h3>
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 text-[#8B4513] mr-2" />
                                <span className="text-[#5D4037]">15 seconds</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card> */}
                <div className="text-center flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-[#8B4513] mb-4">Analytics Coming Soon</h2>
                    <p className="text-xl text-[#5D4037]">We&apos;re working on bringing you insightful analytics for your agent.</p>
                    <p className="text-lg text-[#795548] mt-2">Stay tuned for exciting updates!</p>
                </div>
        </div>
    );
};