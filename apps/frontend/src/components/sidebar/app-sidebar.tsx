import type { ComponentProps } from 'react'
import {
  FileTextIcon,
  GaugeIcon,
  IdCardIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react'
import { Link, useLocation } from 'wouter'

import { routes } from '@/app/router/routes'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar'

const navigationGroups = [
  {
    label: 'Principal',
    items: [
      { label: 'Dashboard', href: routes.dashboard, icon: GaugeIcon },
      {
        label: 'Incidencias',
        href: routes.incidents.root,
        icon: FileTextIcon,
      },
      {
        label: 'Empleados',
        href: routes.employees.root,
        icon: IdCardIcon,
      },
    ],
  },
  {
    label: 'Administración',
    items: [
      {
        label: 'Usuarios',
        href: routes.administration.users,
        icon: UsersIcon,
      },
      {
        label: 'Roles',
        href: routes.administration.roles,
        icon: ShieldCheckIcon,
      },
      {
        label: 'Permisos',
        href: routes.administration.permissions,
        icon: KeyRoundIcon,
      },
    ],
  },
] as const

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const [location] = useLocation()

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
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
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
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
