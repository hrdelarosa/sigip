export function AccessEmptyState() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">Sin módulos asignados</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          La cuenta es válida, pero no tiene permisos de consulta asignados.
        </p>
      </div>
    </div>
  )
}
