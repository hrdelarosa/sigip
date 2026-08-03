import type { PropsWithChildren } from 'react'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold">SIGIP</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sistema de Gestión de Incidencias de Personal
          </p>
        </div>

        <div className="rounded-xl border bg-background p-6 shadow-sm">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Oficina de Representación del Instituto Nacional de Migración en
          Guerrero
        </p>
      </div>
    </div>
  )
}
