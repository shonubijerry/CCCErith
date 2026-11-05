'use server'

import { getCloudflareContext } from '@opennextjs/cloudflare'

import { sendViaCloudflare, type EmailBinding } from '@/lib/cloudflareEmail'
import { getPayloadClient, getSiteSettings } from '@/lib/payload'

export type ContactState = { ok: boolean; message: string } | null

const clean = (v: FormDataEntryValue | null, max: number) => String(v ?? '').trim().slice(0, max)
const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

async function getEnv() {
  try {
    return (await getCloudflareContext({ async: true })).env as unknown as { EMAIL?: EmailBinding; TURNSTILE_SECRET_KEY?: string }
  } catch {
    return {} as { EMAIL?: EmailBinding; TURNSTILE_SECRET_KEY?: string }
  }
}

async function verifyTurnstile(token: string, secret?: string) {
  if (!secret) return true // not configured (local development)
  if (!token) return false
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token }),
  })
  const data = (await res.json()) as { success?: boolean }
  return Boolean(data.success)
}

export async function sendContactMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  // Honeypot: real people never fill this hidden field.
  if (clean(form.get('company'), 100)) return { ok: true, message: 'Thank you — your message has been sent.' }

  const name = clean(form.get('name'), 120)
  const email = clean(form.get('email'), 200)
  const phone = clean(form.get('phone'), 40)
  const subject = clean(form.get('subject'), 160)
  const message = clean(form.get('message'), 5000)

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: 'Please enter your name, a valid email address and a message.' }
  }

  const env = await getEnv()
  const human = await verifyTurnstile(clean(form.get('cf-turnstile-response'), 4096), env.TURNSTILE_SECRET_KEY)
  if (!human) return { ok: false, message: 'We could not verify you are human. Please try again.' }

  const payload = await getPayloadClient()
  const settings = await getSiteSettings()

  let emailed = false
  try {
    emailed = await sendViaCloudflare(env.EMAIL, {
      to: settings.email,
      replyTo: email,
      subject: `Website message${subject ? `: ${subject}` : ''} — ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\nSubject: ${subject || '-'}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${escape(name)}<br><strong>Email:</strong> ${escape(email)}<br><strong>Phone:</strong> ${escape(phone || '-')}<br><strong>Subject:</strong> ${escape(subject || '-')}</p><p style="white-space:pre-wrap">${escape(message)}</p>`,
    })
  } catch (err) {
    payload.logger.error({ err, msg: 'Contact email failed' })
  }

  try {
    await payload.create({
      collection: 'contact-messages',
      overrideAccess: true,
      data: { name, email, phone, subject, message, emailed },
    })
  } catch (err) {
    payload.logger.error({ err, msg: 'Saving contact message failed' })
    if (!emailed) return { ok: false, message: `Sorry, something went wrong. Please email us at ${settings.email}.` }
  }

  return { ok: true, message: 'Thank you — your message has been sent. We will get back to you soon.' }
}
