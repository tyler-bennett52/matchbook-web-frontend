export interface FixNavItem {
  title: string
  description: string
  href: string
}

export const FIXES_NAV: FixNavItem[] = [
  {
    title: 'Applications',
    description:
      'Resend the "application received" email to a host for a specific HousingRequest.',
    href: '/admin/fixes/applications',
  },
]
