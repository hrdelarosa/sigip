import { routes } from './routes'

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">
          La página solicitada no existe.
        </p>
        <a
          className="mt-4 inline-block text-sm font-medium underline"
          href={routes.home}
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}
