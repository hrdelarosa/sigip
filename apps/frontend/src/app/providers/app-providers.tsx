import type { PropsWithChildren } from 'react'

import { QueryProvider } from './query-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster closeButton position="top-right" />
    </QueryProvider>
  )
}
