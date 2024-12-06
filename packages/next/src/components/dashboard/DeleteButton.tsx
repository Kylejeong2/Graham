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

interface DeleteButtonProps {
  agentId: string
}

export default function DeleteButton({ agentId }: DeleteButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [deletePhoneNumber, setDeletePhoneNumber] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post('/api/agent/deleteAgent', {
        agentId,
        deletePhoneNumber
      })
      return data
    },
    onSuccess: () => {
      router.push('/dashboard')
    },
    onError: (error) => {
      console.error('Failed to delete agent:', error)
    }
  })

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm" 
        disabled={isPending}
        onClick={() => setIsOpen(true)}
      >
        <Trash className="h-4 w-4" />
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-semibold text-gray-900">
              Delete Agent
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 mt-2">
              Are you sure you want to delete this agent? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-center space-x-3 py-4">
            <Checkbox
              id="deletePhoneNumber"
              checked={deletePhoneNumber}
              onCheckedChange={(checked) => setDeletePhoneNumber(checked as boolean)}
              className="border-gray-300"
            />
            <label
              htmlFor="deletePhoneNumber"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Also delete associated phone number and cancel subscription
            </label>
          </div>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-white hover:bg-gray-100 text-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => mutate()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? 'Deleting...' : 'Delete Agent'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}