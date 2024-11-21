'use client'

import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useSearchParams } from 'next/navigation'
import { AgentSetup } from './AgentSetup'
import { AgentTesting } from "./AgentTesting"
import { AgentAnalytics } from './AgentAnalytics'
import type { Agent, User } from '@graham/db'

interface AgentTabsProps {
  agent: Agent
  user: User
}

export function AgentTabs({ agent, user }: AgentTabsProps) {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'setup'

  return (
    <Tabs value={currentTab} className="w-full bg-white h-full">
      <TabsContent value="setup" className="w-full">
        <AgentSetup agent={agent} user={user} />
      </TabsContent>
      <TabsContent value="testing" className="w-full">
        <AgentTesting agent={agent} />
      </TabsContent>
      <TabsContent value="analytics" className="w-full">
        <AgentAnalytics agent={agent} />
      </TabsContent>
    </Tabs>
  )
} 