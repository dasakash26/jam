import { AlertCircle } from 'lucide-react'

interface ErrorBoxProps {
  title?: string
  message: string
  className?: string
}

export function ErrorBox({
  title = 'An error occurred',
  message,
  className = '',
}: ErrorBoxProps) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive ${className}`}
    >
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="space-y-1 text-left">
        <h4 className="text-xs font-bold leading-none">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed break-words">
          {message}
        </p>
      </div>
    </div>
  )
}
