import type { ComponentProps } from 'react'
import { LogOut, ShieldCheckIcon } from 'lucide-react'
import { Link, useLocation } from 'wouter'
import { routes } from '@/app/router/routes'
import { navigationGroups } from '@/config/sidebar-routes'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar'
import { hasPermission, useAuth, useLogout } from '@/modules/auth'

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const [location] = useLocation()
  const auth = useAuth()
  const logout = useLogout()
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Inicio de SIGIP"
              render={
                <Link href={routes.home} aria-label="Ir al inicio de SIGIP" />
              }
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <ShieldCheckIcon aria-hidden="true" />
              </span>

              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">SIGIP</span>
                <span className="truncate text-xs text-sidebar-foreground/65">
                  INM Guerrero
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigationGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) =>
              !('permission' in item) ||
              hasPermission(auth.data?.permissions, item.permission),
          )

          if (visibleItems.length === 0) {
            return null
          }

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const isActive =
                      location === item.href ||
                      location.startsWith(`${item.href}/`)
                    const Icon = item.icon

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.label}
                          render={
                            <Link
                              href={item.href}
                              aria-current={isActive ? 'page' : undefined}
                              onClick={() => setOpenMobile(false)}
                            />
                          }
                        >
                          <Icon aria-hidden="true" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="font-medium hover:text-destructive hover:bg-destructive/5"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              <LogOut />
              Cerrar sesión
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
