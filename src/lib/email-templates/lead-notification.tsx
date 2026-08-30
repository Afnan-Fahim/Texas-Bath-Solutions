import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface LeadNotificationProps {
  name?: string
  phone?: string
  email?: string
  address?: string
  timeframe?: string
  notes?: string
  source?: string
  submittedAt?: string
}

const row = { margin: '0 0 10px', fontSize: '15px', color: '#12263F' } as const

function LeadNotification({
  name = 'Unknown',
  phone = '—',
  email = '—',
  address = '—',
  timeframe = '—',
  notes = '',
  source = 'Website booking form',
  submittedAt = '',
}: LeadNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>{`New lead: ${name} — ${timeframe}`}</Preview>
      <Body style={{ backgroundColor: '#F4F6F8', fontFamily: 'Helvetica, Arial, sans-serif', margin: 0, padding: '24px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '28px', maxWidth: '560px' }}>
          <Heading style={{ color: '#0D3B66', fontSize: '22px', margin: '0 0 4px' }}>
            New Estimate Request
          </Heading>
          <Text style={{ color: '#5A6B7B', fontSize: '13px', margin: '0 0 20px' }}>
            {source}
            {submittedAt ? ` • ${submittedAt}` : ''}
          </Text>
          <Hr style={{ borderColor: '#E4E9EF', margin: '0 0 20px' }} />
          <Section>
            <Text style={row}><strong>Name:</strong> {name}</Text>
            <Text style={row}><strong>Phone:</strong> {phone}</Text>
            <Text style={row}><strong>Email:</strong> {email}</Text>
            <Text style={row}><strong>Address:</strong> {address}</Text>
            <Text style={row}><strong>Timeframe:</strong> {timeframe}</Text>
            {notes ? <Text style={row}><strong>Notes:</strong> {notes}</Text> : null}
          </Section>
          <Hr style={{ borderColor: '#E4E9EF', margin: '20px 0' }} />
          <Text style={{ color: '#5A6B7B', fontSize: '13px', margin: 0 }}>
            Texas Bath Solutions — Trusted Shower Experts
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: LeadNotification,
  displayName: 'Lead Notification',
  subject: (data: Record<string, any>) =>
    `New estimate request — ${data?.['name'] ?? 'Website lead'}`,
  previewData: {
    name: 'Jane Smith',
    phone: '(210) 555-0123',
    email: 'jane@example.com',
    address: '123 Main St, San Antonio, TX',
    timeframe: 'Within One Month',
    notes: 'Old fiberglass tub, want a walk-in shower.',
    source: 'Website booking form',
    submittedAt: 'Aug 25, 2026 3:12 PM',
  },
} satisfies TemplateEntry
