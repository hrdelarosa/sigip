import { useState } from 'react'
import { Eye, MoreHorizontal, Pencil, Power, PowerOff } from 'lucide-react'
import type { Employee } from '../types/employee.types'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import EmployeeEdit from './EmployeeEdit'
import EmployeeStatusAlert from './EmployeeStatusAlert'
import { useLocation } from 'wouter'
import { routes } from '@/app/router/routes'
import { useAuth } from '@/modules/auth'
import { getEmployeePermissions } from '../lib/employee-permissions'

interface Props {
  employee: Employee
}

export default function EmployeeActions({ employee }: Props) {
  const auth = useAuth()
  const { canUpdate, canChangeStatus } = getEmployeePermissions(
    auth.data?.permissions,
    employee.status === 'ACTIVE',
  )
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
              aria-label={`Acciones para el empleado ${employee.fullName}`}
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
                  `${routes.employees.detail(employee.id)}${window.location.search}`,
                )
              }
            >
              <Eye />
              Ver detalles
            </DropdownMenuItem>
            {canUpdate ? (
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil />
                Editar
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
          {canChangeStatus ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant={
                    employee.status === 'ACTIVE' ? 'destructive' : 'default'
                  }
                  onClick={() => setStatusOpen(true)}
                >
                  {employee.status === 'ACTIVE' ? <PowerOff /> : <Power />}
                  {employee.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {canUpdate ? (
        <EmployeeEdit
          employee={employee}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
      {canChangeStatus ? (
        <EmployeeStatusAlert
          employee={employee}
          open={statusOpen}
          onOpenChange={setStatusOpen}
        />
      ) : null}
    </>
  )
}
