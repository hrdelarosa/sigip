import { BanIcon, EyeIcon, MoreHorizontalIcon, PencilIcon } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'wouter'

import { routes } from '@/app/router/routes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Incident } from '../types/incident.types'
import { hasPermission, useAuth } from '@/modules/auth'
import { IncidentCancelAlert } from './IncidentCancelAlert'
import { IncidentEditDialog } from './IncidentEditDialog'

export function IncidentActions({ incident }: { incident: Incident }) {
  const [, navigate] = useLocation()
  const auth = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const canEdit = ['incidents:update', 'employees:read', 'catalogs:read'].every(
    (permission) => hasPermission(auth.data?.permissions, permission),
  )
  const canCancel = hasPermission(auth.data?.permissions, 'incidents:cancel')

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Acciones para la incidencia de ${incident.employee.fullName}`}
            >
              <MoreHorizontalIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                navigate(
                  `${routes.incidents.detail(incident.id)}${window.location.search}`,
                )
              }
            >
              <EyeIcon />
              Ver expediente
            </DropdownMenuItem>
            {incident.status === 'REGISTERED' && canEdit ? (
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <PencilIcon />
                Editar
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
          {incident.status === 'REGISTERED' && canCancel ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setCancelOpen(true)}
                >
                  <BanIcon />
                  Cancelar incidencia
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {canEdit ? (
        <IncidentEditDialog
          incident={incident}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
      {canCancel ? (
        <IncidentCancelAlert
          incident={incident}
          open={cancelOpen}
          onOpenChange={setCancelOpen}
        />
      ) : null}
    </>
  )
}
