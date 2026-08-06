import { Moon, Sun, Monitor } from 'lucide-react'

import { Button } from '../ui/button'
import { useTheme } from './theme-provider'

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('system')
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className={className}>
      {theme === 'system' && <Monitor className="h-[1.2rem] w-[1.2rem]" />}
      {theme === 'light' && <Sun className="h-[1.2rem] w-[1.2rem]" />}
      {theme === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem]" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
