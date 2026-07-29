import type { Music } from '#/types'

interface TrackInfoProps {
  s?: Music
}

export function TrackInfo({ s }: TrackInfoProps) {
  return (
    <div className="flex items-center gap-3 overflow-hidden w-full">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/60 text-xs text-muted-foreground">
        {s ? (
          <img
            src={s.thumbnailUrl}
            alt={s.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.currentTarget as HTMLElement).style.display = 'none'
            }}
          />
        ) : (
          <span className="text-sm">♫</span>
        )}
      </div>
      <div className="flex flex-col text-left text-xs min-w-0 flex-1">
        <span className="truncate font-medium text-foreground">
          {s ? s.title : 'No Track Selected'}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="truncate text-[10px] text-muted-foreground">
            {s ? s.uploader : '—'}
          </span>
          {s && (
            <span className="shrink-0 rounded bg-primary/15 px-1 py-0.2 text-[9px] font-semibold text-primary">
              HQ
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
