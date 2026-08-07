import type { HTMLAttributes } from 'react'
import { Card } from '../ui/card'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-muted/60 border border-border/20 shadow-xs ${className ?? ''}`}
      {...props}
    />
  )
}

export function MusicCardSkeleton() {
  return (
    <Card className="flex flex-col flex-1 h-full min-h-[380px] sm:min-h-0 w-full max-w-lg overflow-hidden jam-card rounded-2xl border border-border/60 shadow-xl">
      <div className="relative flex-1 min-h-[220px] sm:min-h-[260px] p-6 flex flex-col items-center justify-center bg-muted/10">
        <Skeleton className="h-36 w-36 sm:h-48 sm:w-48 rounded-2xl shadow-xl bg-muted/40" />
      </div>
      <div className="flex flex-col gap-3 border-t border-border/50 bg-card/85 backdrop-blur-md p-4 sm:p-5">
        <Skeleton className="h-4.5 w-3/4 rounded-md" />
        <Skeleton className="h-3.5 w-1/2 bg-muted/40 rounded-md" />
      </div>
    </Card>
  )
}

export function SearchItemSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg p-2.5 bg-muted/20 border border-border/30">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-md bg-muted/50" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3.5 w-3/4 rounded-md" />
          <Skeleton className="h-2.5 w-1/2 bg-muted/40 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-4.5 w-9 shrink-0 bg-muted/40 rounded-md" />
    </div>
  )
}

export function QueueCardSkeleton() {
  return (
    <Card className="flex flex-col flex-1 h-full min-h-[380px] sm:min-h-0 w-full max-w-lg jam-card rounded-2xl p-4 sm:p-5 gap-3 border border-border/60 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-md bg-muted/40" />
      </div>
      <div className="space-y-2 flex-1 overflow-hidden">
        <SearchItemSkeleton />
        <SearchItemSkeleton />
        <SearchItemSkeleton />
        <SearchItemSkeleton />
      </div>
    </Card>
  )
}

export function RootSkeleton() {
  return (
    <div className="my-auto flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 sm:gap-6 md:flex-row md:items-stretch max-w-5xl mx-auto md:h-[calc(100dvh-170px)] md:max-h-155 lg:max-h-165">
      <MusicCardSkeleton />
      <QueueCardSkeleton />
    </div>
  )
}
