import { useState } from 'react'
import type { OrganizationalUnit } from '../types/organizational-units.types'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, MoreHorizontal, Pencil, Power, PowerOff } from 'lucide-react'
import OrganizationalUnitEdit from './OrganizationalUnitEdit'
import OrganizationalUnitAlert from './OrganizationalUnitAlert'
import { useLocation } from 'wouter'
import { routes } from '@/app/router/routes'

interface Props {
  organizationalUnit: OrganizationalUnit
}

export default function OrganizationalUnitActions({
  organizationalUnit,
}: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [, navigate] = useLocation()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Acciones para la unidad organizacional ${organizationalUnit.name}`}
            >
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                navigate(
                  routes.administration.organizationalUnitDetail(
                    organizationalUnit.id,
                  ),
                )
              }
            >
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
              variant={organizationalUnit.isActive ? 'destructive' : 'default'}
              onClick={() => setStatusOpen(true)}
            >
              {organizationalUnit.isActive ? <PowerOff /> : <Power />}
              {organizationalUnit.isActive ? 'Desactivar' : 'Activar'}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <OrganizationalUnitEdit
        organizationalUnit={organizationalUnit}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <OrganizationalUnitAlert
        organizationalUnit={organizationalUnit}
        open={statusOpen}
        onOpenChange={setStatusOpen}
      />
    </>
  )
}
