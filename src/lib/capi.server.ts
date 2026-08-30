/**
 * Meta Conversions API (server-side events).
 * Mirrors the browser pixel events using the same event_id so Meta de-duplicates.
 */

const DEFAULT_PIXEL_ID = '1062683162839921'
const API_VERSION = 'v21.0'

async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function normalizeEmail(v: string) {
  return v.trim().toLowerCase()
}

function normalizePhone(v: string) {
  const digits = v.replace(/\D/g, '')
  if (!digits) return ''
  // Assume US numbers when no country code is present.
  return digits.length === 10 ? `1${digits}` : digits
}

export type CapiEventInput = {
  eventName: string
  eventId: string
  eventSourceUrl?: string
  clientUserAgent?: string
  clientIpAddress?: string
  fbc?: string
  fbp?: string
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  value?: number
  currency?: string
  contentName?: string
  contentCategory?: string
}

export async function sendCapiEvent(input: CapiEventInput) {
  const token = process.env['META_CAPI_ACCESS_TOKEN']
  const PIXEL_ID = process.env['META_PIXEL_ID'] || DEFAULT_PIXEL_ID
  if (!token) {
    return { ok: false as const, skipped: 'missing_token' as const }
  }

  const userData: Record<string, unknown> = {}
  if (input.email) userData['em'] = [await sha256(normalizeEmail(input.email))]
  if (input.phone) {
    const p = normalizePhone(input.phone)
    if (p) userData['ph'] = [await sha256(p)]
  }
  if (input.firstName) userData['fn'] = [await sha256(input.firstName.trim().toLowerCase())]
  if (input.lastName) userData['ln'] = [await sha256(input.lastName.trim().toLowerCase())]
  if (input.fbc) userData['fbc'] = input.fbc
  if (input.fbp) userData['fbp'] = input.fbp
  if (input.clientUserAgent) userData['client_user_agent'] = input.clientUserAgent
  if (input.clientIpAddress) userData['client_ip_address'] = input.clientIpAddress

  const customData: Record<string, unknown> = {}
  if (typeof input.value === 'number') customData['value'] = input.value
  if (input.currency) customData['currency'] = input.currency
  if (input.contentName) customData['content_name'] = input.contentName
  if (input.contentCategory) customData['content_category'] = input.contentCategory

  const body = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: 'website',
        user_data: userData,
        custom_data: customData,
      },
    ],
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )
    if (!res.ok) {
      const text = await res.text()
      console.error('[CAPI] Meta rejected event', res.status, text.slice(0, 500))
      return { ok: false as const, status: res.status }
    }
    return { ok: true as const }
  } catch (err) {
    console.error('[CAPI] request failed', err)
    return { ok: false as const, status: 0 }
  }
}
