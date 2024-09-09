"use client"
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"

type Props = {
    agentId: string
}

const DeleteButton = ({agentId}: Props) => {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [deletePhoneNumber, setDeletePhoneNumber] = useState(false)

    const deleteAgent = useMutation({
      mutationFn: async () => {
        const response = await axios.post('/api/agent/deleteAgent', {
            agentId,
            deletePhoneNumber
        })
        return response.data
      }  
    })

    const handleDelete = () => {
        deleteAgent.mutate(undefined, {
            onSuccess: () => {
                router.push('/dashboard')
            },
            onError: (err) => {
                console.error(err)
            }
        })
        setIsOpen(false)
    }

  return (
    <>
      <Button variant={'destructive'} size="sm" disabled={deleteAgent.isPending} onClick={() => setIsOpen(true)}>
          <Trash />
      </Button>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-[#F5E6D3] text-[#5D4037] p-8 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-bold text-[#8B4513]">Are you sure you want to delete this agent?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#795548] mt-2">
              This action cannot be undone. This will permanently delete the agent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="deletePhoneNumber"
              checked={deletePhoneNumber}
              onCheckedChange={(checked) => setDeletePhoneNumber(checked as boolean)}
              className="border-[#8B4513]"
            />
            <label
              htmlFor="deletePhoneNumber"
              className="text-sm font-medium leading-none text-[#5D4037] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Delete associated phone number and cancel that number's subscription
            </label>
          </div>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-[#E6CCB2] text-[#8B4513] hover:bg-[#D7B899]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-[#8B4513] hover:bg-[#A0522D] text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default DeleteButton