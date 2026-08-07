import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { HelpCircle, Search, Radio, Copy, Users, Sparkles } from 'lucide-react'

export function HelpDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className={`h-9 w-9 rounded-xl border-border/80 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shrink-0 ${className ?? ''}`}
            title="Help & Guide"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Help</span>
          </Button>
        }
      />

      <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-sm jam-card p-4 min-w-0 overflow-hidden">
        <DialogHeader className="space-y-0.5 min-w-0">
          <DialogTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span>How Jam Works</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-1 text-xs min-w-0">
          {/* Step 1: Search & Playlists */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30 border border-border/40 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Search className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1 flex items-center justify-between gap-1">
              <span className="font-semibold text-foreground truncate">
                Search or Playlist
              </span>
              <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                Paste link or ⌘K
              </span>
            </div>
          </div>

          {/* Step 2: Create Room */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30 border border-border/40 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Radio className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1 flex items-center justify-between gap-1">
              <span className="font-semibold text-foreground truncate">
                Create a Room
              </span>
              <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                Click Join/Create Room
              </span>
            </div>
          </div>

          {/* Step 3: Share Link */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30 border border-border/40 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Copy className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1 flex items-center justify-between gap-1">
              <span className="font-semibold text-foreground truncate">
                Share Room Link
              </span>
              <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                Room Badge ➔ Copy Link
              </span>
            </div>
          </div>

          {/* Step 4: Collaborative Queue */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30 border border-border/40 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/25">
              <Users className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1 flex items-center gap-1.5">
              <span className="font-semibold text-foreground truncate">Queued by</span>
              <span className="inline-flex px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold text-[9px] border border-primary/30 shrink-0">
                AD
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                (User Initials)
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border/40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            className="text-xs h-7 rounded-lg px-3 cursor-pointer"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
