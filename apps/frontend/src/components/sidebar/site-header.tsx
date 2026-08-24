import { NavUser } from '../nav-user'
import { Separator } from '../ui/separator'
import { SidebarTrigger } from '../ui/sidebar'
import { useAuth } from '@/modules/auth'
import { SiteHeaderBreadcrumb } from './site-header-breadcrumb'

export function SiteHeader() {
  const auth = useAuth()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger
          className="-ml-1"
          aria-label="Alternar barra lateral"
          title="Alternar barra lateral"
        />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-14"
        />

        <SiteHeaderBreadcrumb />

        <div className="ml-auto flex items-center gap-2">
          <NavUser user={auth.data} />
        </div>
      </div>
    </header>
  )
}
