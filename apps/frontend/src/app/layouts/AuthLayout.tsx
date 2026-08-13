import type { PropsWithChildren } from 'react'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-svh flex-col justify-center items-center bg-muted/30 ">
      <div className="flex flex-col gap-3 w-full max-w-md">
        <div className="flex flex-col items-center self-center font-semibold text-base">
          <img
            src="/inm.webp"
            alt="Instituto Nacional de Migración"
            className="h-24 shrink-0 object-contain"
          />

          <div>
            <p className="text-muted-foreground text-center">
              SIGIP - Sistema de Gestión de Incidencias de Personal
            </p>
          </div>
        </div>

        {children}

        <p className="mt-2.5 text-center text-xs font-medium text-muted-foreground">
          Oficina de Representación del Instituto Nacional de Migración en
          Guerrero
        </p>
      </div>
    </div>
  )
}
