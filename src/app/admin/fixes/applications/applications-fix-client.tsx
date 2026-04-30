'use client'

import React, { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import {
  findApplicationForFix,
  previewApplicationReceivedEmail,
  sendApplicationReceivedEmail,
  listRecentHousingRequests,
  type ApplicationFixContext,
  type ApplicationFixListItem,
} from './_actions'

interface Props {
  initialItems: ApplicationFixListItem[]
  initialError: string | null
}

export default function ApplicationsFixClient({ initialItems, initialError }: Props) {
  const { toast } = useToast()
  const [items, setItems] = useState<ApplicationFixListItem[]>(initialItems)
  const [housingRequestId, setHousingRequestId] = useState('')
  const [context, setContext] = useState<ApplicationFixContext | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [isLooking, startLookup] = useTransition()
  const [isPending, startAction] = useTransition()
  const [isRefreshing, startRefresh] = useTransition()

  React.useEffect(() => {
    if (initialError) {
      toast({ title: 'Could not load list', description: initialError, variant: 'destructive' })
    }
    // Run only on mount with initialError
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runLookup = (id: string) => {
    setHousingRequestId(id)
    startLookup(async () => {
      setContext(null)
      setPreviewHtml(null)
      const result = await findApplicationForFix(id)
      if (!result.success || !result.context) {
        toast({
          title: 'Lookup failed',
          description: result.error ?? 'Unknown error',
          variant: 'destructive',
        })
        return
      }
      setContext(result.context)
    })
  }

  const handleLookupClick = () => {
    if (!housingRequestId.trim()) return
    runLookup(housingRequestId.trim())
  }

  const handleRefreshList = () => {
    startRefresh(async () => {
      const result = await listRecentHousingRequests(100)
      if (!result.success || !result.items) {
        toast({
          title: 'Refresh failed',
          description: result.error ?? 'Unknown error',
          variant: 'destructive',
        })
        return
      }
      setItems(result.items)
    })
  }

  const handlePreview = () => {
    if (!context) return
    startAction(async () => {
      const result = await previewApplicationReceivedEmail(context.housingRequestId)
      if (!result.success || !result.html) {
        toast({
          title: 'Preview failed',
          description: result.error ?? 'Unknown error',
          variant: 'destructive',
        })
        return
      }
      setPreviewHtml(result.html)
    })
  }

  const handleSend = (target: 'admin' | 'host') => {
    if (!context) return
    if (target === 'host' && !context.hostEmail) {
      toast({
        title: 'Cannot send',
        description: 'Host has no email on file.',
        variant: 'destructive',
      })
      return
    }
    const targetLabel = target === 'admin' ? 'yourself' : `the host (${context.hostEmail})`
    if (!window.confirm(`Send the application-received email to ${targetLabel}?`)) return

    startAction(async () => {
      const result = await sendApplicationReceivedEmail(context.housingRequestId, target)
      if (!result.success) {
        toast({
          title: 'Send failed',
          description: result.error ?? 'Unknown error',
          variant: 'destructive',
        })
        return
      }
      toast({
        title: 'Email sent',
        description: `Sent to ${result.sentTo}${result.emailId ? ` (id: ${result.emailId})` : ''}`,
      })
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Recent HousingRequests (newest first, max 100)</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshList}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        <div className="max-h-[420px] overflow-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">Created</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Listing</th>
                <th className="px-3 py-2 font-medium">Renter</th>
                <th className="px-3 py-2 font-medium">Host email</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    No housing requests found.
                  </td>
                </tr>
              )}
              {items.map((item) => {
                const isSelected = context?.housingRequestId === item.housingRequestId
                return (
                  <tr
                    key={item.housingRequestId}
                    className={`border-b last:border-b-0 hover:bg-muted/50 ${
                      isSelected ? 'bg-muted/70' : ''
                    }`}
                  >
                    <td className="px-3 py-2 align-top whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 align-top">{item.status}</td>
                    <td className="px-3 py-2 align-top">{item.listingTitle}</td>
                    <td className="px-3 py-2 align-top">
                      <div>{item.renterName}</div>
                      {item.renterEmail && (
                        <div className="text-xs text-muted-foreground">{item.renterEmail}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top text-xs">
                      {item.hostEmail ?? <span className="text-destructive">none</span>}
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      <Button
                        size="sm"
                        variant={isSelected ? 'secondary' : 'outline'}
                        disabled={isLooking}
                        onClick={() => runLookup(item.housingRequestId)}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <div className="flex-1">
          <Label htmlFor="housingRequestId">...or paste a HousingRequest ID</Label>
          <Input
            id="housingRequestId"
            value={housingRequestId}
            onChange={(e) => setHousingRequestId(e.target.value)}
            placeholder="e.g. 6e1a0a1c-..."
            disabled={isLooking || isPending}
          />
        </div>
        <Button onClick={handleLookupClick} disabled={isLooking || !housingRequestId.trim()}>
          {isLooking ? 'Looking up...' : 'Look up'}
        </Button>
      </div>

      {context && (
        <>
          <Separator />
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <Detail label="HousingRequest ID" value={context.housingRequestId} />
            <Detail label="Status" value={context.status} />
            <Detail label="Listing" value={context.listingTitle} />
            <Detail label="Date range" value={context.dateRange} />
            <Detail label="Created" value={new Date(context.createdAt).toLocaleString()} />
            <Detail
              label="Host"
              value={`${context.hostFirstName ?? '(no name)'} <${context.hostEmail ?? 'no email'}>`}
            />
            <Detail
              label="Renter"
              value={`${context.renterFullName} <${context.renterEmail ?? 'no email'}>`}
            />
            <Detail label="Subject" value={context.subject} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handlePreview} disabled={isPending}>
              Preview
            </Button>
            <Button onClick={() => handleSend('admin')} disabled={isPending}>
              Send to admin (me)
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleSend('host')}
              disabled={isPending || !context.hostEmail}
            >
              Send to host
            </Button>
          </div>

          {previewHtml && (
            <div className="rounded-md border">
              <div className="border-b px-3 py-2 text-xs text-muted-foreground">
                Email preview — Subject: <span className="font-medium">{context.subject}</span>
              </div>
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                className="h-[600px] w-full"
                sandbox=""
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="break-all">{value}</div>
    </div>
  )
}
