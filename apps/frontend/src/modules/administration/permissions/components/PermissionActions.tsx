import { useState } from 'react'
import {
  // Eye,
  EyeIcon,
  // MoreHorizontal, Pencil, Trash2
} from 'lucide-react'
import type { Permission } from '../types/permission.types'

import { Button } from '@/components/ui/button'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import PermissionDeleteAlert from './PermissionDeleteAlert'
import PermissionDetails from './PermissionDetails'
// import PermissionEdit from './PermissionEdit'
// import { hasPermission, useAuth } from '@/modules/auth'

interface Props {
  permission: Permission
}

export default function PermissionActions({ permission }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  // const auth = useAuth()
  // const canManage = hasPermission(auth.data?.permissions, 'settings:update')
  // const [editOpen, setEditOpen] = useState(false)
  // const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Ver detalle de ${permission.code}`}
        onClick={() => setDetailsOpen(true)}
      >
        <EyeIcon aria-hidden="true" />
      </Button>
      {/* <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Acciones para el permiso ${permission.code}`}
            >
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
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
          </DropdownMenuGroup>
          {canManage ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu> */}

      <PermissionDetails
        permission={permission}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      {/* {canManage ? (
        <>
          <PermissionEdit
            permission={permission}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
          <PermissionDeleteAlert
            permission={permission}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
          />
        </>
      ) : null} */}
    </>
  )
}
