interface Props extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  children: React.ReactNode
}

export function DetailField({ label, children, ...props }: Props) {
  return (
    <div {...props}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  )
}
