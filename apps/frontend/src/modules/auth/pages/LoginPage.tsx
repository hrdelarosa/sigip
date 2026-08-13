import LoginForm from '../components/LoginForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Acceso institucional
        </p>
        <CardTitle className="text-xl">Iniciar sesión</CardTitle>
        <CardDescription>
          Use las credenciales asignadas por el administrador del sistema.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}
