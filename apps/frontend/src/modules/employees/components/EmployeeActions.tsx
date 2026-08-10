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

interface Props {
  employee: Employee
}

export default function EmployeeActions({ employee }: Props) {
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
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil />
              Editar
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant={employee.status === 'ACTIVE' ? 'destructive' : 'default'}
              onClick={() => setStatusOpen(true)}
            >
              {employee.status === 'ACTIVE' ? <PowerOff /> : <Power />}
              {employee.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <EmployeeEdit
        employee={employee}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <EmployeeStatusAlert
        employee={employee}
        open={statusOpen}
        onOpenChange={setStatusOpen}
      />
    </>
  )
}
