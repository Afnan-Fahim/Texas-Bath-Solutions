import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(32),
  email: z.string().trim().email().max(160),
  address: z.string().trim().min(1).max(240),
  timeframe: z.string().trim().max(80).optional().default(''),
  notes: z.string().trim().max(2000).optional().default(''),
  source: z.string().trim().max(120).optional().default('Website booking form'),
})

export const submitLead = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const { notifyLead } = await import('./leads.server')
    return notifyLead(data)
  })
