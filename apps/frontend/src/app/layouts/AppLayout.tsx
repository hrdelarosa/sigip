import type { PropsWithChildren } from 'react'

import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useAuth } from '@/modules/auth'
import { NavUser } from '@/components/nav-user'

export function AppLayout({ children }: PropsWithChildren) {
  const auth = useAuth()

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center border-b px-4">
          <SidebarTrigger
            className="-ml-1"
            aria-label="Alternar barra lateral"
            title="Alternar barra lateral"
          />

          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-full"
          />

          <div className="ml-auto">
            <NavUser user={auth.data} />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
