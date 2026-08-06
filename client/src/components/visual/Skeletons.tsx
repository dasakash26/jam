import type { HTMLAttributes } from 'react'
import { Card } from '../ui/card'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/60 ${className ?? ''}`}
      {...props}
    />
  )
}

export function MusicCardSkeleton() {
  return (
    <Card className="flex flex-1 h-full min-h-0 w-full max-w-lg flex-col overflow-hidden jam-card">
      <Skeleton className="flex-1 min-h-0" />
      <div className="flex flex-col gap-2 border-t border-border/50 bg-card/85 p-5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2 bg-muted/40" />
      </div>
    </Card>
  )
}

export function SearchItemSkeleton() {
  return (
    <div className="flex items-center justify-between gap-2.5 rounded-md px-2 py-1.5">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Skeleton className="h-9 w-9 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2 w-1/2 bg-muted/40" />
        </div>
      </div>
      <Skeleton className="h-4 w-8 shrink-0 bg-muted/40" />
    </div>
  )
}

export function RootSkeleton() {
  return (
    <>
      <MusicCardSkeleton />
      <div className="flex flex-col flex-1 h-full min-h-[40vh] sm:min-h-0 w-full max-w-lg jam-card p-6 gap-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-16 w-full rounded-xl bg-muted/40" />
        <Skeleton className="h-12 w-full rounded-lg bg-muted/30" />
        <Skeleton className="h-12 w-full rounded-lg bg-muted/30" />
      </div>
    </>
  )
}
