import { useState } from 'react'
import { Eye, MoreHorizontal, Pencil, Power, PowerOff } from 'lucide-react'
import type { Position } from '../types/positions.types'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import PositionEdit from './PositionEdit'
import PositionStatusAlert from './PositionStatusAlert'
import { hasPermission, useAuth } from '@/modules/auth'

interface Props {
  position: Position
  onDetails: (id: string) => void
}

export default function PositionActions({ position, onDetails }: Props) {
  const auth = useAuth()
  const canManage = hasPermission(auth.data?.permissions, 'catalogs:update')
  const [editOpen, setEditOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Acciones para el puesto ${position.name}`}
            >
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onDetails(position.id)}>
              <Eye />
              Ver detalles
            </DropdownMenuItem>

            {canManage && (
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil />
                Editar
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          {canManage && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant={position.isActive ? 'destructive' : 'default'}
                  onClick={() => setStatusOpen(true)}
                >
                  {position.isActive ? <PowerOff /> : <Power />}
                  {position.isActive ? 'Desactivar' : 'Activar'}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <PositionEdit
        position={position}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <PositionStatusAlert
        position={position}
        open={statusOpen}
        onOpenChange={setStatusOpen}
      />
    </>
  )
}
