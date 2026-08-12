import type { PropsWithChildren } from 'react'

import { NuqsAdapter } from 'nuqs/adapters/react'
import { QueryProvider } from './query-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'
import { AuthSessionListener } from '@/modules/auth'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <NuqsAdapter>
      <QueryProvider>
        <AuthSessionListener />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster closeButton position="top-right" richColors />
      </QueryProvider>
    </NuqsAdapter>
  )
}
