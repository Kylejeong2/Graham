"use client"
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { CreateAgent } from "@/components/Agent/components/CreateAgent"
import { Button } from "@/components/ui/button"

export default function AgentMap({ agents, isSubscribed, isEnterprise }: { agents: any[], isSubscribed: boolean, isEnterprise: boolean }){
    const [loadingAgentId, setLoadingAgentId] = useState<string | null>(null);
    const [isCreatingAgent, setIsCreatingAgent] = useState(false);

    return (
        <div className='space-y-6'>
            <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {(agents.length == 0 && isSubscribed) || isEnterprise && (
                    <Card className='bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center h-[200px] relative'>
                        <CardContent>
                            <CreateAgent onCreateStart={() => setIsCreatingAgent(true)} onCreateEnd={() => setIsCreatingAgent(false)}>
                                <Button 
                                    variant="ghost" 
                                    className='w-full h-full flex flex-col items-center justify-center text-blue-600 hover:bg-blue-50'
                                    disabled={isCreatingAgent}
                                >
                                    {isCreatingAgent ? (
                                        <Loader2 className='w-12 h-12 mb-2 animate-spin' />
                                    ) : (
                                        <Plus className='w-12 h-12 mb-2' />
                                    )}
                                    <span className='text-center'>
                                        {isCreatingAgent ? 'Creating Agent...' : 'Create New Agent'}
                                    </span>
                                </Button>
                            </CreateAgent>
                        </CardContent>
                    </Card>
                )}
                {agents.map(agent => (
                    <Link 
                        href={`/dashboard/agent/${agent.id}`} 
                        key={agent.id}
                        onClick={() => setLoadingAgentId(agent.id)}
                    >
                        <Card className='bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative'>
                            <CardHeader className='pb-2'>
                                <Avatar className='w-16 h-16 mx-auto'>
                                    <AvatarFallback className='bg-blue-100 text-black-600'>
                                        {agent.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {loadingAgentId === agent.id && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className='text-center flex-grow'>
                                <CardTitle className='text-xl font-semibold text-blue-900 mb-1'>{agent.name}</CardTitle>
                                <p className='text-sm text-blue-700'>
                                    Created on {new Date(agent.createdAt).toLocaleDateString()}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
            {(!isEnterprise) && (
                <Card className='bg-blue-50 border-blue-200 shadow-lg max-w-2xl mx-auto'>
                    <CardContent className='p-6'>
                        <h3 className='text-2xl font-semibold text-blue-900 mb-2'>Unlock More Agents!</h3>
                        <p className="text-blue-700 mb-4">You&apos;ve created your first Agent. You'll need an enterprise plan for more Agents.</p>
                        <Link href="/contact">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
                                Upgrade to Enterprise
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}