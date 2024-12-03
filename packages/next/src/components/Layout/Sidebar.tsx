import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Layout/app-sidebar";
import { cookies } from "next/headers"

export default async function SidebarLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <main className="h-full w-full py-2 overflow-y-auto">
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}