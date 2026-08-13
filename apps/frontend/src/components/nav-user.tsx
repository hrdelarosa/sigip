import { ChevronDownIcon, LogOutIcon, ShieldCheckIcon } from 'lucide-react'
import type { AuthenticatedUserResponse } from '@sigip/shared'
import { getInitials } from '@/lib/getInitials'

import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { useLogout } from '@/modules/auth'

export function NavUser({
  user,
}: {
  user: AuthenticatedUserResponse | null | undefined
}) {
  const logout = useLogout()

  if (!user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="lg"
            className="h-11"
            aria-label={`Abrir menú de ${user.fullName}`}
          >
            <Avatar className="size-8 rounded-lg grayscale after:rounded-lg mr-1">
              <AvatarFallback className="rounded-lg">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="hidden min-w-0 flex-1 text-left leading-tight sm:grid">
              <span className="truncate font-medium">{user.username}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.fullName}
              </span>
            </div>

            <ChevronDownIcon className="ml-1.5 hidden size-4 text-muted-foreground transition-transform group-data-popup-open:rotate-180 sm:block" />
          </Button>
        }
      />
      <DropdownMenuContent
        className="w-72 rounded-lg p-1.5"
        side="bottom"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3 text-left">
              <Avatar size="lg">
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-semibold">
                  {user.fullName}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <div className="flex items-center gap-2 px-2 py-2.5 text-xs text-muted-foreground">
          <ShieldCheckIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{user.role.name}</span>
        </div>

        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          variant="destructive"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
          className="py-2"
        >
          <LogOutIcon />
          {logout.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
