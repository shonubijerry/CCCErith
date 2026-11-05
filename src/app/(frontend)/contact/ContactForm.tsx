'use client'

import Script from 'next/script'
import { useActionState, useEffect, useRef } from 'react'

import { Icon } from '@/components/site/Icon'

import { sendContactMessage, type ContactState } from './actions'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset()
      ;(window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={action} className="form">
      <div className="form__row">
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>
      <div className="form__row">
        <div className="field">
          <label htmlFor="phone">Phone (optional)</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="field">
          <label htmlFor="subject">Subject</label>
          <input id="subject" name="subject" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" required />
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      {SITE_KEY ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={SITE_KEY} data-theme="light" />
        </>
      ) : null}
      {state ? (
        <div className={`form__status form__status--${state.ok ? 'ok' : 'error'}`} role="status">
          {state.message}
        </div>
      ) : null}
      <div>
        <button className="btn btn--purple" type="submit" disabled={pending}>
          {pending ? 'Sending…' : 'Send message'} <Icon name="arrow" />
        </button>
      </div>
    </form>
  )
}
