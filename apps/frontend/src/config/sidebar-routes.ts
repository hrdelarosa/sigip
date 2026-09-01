import {
  BriefcaseBusinessIcon,
  Building2Icon,
  IdCardIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  UsersIcon,
  ScrollTextIcon,
  ClipboardClockIcon,
  ChartNoAxesColumnIcon,
} from "lucide-react";
import { routes } from "@/app/router/routes";

export const navigationGroups = [
  {
    label: "Principal",
    items: [
      {
        label: "Inicio",
        href: routes.dashboard,
        icon: LayoutDashboardIcon,
        permission: "dashboard:read",
      },
      {
        label: "Reportes",
        href: routes.reports,
        icon: ChartNoAxesColumnIcon,
        permission: "reports:read",
      },
      {
        label: "Incidencias",
        href: routes.incidents.root,
        icon: ClipboardClockIcon,
        permission: "incidents:read",
      },
      {
        label: "Empleados",
        href: routes.employees.root,
        icon: IdCardIcon,
        permission: "employees:read",
      },
    ],
  },
  {
    label: "Catálogos",
    items: [
      {
        label: "Unidades organizativas",
        href: routes.administration.organizationalUnits,
        icon: Building2Icon,
        permission: "catalogs:read",
      },
      {
        label: "Puestos",
        href: routes.administration.positions,
        icon: BriefcaseBusinessIcon,
        permission: "catalogs:read",
      },
      {
        label: "Oficinas",
        href: routes.administration.offices,
        icon: Building2Icon,
        permission: "catalogs:read",
      },
    ],
  },
  {
    label: "Administración",
    items: [
      {
        label: "Auditoría",
        href: routes.audit,
        icon: ScrollTextIcon,
        permission: "audit:read",
      },
      {
        label: "Usuarios",
        href: routes.administration.users,
        icon: UsersIcon,
        permission: "users:read",
      },
      {
        label: "Roles",
        href: routes.administration.roles,
        icon: ShieldCheckIcon,
        permission: "roles:read",
      },
      {
        label: "Permisos",
        href: routes.administration.permissions,
        icon: KeyRoundIcon,
        permission: "permissions:read",
      },
    ],
  },
] as const;
