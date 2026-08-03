import { useState } from 'react'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Permission } from '../types/permission.types'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import PermissionDeleteAlert from './PermissionDeleteAlert'
import PermissionDetails from './PermissionDetails'
import PermissionEdit from './PermissionEdit'

interface Props {
  permission: Permission
}

export default function PermissionActions({ permission }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
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
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil />
              Editar
            </DropdownMenuItem>
          </DropdownMenuGroup>
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
        </DropdownMenuContent>
      </DropdownMenu>

      <PermissionDetails
        permission={permission}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
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
  )
}
