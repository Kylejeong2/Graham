'use client'

import { Calendar, ChevronDown, CreditCard, Home, Search, Settings, User2, BarChart2, PhoneCall, LineChart } from "lucide-react"
import { UserButton, useAuth, useUser } from "@clerk/nextjs"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
]

type AgentTabs = {
  value: string;
  label: string;
  icon: any;
  subTabs?: { value: string; label: string; icon: any; }[];
}

const agentTabs: AgentTabs[] = [
  { value: "setup", label: "Setup", icon: Settings },
  { value: "testing", label: "Testing", icon: Search },
  { 
    value: "analytics", 
    label: "Analytics", 
    icon: BarChart2,
    subTabs: [
      { value: "dashboard", label: "Overview", icon: LineChart },
      { value: "calls", label: "Call Logs", icon: PhoneCall },
      { value: "insights", label: "Insights", icon: BarChart2 },
    ]
  }
]

export function AppSidebar() {
  const { userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const isAgentPage = pathname?.includes('/dashboard/agent/')
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'setup'
  const currentSubTab = searchParams.get('subtab') || 'dashboard'

  const handleTabClick = (tabValue: string, subTabValue?: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', tabValue)
    if (subTabValue) {
      params.set('subtab', subTabValue)
    } else {
      params.delete('subtab')
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/dashboard">
                <Home />
                <span>{pathname === '/dashboard' ? 'Dashboard' : 'Back to Dashboard'}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isAgentPage ? (
          <SidebarGroup>
            <SidebarGroupLabel>Agent Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {agentTabs.map((tab) => (
                  <div key={tab.value}>
                    {tab.subTabs ? (
                      <Collapsible 
                        defaultOpen={currentTab === tab.value}
                        className="w-full"
                      >
                        <CollapsibleTrigger asChild>
                          <div>
                            <SidebarMenuItem>
                              <SidebarMenuButton
                                className={`group w-full justify-between ${currentTab === tab.value ? 'bg-accent' : ''}`}
                                onClick={() => handleTabClick(tab.value)}
                              >
                                <div className="flex items-center">
                                  <tab.icon className="w-4 h-4 mr-2" />
                                  <span>{tab.label}</span>
                                </div>
                                <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="pl-6 mt-1">
                            {tab.subTabs.map((subTab) => (
                              <div key={subTab.value}>
                                <SidebarMenuItem>
                                  <SidebarMenuButton
                                    className={`group ${currentTab === tab.value && currentSubTab === subTab.value ? 'bg-accent' : ''}`}
                                    onClick={() => handleTabClick(tab.value, subTab.value)}
                                  >
                                    <subTab.icon className="w-4 h-4" />
                                    <span>{subTab.label}</span>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          className={`group ${currentTab === tab.value ? 'bg-accent' : ''}`}
                          onClick={() => handleTabClick(tab.value)}
                        >
                          <tab.icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger>
              Help
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="mailto:support@usegraham.com">Contact Support</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild onClick={() => router.push(`/dashboard/profile/${userId}`)}>
              <a>
                <CreditCard />
                <span>Billing</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild onClick={() => router.push(`/dashboard/profile/${userId}`)}>
              <a>
                <User2 />
                <span>Profile</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User2 />
              <span>{user?.emailAddresses[0]?.emailAddress ?? 'Guest'}</span>
              <UserButton afterSignOutUrl="/sign-in" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
