import type { ComponentProps } from 'react'
import {
  BriefcaseBusinessIcon,
  Building2Icon,
  IdCardIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  MonitorSmartphoneIcon,
  UsersIcon,
} from 'lucide-react'
import { Link, useLocation } from 'wouter'

import { routes } from '@/app/router/routes'
import { hasPermission, useAuth } from '@/modules/auth'

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
      {
        label: 'Empleados',
        href: routes.employees.root,
        icon: IdCardIcon,
        permission: 'employees:read',
      },
      {
        label: 'Sesiones',
        href: routes.sessions,
        icon: MonitorSmartphoneIcon,
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
        permission: 'users:read',
      },
      {
        label: 'Roles',
        href: routes.administration.roles,
        icon: ShieldCheckIcon,
        permission: 'roles:read',
      },
      {
        label: 'Permisos',
        href: routes.administration.permissions,
        icon: KeyRoundIcon,
        permission: 'permissions:read',
      },
      {
        label: 'Unidades organizativas',
        href: routes.administration.organizationalUnits,
        icon: Building2Icon,
        permission: 'catalogs:read',
      },
      {
        label: 'Puestos',
        href: routes.administration.positions,
        icon: BriefcaseBusinessIcon,
        permission: 'catalogs:read',
      },
    ],
  },
] as const

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const [location] = useLocation()
  const auth = useAuth()

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
                {group.items
                  .filter(
                    (item) =>
                      !('permission' in item) ||
                      hasPermission(auth.data?.permissions, item.permission),
                  )
                  .map((item) => {
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
