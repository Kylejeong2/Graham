import Mailjet from 'node-mailjet';

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY
});

if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
  throw new Error('MAILJET_API_KEY and MAILJET_SECRET_KEY must be set');
}

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailParams): Promise<void> {
  try {
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER_EMAIL,
            Name: process.env.MAILJET_SENDER_NAME
          },
          To: [{ Email: to }],
          Subject: subject,
          TextPart: text,
          HTMLPart: html
        }
      ]
    });

    console.log('Email sent successfully:', result.body);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}
