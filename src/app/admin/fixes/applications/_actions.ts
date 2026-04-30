'use server'

import prisma from '@/lib/prismadb'
import { checkAdminAccess } from '@/utils/roles'
import { currentUser } from '@clerk/nextjs/server'
import { sendNotificationEmail } from '@/lib/send-notification-email'
import {
  buildNotificationEmailData as buildEmailConfig,
  getNotificationEmailSubject,
} from '@/lib/notification-email-config'
import { generateEmailTemplateHtml } from '@/lib/email-template-html'

const HOST_APPLICATION_ACTION_TYPE = 'view'

export interface ApplicationFixContext {
  housingRequestId: string
  status: string
  createdAt: string
  listingId: string
  listingTitle: string
  listingUrl: string
  hostUserId: string
  hostEmail: string | null
  hostFirstName: string | null
  renterFullName: string
  renterEmail: string | null
  dateRange: string
  subject: string
}

export interface ApplicationFixListItem {
  housingRequestId: string
  createdAt: string
  status: string
  listingTitle: string
  hostEmail: string | null
  renterEmail: string | null
  renterName: string
}

export async function listRecentHousingRequests(limit = 100): Promise<{
  success: boolean
  error?: string
  items?: ApplicationFixListItem[]
}> {
  try {
    const isAdmin = await checkAdminAccess()
    if (!isAdmin) return { success: false, error: 'Unauthorized - Admin access required' }

    const safeLimit = Math.min(Math.max(limit, 1), 500)
    const rows = await prisma.housingRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
      select: {
        id: true,
        status: true,
        createdAt: true,
        listing: {
          select: {
            title: true,
            user: { select: { email: true } },
          },
        },
        user: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
    })

    const items: ApplicationFixListItem[] = rows.map((row) => {
      const fn = row.user.firstName ?? ''
      const ln = row.user.lastName ?? ''
      const renterName = `${fn} ${ln}`.trim() || row.user.email || 'Unknown renter'
      return {
        housingRequestId: row.id,
        createdAt: row.createdAt.toISOString(),
        status: row.status,
        listingTitle: row.listing.title,
        hostEmail: row.listing.user?.email ?? null,
        renterEmail: row.user.email ?? null,
        renterName,
      }
    })

    return { success: true, items }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load list'
    console.error('listRecentHousingRequests error:', error)
    return { success: false, error: message }
  }
}

interface BuildResult {
  context: ApplicationFixContext
  emailData: ReturnType<typeof buildEmailConfig>
}

async function loadApplicationFixContext(housingRequestId: string): Promise<BuildResult> {
  const housingRequest = await prisma.housingRequest.findUnique({
    where: { id: housingRequestId },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      listing: {
        select: {
          id: true,
          title: true,
          userId: true,
          user: { select: { id: true, email: true, firstName: true } },
        },
      },
    },
  })

  if (!housingRequest) {
    throw new Error('HousingRequest not found')
  }

  const renter = housingRequest.user
  const host = housingRequest.listing.user
  const listing = housingRequest.listing

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  const dateRange = `${formatDate(housingRequest.startDate)} - ${formatDate(housingRequest.endDate)}`

  let renterName = ''
  if (renter.firstName) renterName += `${renter.firstName} `
  if (renter.lastName) renterName += renter.lastName
  if (!renterName.trim()) renterName = renter.email ?? 'A renter'
  renterName = renterName.trim()
  if (renterName.length > 28) renterName = `${renterName.slice(0, 25)}...`

  const url = `/app/host/${listing.id}/applications`
  const content = `New application to ${listing.title} for ${dateRange}`

  const additionalData = {
    renterName,
    listingTitle: listing.title,
    dateRange,
  }

  const emailData = buildEmailConfig(
    HOST_APPLICATION_ACTION_TYPE,
    { content, url },
    { firstName: host?.firstName ?? null },
    additionalData,
  )

  const subject = getNotificationEmailSubject(HOST_APPLICATION_ACTION_TYPE, additionalData)

  const context: ApplicationFixContext = {
    housingRequestId: housingRequest.id,
    status: housingRequest.status,
    createdAt: housingRequest.createdAt.toISOString(),
    listingId: listing.id,
    listingTitle: listing.title,
    listingUrl: url,
    hostUserId: host?.id ?? listing.userId,
    hostEmail: host?.email ?? null,
    hostFirstName: host?.firstName ?? null,
    renterFullName: renterName,
    renterEmail: renter.email ?? null,
    dateRange,
    subject,
  }

  return { context, emailData }
}

export async function findApplicationForFix(housingRequestId: string): Promise<{
  success: boolean
  error?: string
  context?: ApplicationFixContext
}> {
  try {
    const isAdmin = await checkAdminAccess()
    if (!isAdmin) return { success: false, error: 'Unauthorized - Admin access required' }

    const id = housingRequestId.trim()
    if (!id) return { success: false, error: 'HousingRequest ID is required' }

    const { context } = await loadApplicationFixContext(id)
    return { success: true, context }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load application'
    console.error('findApplicationForFix error:', error)
    return { success: false, error: message }
  }
}

export async function previewApplicationReceivedEmail(housingRequestId: string): Promise<{
  success: boolean
  error?: string
  subject?: string
  html?: string
  context?: ApplicationFixContext
}> {
  try {
    const isAdmin = await checkAdminAccess()
    if (!isAdmin) return { success: false, error: 'Unauthorized - Admin access required' }

    const { context, emailData } = await loadApplicationFixContext(housingRequestId.trim())
    const html = generateEmailTemplateHtml(emailData as any)
    return { success: true, subject: context.subject, html, context }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to render preview'
    console.error('previewApplicationReceivedEmail error:', error)
    return { success: false, error: message }
  }
}

export async function sendApplicationReceivedEmail(
  housingRequestId: string,
  target: 'admin' | 'host',
): Promise<{ success: boolean; error?: string; sentTo?: string; emailId?: string }> {
  try {
    const isAdmin = await checkAdminAccess()
    if (!isAdmin) return { success: false, error: 'Unauthorized - Admin access required' }

    const { context, emailData } = await loadApplicationFixContext(housingRequestId.trim())

    let to: string | null = null
    if (target === 'host') {
      to = context.hostEmail
      if (!to) return { success: false, error: 'Host has no email on file' }
    } else {
      const admin = await currentUser()
      to = admin?.emailAddresses?.[0]?.emailAddress ?? null
      if (!to) return { success: false, error: 'Could not resolve current admin email' }
    }

    const result = await sendNotificationEmail({
      to,
      subject: context.subject,
      emailData: emailData as any,
    })

    if (!result.success) {
      return { success: false, error: result.error ?? 'Email send failed' }
    }
    return { success: true, sentTo: to, emailId: result.emailId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email'
    console.error('sendApplicationReceivedEmail error:', error)
    return { success: false, error: message }
  }
}
