"use client"

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Plus, X, Coffee } from 'lucide-react'
import { Input } from '@/components/ui/input'   
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
    children?: React.ReactNode;
}

export const CreateAgent: React.FC<Props> = ({ children }) => {
    const router = useRouter()
    const [input, setInput] = React.useState('');
    const [characteristics, setCharacteristics] = React.useState<string[]>([]);
    const [isSubscribed, setIsSubscribed] = React.useState(false);
    const [agentCount, setAgentCount] = React.useState(0);

    React.useEffect(() => {
        const checkSubscription = async () => {
            const res = await axios.get('/api/stripe/checkSubscription');
            const data = await res.data;
            setIsSubscribed(data.hasSubscription);
        };
        const checkAgentCount = async () => {
            const res = await fetch('/api/agent/getAgentCount');
            const data = await res.json();
            setAgentCount(data.count);
        }
        checkSubscription();
        checkAgentCount();
    }, []);

    const createAgent = useMutation({
        mutationFn: async () => {
            if (agentCount >= 1 && !isSubscribed) {
                router.push('/subscription');
                return;
            }
            const response = await axios.post('/api/agent/createAgent', {
                name: input,
                characteristics: characteristics
            })
            return response.data
        }
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input == ''){
            window.alert('Please enter a name for your agent.')
            return
        }

        createAgent.mutate(undefined, {
            onSuccess: (data) => {
                if (data && data.agent_id) {
                    console.log("Agent Created", { agent_id: data.agent_id })
                    router.push(`/agent/${data.agent_id}`);
                } else {
                    console.error("Agent created, but no ID returned")
                    window.alert("Agent created, but there was an issue. Please try again.")
                }
            },
            onError: (error: any) => {
                console.error(error);
                let errorMessage = "Failed to create new agent";
                if (error.response) {
                    errorMessage += `: ${error.response.data.message || error.response.statusText}`;
                } else if (error.request) {
                    errorMessage += ": No response received from server";
                } else {
                    errorMessage += `: ${error.message}`;
                }
                window.alert(errorMessage);
            },
        })
    };

  return (
    <Dialog>
        <DialogTrigger>
            {children || (
                <Card className='border-2 border-dashed border-[#8B4513] bg-[#F5E6D3] hover:bg-[#E6CCB2] transition-all duration-300 hover:shadow-xl hover:-translate-y-1'>
                    <CardContent className='flex flex-col items-center justify-center h-full p-6'>
                        <Coffee className="w-12 h-12 text-[#8B4513] mb-2" />
                        <h2 className='font-semibold text-[#8B4513] text-lg'>New Agent</h2>
                    </CardContent>
                </Card>
            )}
        </DialogTrigger>
        <DialogContent className="bg-[#F5E6D3] text-[#5D4037]">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#8B4513]">
                    Create a New Agent
                </DialogTitle>
                <DialogDescription className="text-[#795548]">
                    Give your agent a name.
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="agentName" className="block text-sm font-medium text-[#5D4037] mb-1">Agent Name</label>
                    <Input 
                        id="agentName"
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        placeholder='Enter agent name...' 
                        className="bg-white border-[#8B4513] text-[#5D4037]"
                    />
                </div>

                <div className='flex items-center justify-end space-x-2'>
                    <Button type='button' variant="outline" className="border-[#8B4513] text-white hover:bg-[#E6CCB2]">
                        Cancel
                    </Button>
                    <Button 
                        className='bg-[#8B4513] hover:bg-[#A0522D] text-white' 
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
  )
}