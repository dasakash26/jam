import type { HTMLAttributes } from 'react'
import { Card } from '../ui/card'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-muted/50 border border-border/20 ${className ?? ''}`}
      {...props}
    />
  )
}

export function MusicCardSkeleton() {
  return (
    <Card className="flex flex-1 h-full min-h-0 w-full max-w-lg flex-col overflow-hidden jam-card rounded-2xl border border-border/60 shadow-xl">
      <div className="relative flex-1 min-h-[220px] sm:min-h-[280px] p-6 flex flex-col items-center justify-center bg-muted/20">
        <Skeleton className="h-32 w-32 sm:h-44 sm:w-44 rounded-2xl shadow-lg" />
      </div>
      <div className="flex flex-col gap-2.5 border-t border-border/50 bg-card/85 backdrop-blur-md p-5 sm:p-6">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2 bg-muted/40" />
      </div>
    </Card>
  )
}

export function SearchItemSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl p-2.5 bg-muted/20 border border-border/30">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-2.5 w-1/2 bg-muted/40" />
        </div>
      </div>
      <Skeleton className="h-5 w-10 shrink-0 bg-muted/40 rounded-md" />
    </div>
  )
}

export function QueueCardSkeleton() {
  return (
    <div className="flex flex-col flex-1 h-full min-h-[300px] w-full max-w-lg jam-card rounded-2xl p-5 sm:p-6 gap-4 border border-border/60 shadow-xl">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28 rounded-md" />
        <Skeleton className="h-7 w-20 rounded-lg bg-muted/40" />
      </div>
      <div className="space-y-2.5 flex-1 overflow-hidden">
        <SearchItemSkeleton />
        <SearchItemSkeleton />
        <SearchItemSkeleton />
      </div>
    </div>
  )
}

export function RootSkeleton() {
  return (
    <div className="my-auto flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 sm:gap-6 md:flex-row md:items-stretch max-w-5xl mx-auto">
      <MusicCardSkeleton />
      <QueueCardSkeleton />
    </div>
  )
}

