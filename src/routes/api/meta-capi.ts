import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const schema = z.object({
  eventName: z.enum(['Lead', 'Schedule', 'Contact', 'CompleteRegistration']),
  eventId: z.string().trim().min(1).max(120),
  eventSourceUrl: z.string().trim().max(500).optional(),
  email: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  fbc: z.string().trim().max(255).optional(),
  fbp: z.string().trim().max(255).optional(),
  value: z.number().nonnegative().max(100000).optional(),
  currency: z.string().trim().max(8).optional(),
  contentName: z.string().trim().max(120).optional(),
  contentCategory: z.string().trim().max(120).optional(),
})

export const Route = createFileRoute('/api/meta-capi')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed
        try {
          parsed = schema.parse(await request.json())
        } catch {
          return Response.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
        }

        const { sendCapiEvent } = await import('@/lib/capi.server')

        const ip =
          request.headers.get('cf-connecting-ip') ??
          (request.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() ??
          ''
        const ua = request.headers.get('user-agent') ?? ''

        const result = await sendCapiEvent({
          ...parsed,
          clientIpAddress: ip || undefined,
          clientUserAgent: ua || undefined,
        })

        return Response.json(result, { status: result.ok ? 200 : 202 })
      },
    },
  },
})
