import type { UserResponse } from '@sigip/shared'
import { getInitials } from '@/lib/getInitials'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { DetailsErrorAlert } from '@/components/details/details-error-alert'
import { StatusBadge } from '@/components/status-badge'
import { useUser } from '../hooks/useUser'
import { UserDetailsContent } from './UserDetailsContent'
import { UserDetailsSkeleton } from './skeletons/UserDetailsSkeleton'

interface Props {
  user: UserResponse
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UserDetails({ user, open, onOpenChange }: Props) {
  const userQuery = useUser(open ? user.id : null)
  const details = userQuery.data

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 sm:max-w-md">
        <SheetHeader className="p-6 pr-14">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 border">
              <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-lg leading-tight">
                {user.fullName}
              </SheetTitle>
              <SheetDescription className="truncate text-sm">
                @{user.username}
              </SheetDescription>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <StatusBadge isActive={user.isActive} dot />
              </div>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <ScrollArea className="min-h-0 flex-1">
          <div
            className="flex flex-col gap-5 p-4 sm:p-6"
            aria-busy={userQuery.isPending}
          >
            {userQuery.isPending ? (
              <>
                <span className="sr-only" role="status">
                  Cargando detalles del usuario...
                </span>
                <UserDetailsSkeleton />
              </>
            ) : null}

            {userQuery.isError ? (
              <DetailsErrorAlert
                itemType="usuario"
                onRetry={() => userQuery.refetch()}
                isPending={userQuery.isPending}
              />
            ) : null}

            {details ? <UserDetailsContent details={details} /> : null}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
