import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ApplicationsFixClient from './applications-fix-client'
import { listRecentHousingRequests } from './_actions'

export const dynamic = 'force-dynamic'

export default async function ApplicationsFixPage() {
  const initial = await listRecentHousingRequests(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Application Email Fixes</h1>
        <p className="text-muted-foreground">
          Resend the &quot;application received&quot; email to a host for a specific HousingRequest.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resend Host Application Email</CardTitle>
          <CardDescription>
            Pick a recent HousingRequest from the list (newest first), or paste an ID. Then preview
            the email and send to yourself or the host.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationsFixClient
            initialItems={initial.success ? initial.items ?? [] : []}
            initialError={initial.success ? null : initial.error ?? 'Failed to load'}
          />
        </CardContent>
      </Card>
    </div>
  )
}
