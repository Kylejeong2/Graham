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
    <Tabs value={currentTab} className="w-full min-w-full">
      <TabsContent value="setup" className="w-full min-w-full">
        <div className="w-full min-w-full">
          <AgentSetup agent={agent} user={user} />
        </div>
      </TabsContent>
      <TabsContent value="testing" className="w-full min-w-full">
        <div className="w-full min-w-full">
          <AgentTesting agent={agent} />
        </div>
      </TabsContent>
      <TabsContent value="analytics" className="w-full min-w-full">
        <div className="w-full min-w-full">
          <AgentAnalytics agent={agent} />
        </div>
      </TabsContent>
    </Tabs>
  )
} 