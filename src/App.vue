<template>
  <div class="app-shell">
    <AppHeader :github-url="githubUrl" :submit-url="submitCommunityUrl" />

    <main class="app-layout">
      <Sidebar
        :events="filteredEvents"
        :selected-event-id="selectedEvent?.id"
        :search-query="searchQuery"
        :region-filter="regionFilter"
        :type-filter="typeFilter"
        :submit-url="submitCommunityUrl"
        @select="selectEvent"
        @reset="resetFilters"
        @update:search-query="searchQuery = $event"
        @update:region-filter="regionFilter = $event"
        @update:type-filter="typeFilter = $event"
      />

      <section class="main-map-column">
        <div v-if="loading" class="loading-state">正在读取本地 JSON 数据...</div>
        <div v-else-if="error" class="loading-state error">{{ error }}</div>
        <MapView
          v-else
          :points="mapPoints"
          :selected-event-id="selectedEvent?.id"
          :baidu-map-ak="baiduMapAk"
          @select="selectEvent"
          @zoom-change="mapZoom = $event"
        />
      </section>

      <EventDetailPanel
        :event="selectedEvent"
        :related-communities="selectedCommunities"
        :report-url="reportUrl"
        :open="Boolean(selectedEvent)"
        @close="selectedEvent = null"
      />
    </main>

    <MobileBottomSheet
      :event="selectedEvent"
      :related-communities="selectedCommunities"
      :report-url="reportUrl"
      @close="selectedEvent = null"
    />

    <nav class="mobile-bottom-nav" aria-label="移动端导航">
      <a href="#map" class="active">地图</a>
      <a href="#communities">同好会</a>
      <a href="#events">漫展活动</a>
      <a :href="submitCommunityUrl" target="_blank" rel="noreferrer">投稿</a>
      <a href="#about">关于</a>
    </nav>

    <footer class="site-footer" id="about">
      <span>数据来源：B站会员购公开信息、同好会公开投稿信息</span>
      <span>地图服务：百度地图开放平台</span>
      <span>点位仅用于活动与同好会信息展示</span>
      <a :href="githubUrl" target="_blank" rel="noreferrer">GitHub 开源链接</a>
      <a :href="submitEventUrl" target="_blank" rel="noreferrer">投稿 / 纠错入口</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppHeader from './components/AppHeader.vue'
import EventDetailPanel from './components/EventDetailPanel.vue'
import MapView from './components/MapView.vue'
import MobileBottomSheet from './components/MobileBottomSheet.vue'
import Sidebar from './components/Sidebar.vue'
import { useEventData } from './composables/useEventData'
import { useFilters } from './composables/useFilters'
import type { CommunityItem, EventItem, MapPoint } from './types'

const githubUrl = 'https://github.com/zengxiaofeng233/zengxiaofeng233.github.io'
const issueBaseUrl = `${githubUrl}/issues/new`
const submitEventUrl = `${issueBaseUrl}?template=submit-event.yml`
const submitCommunityUrl = `${issueBaseUrl}?template=submit-community.yml`
const reportUrl = `${issueBaseUrl}?template=report-error.yml`
const baiduMapAk = 'AT2zbiPhYUfipYvjYMZH7AOAHFaiNpjc'

const { events, communities, communityById, loading, error, load } = useEventData()
const { searchQuery, regionFilter, typeFilter, filteredEvents, resetFilters } = useFilters(events, communities)

const selectedEvent = ref<EventItem | null>(null)
const mapZoom = ref(5)
const splitMarkerZoom = 10

const selectedCommunities = computed(() => {
  if (!selectedEvent.value) return []
  return selectedEvent.value.relatedCommunityIds
    .map((id) => communityById.value.get(id))
    .filter((community): community is CommunityItem => Boolean(community))
})

const mapPoints = computed<MapPoint[]>(() => {
  const grouped = new Map<string, EventItem[]>()
  const splitByVenue = mapZoom.value >= splitMarkerZoom

  for (const event of filteredEvents.value) {
    const key = splitByVenue
      ? `${event.region}-${event.city}-${event.venue}-${event.lat.toFixed(5)}-${event.lng.toFixed(5)}`
      : `${event.region}-${event.city}`
    const group = grouped.get(key) ?? []
    group.push(event)
    grouped.set(key, group)
  }

  return Array.from(grouped.entries()).map(([id, pointEvents]) => {
    const first = pointEvents[0]
    const lat = pointEvents.reduce((sum, event) => sum + event.lat, 0) / pointEvents.length
    const lng = pointEvents.reduce((sum, event) => sum + event.lng, 0) / pointEvents.length

    return {
      id,
      name: splitByVenue ? first.venue || first.title : first.city,
      city: first.city,
      region: first.region,
      lat,
      lng,
      events: [...pointEvents].sort((a, b) => a.startDate.localeCompare(b.startDate))
    }
  })
})

function selectEvent(event: EventItem) {
  selectedEvent.value = event
  window.history.replaceState(null, '', `#${event.id}`)
}

onMounted(async () => {
  await load()
  const hashId = window.location.hash.replace('#', '')
  const fromHash = events.value.find((event) => event.id === hashId)
  selectedEvent.value = fromHash ?? null
})

watch(filteredEvents, (nextEvents) => {
  if (!nextEvents.length) {
    selectedEvent.value = null
    return
  }

  if (selectedEvent.value && !nextEvents.some((event) => event.id === selectedEvent.value?.id)) {
    selectedEvent.value = null
  }
})
</script>
