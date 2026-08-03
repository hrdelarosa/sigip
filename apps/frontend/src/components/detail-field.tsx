interface Props {
  label: string
  children: React.ReactNode
}

export function DetailField({ label, children }: Props) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  )
}
