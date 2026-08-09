import type { LocalizedList, LocalizedString } from '../lib/localized'
import type { ContentBlock } from './newsTypes'

export type ProjectType = 'condo' | 'sfh' | 'townhouse' | 'office' | 'mixed'
export type ProjectStatus = 'completed' | 'in-progress' | 'acquired' | 'sold'

export interface Project {
  id: string
  slug: string
  name: LocalizedString
  city: LocalizedString
  type: ProjectType
  status: ProjectStatus
  units: number | null
  buildings: number | null
  saleValueM: number | null
  acquisitionPriceM: number | null
  year: number
  lat: number
  lng: number
  summary: LocalizedString
  /** @deprecated Prefer blocks; kept for legacy Markdown fallback */
  body?: LocalizedString
  bodyFont?: 'body' | 'display' | 'serif' | 'sans-sc' | 'serif-sc'
  /** Modular body like news: text / image / gallery */
  blocks?: ContentBlock[]
  highlights: LocalizedList
  /** Cover image — always images[0] */
  image: string
  /** All project photos; index 0 is the cover used across the site */
  images: string[]
  /** Optional URL opened from the link control next to the project name */
  link?: string
  relatedEntity?: string
  featured?: boolean
}

export const typeLabels: Record<ProjectType, string> = {
  condo: 'Condo',
  sfh: 'Single-Family',
  townhouse: 'Townhouse',
  office: 'Office',
  mixed: 'Mixed Residential',
}

export const statusLabels: Record<ProjectStatus, string> = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  acquired: 'Acquired',
  sold: 'Sold',
}

export const company = {
  name: 'Global Land LLC',
  shortName: 'Global Land',
  founded: 2018,
  founder: 'Ms. Lili Lu',
  focus:
    'Development of low-density residential properties and investment in high-quality commercial real estate.',
  vision:
    'To uphold a long-term approach to the industry, earning recognition through professionalism and integrity; to create market-leading projects; and to make a positive contribution to the communities we serve.',
  aboutTeam:
    'Our team, including some who previously worked with Create World Real Estate Inc., a real estate development firm specializing in condo development since 2014, has a strong track record. Under Ms. Lu’s leadership as the former CEO of Create World Real Estate Inc., the team successfully completed several high-profile projects.',
  community:
    'Beyond business successes, Ms. Lu is deeply committed to community service. She currently presides over the Chinese Chamber of Commerce in Washington State (CCCWA), a non-profit dedicated to fostering trade and investment between Washington and China. CCCWA members span industries from finance to healthcare.',
  officeReturns:
    'Both Class A office properties are secured by long-term leases with premier tenants, generating strong cash-on-cash returns during the holding period, with significant potential for appreciation and attractive exit premiums upon disposition.',
  addressLine1: '325 118th Ave SE, Suite 101',
  addressLine2: 'Bellevue, WA 98005',
  phone: '(425) 829-5658',
  phoneTel: '+14258295658',
  email: 'info@ccc-wa.org',
  officeHours: 'Monday – Friday: 9:00 AM – 5:00 PM',
  /** Approximate office coordinates for map pin */
  lat: 47.6019,
  lng: -122.1832,
}
