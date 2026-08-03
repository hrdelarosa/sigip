import type { PropsWithChildren } from 'react'
// import { Toaster } from 'sonner';

import { QueryProvider } from './query-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <TooltipProvider>{children}</TooltipProvider>

      {/* <Toaster
        position="top-right"
        richColors
        closeButton
      /> */}
    </QueryProvider>
  )
}
