import type { PropsWithChildren } from 'react'

import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/sidebar/site-header'

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />

      <SidebarInset>
        <SiteHeader />

        <div className="flex min-w-0 flex-1 flex-col gap-6 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
