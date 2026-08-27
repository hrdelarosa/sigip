import { useState } from 'react'
import {
  Eye,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
} from 'lucide-react'
import type { Role } from '../types/roles.types'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import RolePermissionsDialog from './RolePermissionsDialog'
import RoleStatusAlert from './RoleStatusAlert'
import RoleDetails from './RoleDetails'
import RoleEdit from './RoleEdit'
import { hasPermission, useAuth } from '@/modules/auth'

interface Props {
  role: Role
}

export default function RoleActions({ role }: Props) {
  const auth = useAuth()
  const canManage = hasPermission(auth.data?.permissions, 'settings:update')
  const canManagePermissions =
    canManage && hasPermission(auth.data?.permissions, 'permissions:read')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [permissionsOpen, setPermissionsOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Acciones para el rol ${role.name}`}
            >
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
              <Eye />
              Ver detalles
            </DropdownMenuItem>
            {canManage ? (
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil />
                Editar
              </DropdownMenuItem>
            ) : null}
            {canManagePermissions ? (
              <DropdownMenuItem onClick={() => setPermissionsOpen(true)}>
                <KeyRound />
                Administrar permisos
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
          {canManage ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant={role.isActive ? 'destructive' : 'default'}
                  onClick={() => setStatusOpen(true)}
                >
                  {role.isActive ? <PowerOff /> : <Power />}
                  {role.isActive ? 'Desactivar' : 'Activar'}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleDetails
        role={role}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      {canManage ? (
        <RoleEdit role={role} open={editOpen} onOpenChange={setEditOpen} />
      ) : null}
      {canManagePermissions ? (
        <RolePermissionsDialog
          role={role}
          open={permissionsOpen}
          onOpenChange={setPermissionsOpen}
        />
      ) : null}
      {canManage ? (
        <RoleStatusAlert
          role={role}
          open={statusOpen}
          onOpenChange={setStatusOpen}
        />
      ) : null}
    </>
  )
}
