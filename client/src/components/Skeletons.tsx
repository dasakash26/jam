import { Card } from './ui/card'

export function MusicCardSkeleton() {
  return (
    <Card className="flex flex-1 h-full min-h-0 w-full max-w-lg flex-col overflow-hidden jam-card">
      <div className="flex-1 min-h-0 bg-muted/60 animate-pulse" />
      <div className="flex flex-col gap-2 border-t border-border/50 bg-card/85 p-5">
        <div className="h-4 w-3/4 rounded bg-muted/60 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-muted/40 animate-pulse" />
      </div>
    </Card>
  )
}

export function SearchItemSkeleton() {
  return (
    <div className="flex items-center justify-between gap-2.5 rounded-md px-2 py-1.5">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className="h-9 w-9 shrink-0 animate-pulse rounded-md bg-muted/60"></div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted/60"></div>
          <div className="h-2 w-1/2 animate-pulse rounded bg-muted/40"></div>
        </div>
      </div>
      <div className="h-4 w-8 shrink-0 animate-pulse rounded bg-muted/40"></div>
    </div>
  )
}

export function RootSkeleton() {
  return (
    <>
      <MusicCardSkeleton />
      <div className="flex flex-col flex-1 h-full min-h-[40vh] sm:min-h-0 w-full max-w-lg jam-card p-6 gap-4">
        <div className="h-5 w-24 rounded bg-muted/60 animate-pulse" />
        <div className="h-16 w-full rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-12 w-full rounded-lg bg-muted/30 animate-pulse" />
        <div className="h-12 w-full rounded-lg bg-muted/30 animate-pulse" />
      </div>
    </>
  )
}
