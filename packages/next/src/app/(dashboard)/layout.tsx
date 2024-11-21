import SidebarLayout from '@/components/Layout/Sidebar'
import QueryClientProvider from '@/components/Layout/QueryClientProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarLayout>
      <QueryClientProvider>
        <main className="flex-1 overflow-y-auto">
          {children}
          </main>
        </QueryClientProvider>
      </SidebarLayout>
    </div>
  )
} 