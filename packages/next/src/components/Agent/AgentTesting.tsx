// "use client"

// import React, { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { PhoneCall, Send, User, Bot } from 'lucide-react';
// import { createRetellPhoneCall } from '@/services/retellAI';
// import { toast } from 'react-toastify';
// import { AgentType } from '@/lib/db/schema';

// export const AgentTesting: React.FC<{ agent: AgentType }> = ({ agent }) => {
//     const [customerMessage, setCustomerMessage] = useState('');
//     const [conversation, setConversation] = useState<{ sender: 'customer' | 'agent', message: string }[]>([]);
//     const [testPhoneNumber, setTestPhoneNumber] = useState('');
//     const [isCallInProgress, setIsCallInProgress] = useState(false);

//     const handleSendMessage = () => {
//         if (customerMessage.trim()) {
//             setConversation([...conversation, { sender: 'customer', message: customerMessage }]);
//             // Simulate agent response
//             setTimeout(() => {
//                 setConversation(prev => [...prev, { sender: 'agent', message: "Thank you for your message. How can I assist you today?" }]);
//             }, 1000);
//             setCustomerMessage('');
//         }
//     };

//     const handleStartTestCall = async () => {
//         if (!testPhoneNumber) {
//             toast.error("Please enter a phone number to test");
//             return;
//         }

//         try {
//             setIsCallInProgress(true);
//             const call = await createRetellPhoneCall(testPhoneNumber, agent.retellAgentId as string);
//             toast.success(`Test call initiated to ${testPhoneNumber}`);
//             // You might want to update the UI or store the call information
//         } catch (error) {
//             console.error("Error starting test call:", error);
//             toast.error("Failed to start test call");
//         } finally {
//             setIsCallInProgress(false);
//         }
//     };

//     return (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <Card className="bg-white shadow-lg">
//                 <CardHeader className="border-b border-[#E6CCB2]">
//                     <CardTitle className="text-[#8B4513] flex items-center">
//                         <PhoneCall className="w-5 h-5 mr-2" />
//                         Test Your Agent
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent className="pt-6">
//                     <div className="space-y-4">
//                         <p className="text-[#5D4037]">Agent&apos;s phone number: <strong className="text-[#8B4513]">{agent.phoneNumber || 'Not set'}</strong></p>
//                         <div className="flex items-center space-x-2">
//                             <Input 
//                                 placeholder="Enter test phone number..." 
//                                 value={testPhoneNumber}
//                                 onChange={(e) => setTestPhoneNumber(e.target.value)}
//                                 className="border-[#8B4513] text-[#5D4037]"
//                             />
//                             <Button 
//                                 onClick={handleStartTestCall}
//                                 className="bg-[#8B4513] hover:bg-[#A0522D] text-white"
//                                 disabled={isCallInProgress}
//                             >
//                                 {isCallInProgress ? 'Calling...' : 'Start Test Call'}
//                             </Button>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>

//             <Card className="bg-white shadow-lg">
//                 <CardHeader className="border-b border-[#E6CCB2]">
//                     <CardTitle className="text-[#8B4513] flex items-center">
//                         <Send className="w-5 h-5 mr-2" />
//                         Simulate Customer Interaction
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent className="pt-6">
//                     <div className="space-y-4">
//                         <div className="flex space-x-2">
//                             <Input 
//                                 placeholder="Type a customer message..." 
//                                 value={customerMessage}
//                                 onChange={(e) => setCustomerMessage(e.target.value)}
//                                 className="border-[#8B4513] text-[#5D4037]"
//                             />
//                             <Button 
//                                 onClick={handleSendMessage}
//                                 className="bg-[#8B4513] hover:bg-[#A0522D] text-white"
//                             >
//                                 Send
//                             </Button>
//                         </div>
//                         <div className="bg-[#F5E6D3] p-4 rounded-md min-h-[200px] max-h-[400px] overflow-y-auto">
//                             {conversation.map((msg, index) => (
//                                 <div key={index} className={`flex items-start space-x-2 mb-4 ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
//                                     {msg.sender === 'agent' && (
//                                         <Bot className="w-6 h-6 text-[#8B4513] mt-1" />
//                                     )}
//                                     <div className={`p-3 rounded-lg ${msg.sender === 'customer' ? 'bg-[#8B4513] text-white' : 'bg-white text-[#5D4037]'}`}>
//                                         {msg.message}
//                                     </div>
//                                     {msg.sender === 'customer' && (
//                                         <User className="w-6 h-6 text-[#8B4513] mt-1" />
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };