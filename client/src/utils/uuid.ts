export function generateId(prefix = '', length = 6): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return prefix ? `${prefix}${result}` : result
}
