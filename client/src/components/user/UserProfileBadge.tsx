import { useState, useEffect } from 'react'
import { CircleUser, Shuffle, Check } from 'lucide-react'
import { useUserStore } from '#/store/user'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { toast } from 'sonner'
import { generateUsername } from '#/utils/names'

export function UserProfileBadge() {
  const { userName, setUserName } = useUserStore()
  const [open, setOpen] = useState(false)
  const [nameInput, setNameInput] = useState(userName)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setNameInput(userName)
  }, [userName])

  const handleRollName = () => {
    const fresh = generateUsername()
    setUserName(fresh)
    setNameInput(fresh)
    toast.info(`New Alias: ${fresh}`)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput.trim()) {
      toast.error('Invalid Username', { description: 'Username cannot be blank.' })
      return
    }
    setUserName(nameInput.trim())
    toast.success('Username updated!')
    setOpen(false)
  }

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 opacity-50 pointer-events-none"
        disabled
      >
        <CircleUser className="h-4 w-4 text-muted-foreground" />
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 relative group"
            title={`User: ${userName}`}
          >
            <CircleUser className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xs jam-card">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <CircleUser className="h-4 w-4 text-muted-foreground" />
              Your Identity
            </DialogTitle>
          </DialogHeader>

          <div className="my-4 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="headerUserName" className="text-xs">
                  Username
                </Label>
                <button
                  type="button"
                  onClick={handleRollName}
                  className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                >
                  <Shuffle className="h-3 w-3" />
                  Randomize
                </button>
              </div>
              <Input
                id="headerUserName"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Brave_Panda_4821"
                className="h-8 text-xs font-mono"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose
              render={
                <Button variant="outline" size="sm" type="button">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" size="sm" className="gap-1">
              <Check className="h-3.5 w-3.5" />
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
