import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Field, FieldGroup } from '../ui/field'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Radio, Shuffle, Plus, LogIn, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { createRoomApi } from '#/utils/api'
import { useUserStore } from '#/store/user'
import { generateRandomRoomName } from '#/utils/names'

export function JoinRoom() {
  const navigate = useNavigate()
  const { userId, userName } = useUserStore()

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [roomName, setRoomName] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && mode === 'create' && !roomName) {
      setRoomName(generateRandomRoomName())
    }
  }, [open, mode, roomName])

  const handleRollRoomName = () => {
    setRoomName(generateRandomRoomName())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'create') {
      if (!roomName.trim()) {
        toast.error('Please enter a room name.')
        return
      }

      setIsSubmitting(true)
      try {
        const data = await createRoomApi(roomName.trim(), userName, userId)
        toast.success(`Room "${roomName.trim()}" created!`)
        setOpen(false)
        navigate({ to: '/rooms/$roomId', params: { roomId: data.roomId } })
      } catch (err: any) {
        toast.error('Error creating room', { description: String(err.message) })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      if (!joinRoomId.trim()) {
        toast.error('Please enter a valid Room ID.')
        return
      }

      setOpen(false)
      navigate({
        to: '/rooms/$roomId',
        params: { roomId: joinRoomId.trim() },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            title="Create or Join Room"
            className="h-9 w-9 rounded-xl"
          >
            <Radio className="h-4 w-4" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm jam-card rounded-2xl p-5 border border-border/60">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 pr-6">
              <DialogTitle className="flex items-center gap-2.5 text-base font-bold tracking-tight">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 border border-primary/25 text-primary shrink-0">
                  <Radio className="h-4 w-4" />
                </div>
                Music Jam Room
              </DialogTitle>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <DialogDescription className="text-xs text-muted-foreground leading-normal">
                Collaborate and sync playback.
              </DialogDescription>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-amber-500 shrink-0">
                <UserCheck className="h-3 w-3 text-amber-500" />
                {userName}
              </span>
            </div>
          </DialogHeader>

          {/* Segmented Control Tabs */}
          <div className="mt-4 grid grid-cols-2 rounded-xl bg-muted/60 p-1 gap-1 border border-border/30">
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
                mode === 'create'
                  ? 'bg-background text-foreground shadow-xs border border-border/50 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              Create
            </button>
            <button
              type="button"
              onClick={() => setMode('join')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
                mode === 'join'
                  ? 'bg-background text-foreground shadow-xs border border-border/50 font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              Join by ID
            </button>
          </div>

          <FieldGroup className="my-4 space-y-3.5">
            {mode === 'create' ? (
              <Field className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="roomName"
                    className="text-xs font-medium text-foreground"
                  >
                    Room Name
                  </Label>
                  <button
                    type="button"
                    onClick={handleRollRoomName}
                    className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium cursor-pointer"
                  >
                    <Shuffle className="h-3 w-3" />
                    Randomize
                  </button>
                </div>
                <Input
                  id="roomName"
                  name="roomName"
                  placeholder="e.g. Groove Shack 42"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                  className="h-9 text-xs rounded-xl bg-background/50 border-border/60"
                />
              </Field>
            ) : (
              <Field className="space-y-1.5">
                <Label
                  htmlFor="joinRoomId"
                  className="text-xs font-medium text-foreground"
                >
                  Room ID
                </Label>
                <Input
                  id="joinRoomId"
                  name="joinRoomId"
                  placeholder="Paste Room ID (UUID)..."
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  required
                  className="h-9 text-xs font-mono rounded-xl bg-background/50 border-border/60"
                />
              </Field>
            )}
          </FieldGroup>

          <DialogFooter className="mt-5 gap-2 border-t border-border/30 pt-3">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="h-8.5 rounded-xl text-xs"
                >
                  Cancel
                </Button>
              }
            />
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8.5 rounded-xl text-xs font-semibold shadow-xs"
            >
              {mode === 'create'
                ? isSubmitting
                  ? 'Creating...'
                  : 'Create & Launch'
                : 'Join Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
