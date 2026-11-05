export type NavItem = { label: string; href: string; children?: { label: string; href: string }[] }

export const NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About',
    href: '/about-us',
    children: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Our Team', href: '/our-team' },
      { label: 'Community Service', href: '/community-service' },
      { label: 'Safeguarding', href: '/safeguarding-policy' },
    ],
  },
  { label: 'Ministries', href: '/ministries' },
  { label: 'Services & Events', href: '/events' },
  { label: 'Sermons', href: '/sermons' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
]
