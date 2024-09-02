"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'

type Props = {
    agentId: string
}

const DeleteButton = ({agentId}: Props) => {
    const router = useRouter()
    const deleteAgent = useMutation({
      mutationFn: async () => {
        const response = await axios.post('/api/deleteAgent', {
            agentId
        })
        return response.data
      }  
    })
  return (
    <Button variant={'destructive'} size="sm" disabled={deleteAgent.isPending} onClick={() => {
        const confirm = window.confirm("Are you sure you want to delete this agent?");
        if (!confirm) return
        deleteAgent.mutate(undefined, {
            onSuccess: () => {
                router.push('/dashboard')
            },
            onError: (err) => {
                console.error(err)
            }
        });
    }}>
        <Trash />
    </Button>
  )
}

export default DeleteButton