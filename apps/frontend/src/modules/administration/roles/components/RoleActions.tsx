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

interface Props {
  role: Role
}

export default function RoleActions({ role }: Props) {
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
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPermissionsOpen(true)}>
              <KeyRound />
              Administrar permisos
            </DropdownMenuItem>
          </DropdownMenuGroup>
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
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleDetails
        role={role}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      <RoleEdit role={role} open={editOpen} onOpenChange={setEditOpen} />
      <RolePermissionsDialog
        role={role}
        open={permissionsOpen}
        onOpenChange={setPermissionsOpen}
      />
      <RoleStatusAlert
        role={role}
        open={statusOpen}
        onOpenChange={setStatusOpen}
      />
    </>
  )
}
