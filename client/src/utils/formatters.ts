export function formatDuration(seconds: number): string {
  if (typeof seconds !== 'number' || Number.isNaN(seconds) || seconds < 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') return '?'
  const parts = name
    .trim()
    .split(/[\s_]+/)
    .filter(Boolean)
  if (parts.length >= 2) {
    const firstChar = parts[0][0] || ''
    const secondChar = parts[1][0] || ''
    return (firstChar + secondChar).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}
