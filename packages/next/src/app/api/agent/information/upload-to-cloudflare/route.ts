import { NextResponse } from 'next/server'
import { prisma } from '@graham/db'
import { v4 as uuidv4 } from 'uuid'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const agentId = formData.get('agentId') as string
    const userId = formData.get('userId') as string

    if (!file || !agentId || !userId) {
      console.error('Validation error: File, agentId, and userId are required')
      return NextResponse.json(
        { error: 'File, agentId, and userId are required' },
        { status: 400 }
      )
    }

    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${uuidv4()}.${fileExtension}`
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      const command = new PutObjectCommand({
        Bucket: 'graham-documents',
        Key: uniqueFilename,
        Body: buffer,
        ContentType: file.type,
      })
      
      const result = await S3.send(command)
      console.log('S3 upload result:', result)
    } catch (error: any) {
      console.error('Detailed S3 upload error:', {
        error,
        message: error.message,
        code: error.code,
        requestId: error.$metadata?.requestId
      })
      throw error
    }

    const document = await prisma.businessDocument.create({
      data: {
        userId,
        agentId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        indexPath: uniqueFilename,
      },
    })

    return NextResponse.json({ success: true, document })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}
