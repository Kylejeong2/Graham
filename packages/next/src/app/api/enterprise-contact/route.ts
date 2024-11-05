import { NextResponse } from 'next/server'
import { prisma } from '@graham/db'
import { WebClient } from '@slack/web-api'

const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'company', 'inquiryType', 'message']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Save to database
    const contact = await prisma.enterpriseContact.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.company,
        phoneNumber: data.phoneNumber || null,
        inquiryType: data.inquiryType,
        message: data.message
      }
    })

    // Send to Slack

    if(!contact){
        return NextResponse.json(
            { error: 'Internal server error, No contact created' },
            { status: 500 }
        )
    }

    await slack.chat.postMessage({
      channel: process.env.SLACK_ENTERPRISE_NOTIFICATIONS_CHANNEL!,
      text: 'New Enterprise Contact Form Submission',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*New Enterprise Contact Form Submission*'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Name:*\n${data.name}`
            },
            {
              type: 'mrkdwn', 
              text: `*Company:*\n${data.company}`
            },
            {
              type: 'mrkdwn',
              text: `*Email:*\n${data.email}`
            },
            {
              type: 'mrkdwn',
              text: `*Phone:*\n${data.phoneNumber || 'N/A'}`
            },
            {
              type: 'mrkdwn',
              text: `*Inquiry Type:*\n${data.inquiryType}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Message:*\n${data.message}`
          }
        }
      ]
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}