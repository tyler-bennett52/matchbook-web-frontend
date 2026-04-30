import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FIXES_NAV } from './_fixes-nav'

export const dynamic = 'force-dynamic'

export default function FixesIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fixes</h1>
        <p className="text-muted-foreground">
          One-off admin tools for repairing data or resending notifications when something
          went wrong in production.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {FIXES_NAV.map((item) => (
          <Link key={item.href} href={item.href} className="block focus:outline-none">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-muted-foreground">{item.href}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
