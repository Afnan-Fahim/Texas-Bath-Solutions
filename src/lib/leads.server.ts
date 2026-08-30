import { sendTemplateEmail } from './email-templates/send-email'

const RECIPIENTS = [
  'justin@texasbathsolutions.com',
  'josiah@texasbathsolutions.com',
  'contact@texasbathsolutions.com',
]

export interface LeadInput {
  name: string
  phone: string
  email: string
  address: string
  timeframe?: string
  notes?: string
  source?: string
}

export async function notifyLead(lead: LeadInput) {
  const submittedAt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date())

  const eventId = `${lead.email.toLowerCase()}-${Date.now().toString(36)}`

  const results = await Promise.allSettled(
    RECIPIENTS.map((to) =>
      sendTemplateEmail('lead-notification', to, {
        templateData: { ...lead, submittedAt },
        idempotencyKey: `lead-notification-${eventId}-${to}`,
        replyTo: lead.email,
      })
    )
  )

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[leads] failed to notify ${RECIPIENTS[i]}:`, r.reason)
    }
  })

  return { ok: results.some((r) => r.status === 'fulfilled') }
}
