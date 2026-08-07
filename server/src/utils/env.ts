import z from 'zod'

const envSchema = z.object({
  PORT: z.coerce
    .number({
      message: 'PORT environment variable is required and must be a valid number.',
    })
    .int()
    .positive({
      message: 'PORT must be a positive integer.',
    }),
})

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error('[ENV ERROR] Invalid or missing environment variables:')
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
  }
  process.exit(1)
}

export const env = result.data
