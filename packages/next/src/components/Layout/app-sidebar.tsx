'use client'

import { Calendar, ChevronDown, CreditCard, Home, Plus, Search, Settings, User2 } from "lucide-react"
import { UserButton, useAuth, useUser } from "@clerk/nextjs"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  // {
  //   title: "Inbox",
  //   url: "/inbox",
  //   icon: Inbox,
  // },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  // {
  //   title: "Search",
  //   url: "/search",
  //   icon: Search,
  // },
  // {
  //   title: "Settings",
  //   url: "/settings",
  //   icon: Settings,
  // },
]

type AgentTabs = {
  value: string;
  label: string;
  icon: any;
}

const agentTabs: AgentTabs[] = [
  { value: "setup", label: "Setup", icon: Settings },
  { value: "testing", label: "Testing", icon: Search },
  { value: "analytics", label: "Analytics", icon: Calendar }
]
// TODO: remove stuff from main dashboard page
export function AppSidebar() {
  const { userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const isAgentPage = pathname?.includes('/dashboard/agent/')
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'setup'

  const handleTabClick = (tabValue: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', tabValue)
    router.push(`${pathname}?${params.toString()}`)
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
                    <SidebarMenuItem key={tab.value}>
                      <SidebarMenuButton
                        asChild
                        className={`group ${currentTab === tab.value ? 'bg-accent' : ''}`}
                        onClick={() => handleTabClick(tab.value)}
                      >
                        <div>
                          <tab.icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
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
        <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupAction>
              <Plus /> <span className="sr-only">Add Project</span>
            </SidebarGroupAction>
            <SidebarGroupContent></SidebarGroupContent>
          </SidebarGroup>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild onClick={() => router.push('/dashboard/profile/${userId}')}>
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
