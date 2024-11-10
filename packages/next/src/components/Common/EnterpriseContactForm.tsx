'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'react-toastify'
import { Building2, Mail, Phone, Send } from 'lucide-react'

export const EnterpriseContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phoneNumber: '',
    inquiryType: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, inquiryType: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/enterprise-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Something went wrong')
      }

      toast.success('Your inquiry has been submitted successfully!')
      setFormData({
        name: '',
        email: '',
        company: '',
        phoneNumber: '',
        inquiryType: '',
        message: ''
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto bg-white shadow-lg">
        <CardHeader className="text-center border-b border-gray-200 pb-8">
          <div className="flex justify-center mb-4">
            <Building2 className="w-16 h-16 text-orange-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-black">
            Contact Us for Enterprise Inquiries
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Let's discuss how Graham can transform your business communications
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 text-gray-900"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 text-gray-900"
                  required
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company Name</label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 text-gray-900"
                  required
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  placeholder="123-456-7890"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 text-gray-900"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700">Inquiry Type</label>
              <Select onValueChange={handleSelectChange} value={formData.inquiryType}>
                <SelectTrigger className="w-full mt-1 border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select inquiry type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Inquiry</SelectItem>
                  <SelectItem value="demo">Request a Demo</SelectItem>
                  <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 text-gray-900"
                rows={4}
                required
              />
            </div>
            <div>
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Send className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
              </Button>
            </div>
          </form>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
            <div className="space-y-2">
              <p className="flex items-center text-gray-600">
                <Mail className="mr-2 h-5 w-5" />
                enterprise@graham.ai
              </p>
              <p className="flex items-center text-gray-600">
                <Phone className="mr-2 h-5 w-5" />
                +1 (555) 123-4567
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}