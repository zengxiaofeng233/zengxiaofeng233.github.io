export type Region = 'mainland' | 'hmt' | 'overseas'
export type EventStatus = 'upcoming' | 'ongoing' | 'ended' | 'draft'
export type CommunityStatus = 'verified' | 'pending' | 'expired'
export type CommunityType = '同好会' | '临时群'
export type ContactType = 'QQ群'

export interface EventItem {
  id: string
  title: string
  region: Region
  province: string
  city: string
  venue: string
  lat: number
  lng: number
  startDate: string
  endDate: string
  edition: number
  wantToGoCount: number
  coverUrl: string
  description: string
  source: string
  sourceUrl: string
  status: EventStatus
  relatedCommunityIds: string[]
}

export interface CommunityItem {
  id: string
  name: string
  region: Region
  province: string
  city: string
  type: CommunityType
  contactType: ContactType
  contactValue: string
  memberCount: number
  status: CommunityStatus
  lastVerifiedAt: string
  description: string
}

export interface MapPoint {
  id: string
  name: string
  city: string
  region: Region
  lat: number
  lng: number
  events: EventItem[]
}

export type RegionFilter = 'all' | Region
export type TypeFilter = 'all' | 'event' | 'community' | 'temporary'
