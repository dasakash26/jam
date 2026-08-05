import { useState } from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Field, FieldGroup } from './ui/field'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Users } from 'lucide-react'
import { toast } from 'sonner'
import { createRoomApi } from '#/utils/api'

export function JoinRoom() {
  const [open, setOpen] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [userName, setUserName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomName.trim() || !userName.trim()) {
      toast.error('Please enter both a room name and your user name.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await createRoomApi(roomName.trim(), userName.trim())
      toast.success(`Room "${roomName}" created!`, {
        description: `Room ID: ${data.roomId}`,
      })
      setOpen(false)
    } catch (err: any) {
      toast.error('Error creating room', { description: String(err.message) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon" title="Create or Join Room">
            <Users className="h-4 w-4" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm jam-card">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-muted-foreground" />
              Create Sync Room
            </DialogTitle>
            <DialogDescription className="text-xs">
              Start a real-time collaborative music room with friends.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="my-4 space-y-3">
            <Field>
              <Label htmlFor="roomName" className="text-xs">Room Name</Label>
              <Input
                id="roomName"
                name="roomName"
                placeholder="e.g. Midnight Vibes"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
                className="h-8 text-xs"
              />
            </Field>
            <Field>
              <Label htmlFor="userName" className="text-xs">Your Name</Label>
              <Input
                id="userName"
                name="userName"
                placeholder="e.g. Alex"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="h-8 text-xs"
              />
            </Field>
          </FieldGroup>
          <DialogFooter className="gap-2">
            <DialogClose render={<Button variant="outline" size="sm" type="button">Cancel</Button>} />
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

