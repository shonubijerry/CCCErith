import type { EmailAdapter, SendEmailOptions } from 'payload'

/**
 * Cloudflare Email Service binding (wrangler: "send_email": [{ "name": "EMAIL" }]).
 * Sends to any address without touching the domain's MX records.
 */
export type EmailBinding = {
  send: (message: {
    to: string | string[]
    from: string | { email: string; name?: string }
    replyTo?: string
    subject: string
    html?: string
    text?: string
  }) => Promise<unknown>
}

export const FROM_ADDRESS = 'website@cccerithparish.co.uk'
export const FROM_NAME = 'CCC Erith Parish Website'

const asList = (v: SendEmailOptions['to']): string[] => {
  if (!v) return []
  const items = Array.isArray(v) ? v : [v]
  return items.map((i) => (typeof i === 'string' ? i : i.address))
}

export async function sendViaCloudflare(
  binding: EmailBinding | undefined,
  msg: { to: string | string[]; subject: string; html?: string; text?: string; replyTo?: string },
) {
  if (!binding?.send) {
    console.warn(JSON.stringify({ level: 'warn', msg: 'EMAIL binding missing; email not sent', subject: msg.subject }))
    return false
  }
  await binding.send({ from: { email: FROM_ADDRESS, name: FROM_NAME }, ...msg })
  return true
}

export const cloudflareEmailAdapter =
  (getBinding: () => EmailBinding | undefined): EmailAdapter =>
  () => ({
    name: 'cloudflare-email',
    defaultFromAddress: FROM_ADDRESS,
    defaultFromName: FROM_NAME,
    sendEmail: async (message) => {
      const to = asList(message.to)
      if (!to.length) return
      await sendViaCloudflare(getBinding(), {
        to,
        subject: message.subject ?? '',
        html: typeof message.html === 'string' ? message.html : undefined,
        text: typeof message.text === 'string' ? message.text : undefined,
      })
    },
  })
