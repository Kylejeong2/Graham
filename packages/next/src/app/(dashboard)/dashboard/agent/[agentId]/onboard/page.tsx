"use client"

import { Onboard } from '@/components/Agent/onboard/Onboard'
import { useParams } from 'next/navigation'

export default function OnboardPage() {
  const params = useParams()
  const agentId = params.id as string

  return <Onboard agentId={agentId} />
}