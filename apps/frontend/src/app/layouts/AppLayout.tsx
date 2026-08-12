import type { PropsWithChildren } from 'react'

import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { LogOutIcon } from 'lucide-react'
import { useAuth, useLogout } from '@/modules/auth'

export function AppLayout({ children }: PropsWithChildren) {
  const auth = useAuth()
  const logout = useLogout()

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

          <div className="ml-auto flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-medium">
                {auth.data?.fullName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {auth.data?.role.name}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              <LogOutIcon aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Cerrar sesión</span>
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
