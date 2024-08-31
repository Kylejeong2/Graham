"use client"
import React from 'react'
import { Button } from '@/components/Common/Button'
import { Trash } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'

type Props = {
    compadreId: string
}

const DeleteButton = ({compadreId}: Props) => {
    const router = useRouter()
    const deleteCompadre = useMutation({
      mutationFn: async () => {
        const response = await axios.post('/api/deleteCompadre', {
            compadreId
        })
        return response.data
      }  
    })
  return (
    <Button variant={'destructive'} size="sm" disabled={deleteCompadre.isPending} onClick={() => {
        const confirm = window.confirm("Are you sure you want to delete this compadre?");
        if (!confirm) return
        deleteCompadre.mutate(undefined, {
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