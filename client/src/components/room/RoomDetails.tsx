import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Users, Copy, LogOut, Radio, Check } from 'lucide-react'
import { toast } from 'sonner'
import { getRoomApi, leaveRoomApi } from '#/utils/api'
import { useUserStore } from '#/store/user'
import type { User } from '#/types'

export function RoomDetails() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const params = useParams({ strict: false })
  const roomId = params.roomId || ''

  const { userId } = useUserStore()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: room } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => getRoomApi(roomId, userId),
    enabled: Boolean(roomId),
  })

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Room link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeaveRoom = () => {
    if (roomId && userId) {
      leaveRoomApi(roomId, userId)
    }
    queryClient.invalidateQueries({ queryKey: ['room', roomId] })
    setOpen(false)
    toast.info('Left the room')
    navigate({ to: '/' })
  }

  if (!roomId) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 px-3 py-1.5 h-9 text-xs font-semibold cursor-pointer border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl"
          >
            <Radio className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="max-w-[140px] sm:max-w-[180px] truncate">{room?.name || 'Room Details'}</span>
            {room?.users && (
              <span className="ml-0.5 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-mono font-bold">
                {room.users.length}
              </span>
            )}
          </Button>
        }
      />

      <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-md jam-card p-5 min-w-0 overflow-hidden">
        <DialogHeader className="space-y-1 min-w-0">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground min-w-0">
            <Radio className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate min-w-0 flex-1">{room?.name || 'Room Details'}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Share this room with friends to listen together in real-time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 min-w-0 w-full">
          {/* Room ID & Share Link Input Group */}
          <div className="space-y-1.5 min-w-0 w-full">
            <label className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
              Shareable Link
            </label>
            <div className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/40 p-1.5 pl-3 min-w-0 w-full">
              <span className="font-mono text-[11px] text-foreground truncate block min-w-0 flex-1 select-all">
                {typeof window !== 'undefined' ? window.location.href : roomId}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="h-7 px-3 text-xs font-medium cursor-pointer shrink-0 rounded-lg flex items-center gap-1.5 bg-background/50 hover:bg-background border-border/60 text-foreground"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Active Listeners Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                Active Listeners ({room?.users.length || 0})
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {room?.users.map((user: User) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-muted/30 border border-border/40 text-xs min-w-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[11px]">
                      {user.userName.charAt(0).toUpperCase()}
                      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                    </div>
                    <span className="font-medium text-foreground truncate block min-w-0 flex-1">{user.userName}</span>
                  </div>
                  {user.userId === userId && (
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold shrink-0">
                      You
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Balanced Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            className="text-xs cursor-pointer rounded-lg px-4"
          >
            Close
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLeaveRoom}
            className="flex items-center gap-1.5 text-xs cursor-pointer rounded-lg"
          >
            <LogOut className="h-3.5 w-3.5" />
            Leave Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
