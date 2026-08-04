import type { UserResponse } from '@sigip/shared'
import { useState } from 'react'
import {
  Eye,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
} from 'lucide-react'
import type { Role } from '../../roles/types/roles.types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import UserDetails from './UserDetails'
import UserEdit from './UserEdit'
import UserPassword from './UserPassword'
import UserStatusAlert from './UserStatusAlert'

interface Props {
  user: UserResponse
  roles: Role[]
}

export default function UserActions({ user, roles }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Acciones para el usuario ${user.fullName}`}
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
            <DropdownMenuItem
              disabled={!user.isActive}
              onClick={() => setPasswordOpen(true)}
            >
              <KeyRound />
              Cambiar contraseña
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant={user.isActive ? 'destructive' : 'default'}
              onClick={() => setStatusOpen(true)}
            >
              {user.isActive ? <PowerOff /> : <Power />}
              {user.isActive ? 'Desactivar' : 'Activar'}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserDetails
        user={user}
        roles={roles}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      <UserEdit
        user={user}
        roles={roles}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <UserPassword
        user={user}
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
      />
      <UserStatusAlert
        user={user}
        open={statusOpen}
        onOpenChange={setStatusOpen}
      />
    </>
  )
}
