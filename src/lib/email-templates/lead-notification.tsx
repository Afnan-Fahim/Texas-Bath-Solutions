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

const row = { margin: '0 0 12px', fontSize: '15px', color: '#12263F', lineHeight: '1.5' } as const
const labelStyle = { color: '#5A6B7B', fontWeight: 'bold', display: 'inline-block', minWidth: '100px' } as const

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
  const isCalendlySource = name === 'Provided in Calendly';
  const displayName = isCalendlySource ? 'New Quiz Lead' : name;

  return (
    <Html>
      <Head />
      <Preview>{`New lead captured: ${phone} — ${timeframe}`}</Preview>
      <Body style={{ backgroundColor: '#F4F6F8', fontFamily: 'Helvetica, Arial, sans-serif', margin: 0, padding: '40px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '40px', maxWidth: '600px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <Heading style={{ color: '#0D3B66', fontSize: '24px', margin: '0 0 8px' }}>
            🎉 You have a new lead!
          </Heading>
          <Text style={{ color: '#5A6B7B', fontSize: '14px', margin: '0 0 24px' }}>
            Captured via <strong>{source}</strong>
            {submittedAt ? ` on ${submittedAt}` : ''}
          </Text>
          <Hr style={{ borderColor: '#E4E9EF', margin: '0 0 24px' }} />
          
          <Section style={{ backgroundColor: '#F8FAFC', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
            <Text style={{ ...row, fontSize: '18px', fontWeight: 'bold', color: '#0D3B66', marginTop: 0 }}>Contact Details</Text>
            
            {!isCalendlySource && (
              <Text style={row}><span style={labelStyle}>Name:</span> {name}</Text>
            )}
            
            <Text style={row}><span style={labelStyle}>Phone:</span> <a href={`tel:${phone}`} style={{ color: '#0D3B66', textDecoration: 'none', fontWeight: 'bold' }}>{phone}</a></Text>
            <Text style={row}><span style={labelStyle}>Address:</span> {address}</Text>
            
            {!isCalendlySource && (
              <Text style={row}><span style={labelStyle}>Email:</span> {email}</Text>
            )}
            
            {isCalendlySource && (
              <Text style={{ ...row, fontSize: '13px', color: '#5A6B7B', fontStyle: 'italic', marginTop: '16px' }}>
                * Note: The lead's Name and Email were captured directly into Calendly during the scheduling step.
              </Text>
            )}
          </Section>

          <Section style={{ backgroundColor: '#F8FAFC', padding: '24px', borderRadius: '12px' }}>
             <Text style={{ ...row, fontSize: '18px', fontWeight: 'bold', color: '#0D3B66', marginTop: 0 }}>Project Details</Text>
             <Text style={row}><span style={labelStyle}>Timeline:</span> {timeframe}</Text>
             
             {notes && (
               <div style={{ marginTop: '16px' }}>
                 <Text style={{ ...row, marginBottom: '8px' }}><span style={labelStyle}>Quiz Answers:</span></Text>
                 <Text style={{ ...row, whiteSpace: 'pre-line', paddingLeft: '16px', borderLeft: '3px solid #E4E9EF', color: '#334155' }}>
                   {notes}
                 </Text>
               </div>
             )}
          </Section>

          <Hr style={{ borderColor: '#E4E9EF', margin: '32px 0 24px' }} />
          <Text style={{ color: '#94A3B8', fontSize: '12px', margin: 0, textAlign: 'center' }}>
            Texas Bath Solutions • Automated Lead Notification System
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: LeadNotification,
  displayName: 'Lead Notification',
  subject: (data: Record<string, any>) => {
    const isQuiz = data?.['name'] === 'Provided in Calendly';
    if (isQuiz) {
      return `🎉 New Quiz Lead: ${data?.['phone'] ?? 'Action Required'}`;
    }
    return `🎉 New estimate request — ${data?.['name'] ?? 'Website lead'}`;
  },
  previewData: {
    name: 'Provided in Calendly',
    phone: '(210) 555-0123',
    email: 'calendly@provided.com',
    address: '123 Main St, San Antonio, TX',
    timeframe: 'Within One Month',
    notes: 'Homeowner: Yes\nUpgrade: Walk-in shower\nProblem: Hard to step over',
    source: 'Facebook/Messenger Quiz',
    submittedAt: 'Aug 25, 2026 3:12 PM',
  },
} satisfies TemplateEntry
