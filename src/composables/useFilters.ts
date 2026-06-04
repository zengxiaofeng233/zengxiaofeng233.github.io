import { computed, ref, type Ref } from 'vue'
import type { CommunityItem, EventItem, RegionFilter, TypeFilter } from '../types'

export function useFilters(events: Ref<EventItem[]>, communities: Ref<CommunityItem[]>) {
  const searchQuery = ref('')
  const regionFilter = ref<RegionFilter>('all')
  const typeFilter = ref<TypeFilter>('all')

  const communityById = computed(() => {
    return new Map(communities.value.map((community) => [community.id, community]))
  })

  const filteredEvents = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return events.value.filter((event) => {
      const relatedCommunities = event.relatedCommunityIds
        .map((id) => communityById.value.get(id))
        .filter((community): community is CommunityItem => Boolean(community))

      const regionMatches = regionFilter.value === 'all' || event.region === regionFilter.value
      const typeMatches =
        typeFilter.value === 'all' ||
        (typeFilter.value === 'event' && event.title.toLowerCase().includes('only')) ||
        (typeFilter.value === 'community' && relatedCommunities.some((community) => community.type === '同好会')) ||
        (typeFilter.value === 'temporary' && relatedCommunities.some((community) => community.type === '临时群'))

      const searchable = [
        event.title,
        event.province,
        event.city,
        event.venue,
        event.source,
        ...relatedCommunities.flatMap((community) => [
          community.name,
          community.contactValue,
          community.description
        ])
      ]
        .join(' ')
        .toLowerCase()

      const searchMatches = query.length === 0 || searchable.includes(query)

      return regionMatches && typeMatches && searchMatches
    }).sort((a, b) => b.startDate.localeCompare(a.startDate) || b.endDate.localeCompare(a.endDate))
  })

  function resetFilters() {
    searchQuery.value = ''
    regionFilter.value = 'all'
    typeFilter.value = 'all'
  }

  return {
    searchQuery,
    regionFilter,
    typeFilter,
    filteredEvents,
    resetFilters
  }
}
