export interface DataTableColumn<T> {
  key: string
  header: React.ReactNode
  headerClassName?: string
  cellClassName?: string
  skeletonClassName?: string
  render: (row: T) => React.ReactNode
}
