"use client"

import { ActivationForm } from "@/components/activation/ActivationForm"

export default function ActivationPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Activation Codes</h1>
        <p className="text-muted-foreground">
          Generate and manage activation codes for users.
        </p>
      </div>
      
      <div className="max-w-2xl">
        <ActivationForm />
      </div>
    </div>
  )
}
