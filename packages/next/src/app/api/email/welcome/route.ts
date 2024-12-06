import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import WelcomeEmail from '@/lib/email/emails/welcome'
import { render } from '@react-email/components'
import React from 'react'

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!)

    const { to, name } = await req.json()
    const html = await render(React.createElement(WelcomeEmail, { name }))

    const data = await resend.emails.send({
      from: 'Kyle Jeong - CEO of Graham <kyle@usegraham.com>',
      to: [to],
      subject: 'Welcome to Graham',
      html,
      headers: {
        'Reply-To': 'kyle@usegraham.com',
        
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}
