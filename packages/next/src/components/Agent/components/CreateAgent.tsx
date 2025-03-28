"use client"

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Loader2, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'   
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@clerk/nextjs'
import { useToast } from "@/hooks/use-toast"
import { AgentSetupModal } from '../modal/AgentSetupModal'
import type { User } from '@graham/db'

type Props = {
    children?: React.ReactNode;
    onCreateStart?: () => void;
    onCreateEnd?: () => void;
    user: User;
}

export const CreateAgent: React.FC<Props> = ({ children, onCreateStart, onCreateEnd, user }) => {
    const router = useRouter()
    const [input, setInput] = React.useState('');
    const [subscriptionStatus, setSubscriptionStatus] = React.useState('');
    const [agentCount, setAgentCount] = React.useState(0);
    const [hasPaymentSetup, setHasPaymentSetup] = React.useState(false);
    const [isSetupModalOpen, setIsSetupModalOpen] = React.useState(false);
    const [createdAgentId, setCreatedAgentId] = React.useState<string | null>(null);
    const { userId } = useAuth();
    const { toast } = useToast();

    React.useEffect(() => {
        const checkSubscription = async () => {
            const res = await axios.get('/api/stripe/checkSubscription');
            const data = await res.data;
            setSubscriptionStatus(data.subscriptionStatus);
        };
        const checkAgentCount = async () => {
            const res = await fetch('/api/agent/fetch/getAgentCount');
            const data = await res.json();
            setAgentCount(data.count);
        };
        const checkPaymentSetup = async () => {
            const res = await fetch('/api/stripe/check-payment-setup');
            const data = await res.json();
            setHasPaymentSetup(data.hasPaymentSetup);
        };
        checkSubscription();
        checkAgentCount();
        checkPaymentSetup();
    }, []);

    const createAgent = useMutation({ 
        mutationFn: async () => {
            if (!hasPaymentSetup) {
                router.push(`/dashboard/profile/${userId}?setup=payment`);
                return;
            }
            if (agentCount >= 1 && subscriptionStatus !== 'enterprise') {
                router.push('/contact');
                return;
            }
            const response = await axios.post('/api/agent/createAgent', {
                name: input,
            })
            return response.data
        }
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input == ''){
            toast({
                title: "Error",
                description: "Please enter a name for your agent.",
                variant: "destructive"
            })
            return
        }

        onCreateStart?.();
        createAgent.mutate(undefined, {
            onSuccess: (data) => {
                if (data && data.agent_id) {
                    toast({
                        title: "Success",
                        description: "Agent created! Let's set it up.",
                    })
                    setCreatedAgentId(data.agent_id);
                    setIsSetupModalOpen(true);
                } else {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Agent created, but there was an issue. Please try again."
                    })
                }
                onCreateEnd?.();
            },
            onError: (error: any) => {
                let errorMessage = "Failed to create new agent";
                if (error.response) {
                    errorMessage += `: ${error.response.data.message || error.response.statusText}`;
                } else if (error.request) {
                    errorMessage += ": No response received from server";
                } else {
                    errorMessage += `: ${error.message}`;
                }
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: errorMessage
                })
                onCreateEnd?.();
            },
        })
    };

    const handleSetupComplete = () => {
        setIsSetupModalOpen(false);
        if (createdAgentId) {
            router.push(`/dashboard/agent/${createdAgentId}`);
        }
    };

  return (
    <>
        <Dialog>
            <DialogTrigger>
                {children || (
                    <Card className='border-2 border-dashed border-blue-600 bg-blue-50 hover:bg-blue-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1'>
                        <CardContent className='flex flex-col items-center justify-center h-full p-6'>
                            <Phone className="w-12 h-12 text-blue-600 mb-2" />
                            <h2 className='font-semibold text-blue-600 text-lg'>New Agent</h2>
                        </CardContent>
                    </Card>
                )}
            </DialogTrigger>
            <DialogContent className="bg-blue-50 text-blue-900">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-black">
                        Create a New Agent
                    </DialogTitle>
                    <DialogDescription className="text-blue-700">
                        Give your agent a name.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="agentName" className="block text-sm font-medium text-blue-900 mb-1">Agent Name</label>
                        <Input 
                            id="agentName"
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            placeholder='Enter agent name...' 
                            className="bg-white border-blue-600 text-blue-900"
                        />
                    </div>

                    <div className='flex items-center justify-end space-x-2'>
                        <DialogClose asChild>
                            <Button type='button' variant="outline" className="border-blue-600 bg-red-500 text-white hover:bg-red-700 hover:text-white">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button 
                            className='bg-blue-600 hover:bg-blue-700 text-white' 
                            type="submit" 
                            disabled={createAgent.isPending}
                        >
                            {createAgent.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                            Create Agent
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>

        {userId && (
            <AgentSetupModal
                isOpen={isSetupModalOpen}
                onClose={handleSetupComplete}
                user={user}
                agentId={createdAgentId || ''}
            />
        )}
    </>
  )
}