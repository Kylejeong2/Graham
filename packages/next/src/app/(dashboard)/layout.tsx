// import SidebarLayout from '@/components/Layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      {/* <SidebarLayout> */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      {/* </SidebarLayout> */}
    </div>
  )
} 