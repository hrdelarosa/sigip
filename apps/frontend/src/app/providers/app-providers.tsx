import type { PropsWithChildren } from 'react'

import { NuqsAdapter } from 'nuqs/adapters/react'
import { QueryProvider } from './query-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <NuqsAdapter>
      <QueryProvider>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster closeButton position="top-right" richColors />
      </QueryProvider>
    </NuqsAdapter>
  )
}
