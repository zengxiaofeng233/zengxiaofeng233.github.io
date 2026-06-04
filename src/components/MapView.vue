<template>
  <section class="map-shell" id="map">
    <div class="map-toolbar" aria-label="地图操作">
      <button type="button" aria-label="放大">+</button>
      <button type="button" aria-label="缩小">-</button>
      <button type="button" aria-label="回到全国视图">⌖</button>
    </div>

    <div class="map-canvas" :style="backgroundStyle">
      <div class="map-grid" aria-hidden="true"></div>
      <div class="map-notice">
        <strong>标准地图底图</strong>
        <span>边界无修改，点位为独立前端覆盖层</span>
      </div>

      <MapMarker
        v-for="point in projectedPoints"
        :key="point.id"
        :point="point"
        :x="point.x"
        :y="point.y"
        :selected="point.events.some((event) => event.id === selectedEventId)"
        @select="$emit('select', $event)"
        @hover="hoveredPoint = $event"
      />

      <div v-if="hoveredPoint" class="map-tooltip" :style="tooltipStyle">
        <strong>{{ hoveredPoint.events[0].title }}</strong>
        <span>{{ hoveredPoint.city }} · {{ hoveredPoint.events[0].venue }}</span>
        <span>{{ formatDateRange(hoveredPoint.events[0].startDate, hoveredPoint.events[0].endDate) }}</span>
        <span>{{ formatNumber(hoveredPoint.events[0].wantToGoCount) }} 人想去</span>
      </div>
    </div>

    <footer class="map-footer">
      <span>数据来源：B站会员购公开信息、同好会公开投稿信息</span>
      <span>地图来源：自然资源部标准地图服务</span>
      <span>审图号：GS（2023）2767号</span>
      <span>底图边界无修改，仅用于活动与同好会点位展示。</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { EventItem, MapPoint } from '../types'
import { formatDateRange, formatNumber } from '../utils/format'
import MapMarker from './MapMarker.vue'

const props = defineProps<{
  points: MapPoint[]
  selectedEventId?: string
  mapBackgroundUrl: string
}>()

defineEmits<{
  select: [event: EventItem]
}>()

const hoveredPoint = ref<MapPoint | null>(null)

const bounds = {
  minLng: 72,
  maxLng: 142,
  minLat: 16,
  maxLat: 54
}

const projectedPoints = computed(() => {
  return props.points.map((point) => {
    const x = ((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100
    const y = (1 - (point.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100

    return {
      ...point,
      x: Math.min(94, Math.max(6, x)),
      y: Math.min(90, Math.max(10, y))
    }
  })
})

const backgroundStyle = computed(() => ({
  '--map-background-url': `url(${props.mapBackgroundUrl})`
}))

const tooltipStyle = computed(() => {
  if (!hoveredPoint.value) return {}
  const projected = projectedPoints.value.find((point) => point.id === hoveredPoint.value?.id)
  return {
    left: `${projected?.x ?? 50}%`,
    top: `${projected?.y ?? 50}%`
  }
})
</script>
