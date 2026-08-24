import { Link, useLocation } from 'wouter'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb'
import {
  getBreadcrumbEntries,
  type BreadcrumbEntry,
} from '@/lib/site-header-breadcrumb.utils'

export function SiteHeaderBreadcrumb() {
  const [location] = useLocation()
  const entries = getBreadcrumbEntries(location)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {entries.map((entry, index) => (
          <BreadcrumbEntryView
            key={`${entry.label}-${index}`}
            entry={entry}
            isCurrent={index === entries.length - 1}
            hasSeparator={index > 0}
          />
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function BreadcrumbEntryView({
  entry,
  isCurrent,
  hasSeparator,
}: {
  entry: BreadcrumbEntry
  isCurrent: boolean
  hasSeparator: boolean
}) {
  return (
    <>
      {hasSeparator ? <BreadcrumbSeparator /> : null}
      <BreadcrumbItem>
        {isCurrent || !entry.href ? (
          <BreadcrumbPage>{entry.label}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink render={<Link href={entry.href} />}>
            {entry.label}
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    </>
  )
}
