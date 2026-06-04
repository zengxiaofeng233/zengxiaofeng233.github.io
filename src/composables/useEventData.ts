import { computed, ref } from 'vue'
import type { CommunityItem, EventItem } from '../types'

export function useEventData() {
  const events = ref<EventItem[]>([])
  const communities = ref<CommunityItem[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null

    try {
      const baseUrl = import.meta.env.BASE_URL
      const [eventsResponse, communitiesResponse] = await Promise.all([
        fetch(`${baseUrl}data/events.json`),
        fetch(`${baseUrl}data/communities.json`)
      ])

      if (!eventsResponse.ok || !communitiesResponse.ok) {
        throw new Error('本地 JSON 数据读取失败')
      }

      events.value = await eventsResponse.json()
      communities.value = await communitiesResponse.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知数据错误'
    } finally {
      loading.value = false
    }
  }

  const communityById = computed(() => {
    return new Map(communities.value.map((community) => [community.id, community]))
  })

  return {
    events,
    communities,
    communityById,
    loading,
    error,
    load
  }
}
