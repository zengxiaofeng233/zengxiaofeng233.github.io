<template>
  <section class="map-shell" id="map">
    <div class="map-toolbar" aria-label="地图操作">
      <button type="button" aria-label="放大" @click="zoomIn">+</button>
      <button type="button" aria-label="缩小" @click="zoomOut">-</button>
      <button type="button" aria-label="回到全国视图" @click="resetView">⌖</button>
    </div>

    <div class="map-canvas baidu-map-shell">
      <div ref="mapEl" class="baidu-map" aria-label="百度地图"></div>
      <div class="baidu-map-shade" aria-hidden="true"></div>
      <div class="map-grid" aria-hidden="true"></div>
      <div class="map-notice">
        <strong>百度地图底图</strong>
        <span>点位为独立前端覆盖层，可缩放查看城市活动</span>
      </div>

      <div class="baidu-marker-layer" aria-label="活动点位">
        <button
          v-for="marker in markerPositions"
          :key="marker.point.id"
          class="map-marker baidu-html-marker"
          :class="{ selected: marker.point.events.some((event) => event.id === selectedEventId) }"
          type="button"
          :style="markerStyle(marker)"
          @click="selectMarker(marker.point)"
          @mouseenter="hoveredPoint = marker.point"
          @mouseleave="hoveredPoint = null"
        >
          <span class="marker-dot">{{ marker.point.events.length }}</span>
          <span class="marker-city">{{ marker.point.city }}</span>
        </button>
      </div>

      <div v-if="hoveredMarker" class="map-tooltip" :style="tooltipStyle">
        <strong>{{ hoveredMarker.point.events[0].title }}</strong>
        <span>{{ hoveredMarker.point.city }} · {{ hoveredMarker.point.events[0].venue }}</span>
        <span>{{ formatDateRange(hoveredMarker.point.events[0].startDate, hoveredMarker.point.events[0].endDate) }}</span>
        <span>{{ formatNumber(hoveredMarker.point.events[0].wantToGoCount) }} 人想去</span>
      </div>

      <div v-if="loadError" class="map-load-error">
        <strong>百度地图加载失败</strong>
        <span>{{ loadError }}</span>
      </div>
    </div>

    <footer class="map-footer">
      <span>数据来源：B站会员购公开信息、同好会公开投稿信息</span>
      <span>地图服务：百度地图开放平台</span>
      <span>点位仅用于活动与同好会信息展示</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { EventItem, MapPoint } from '../types'
import { formatDateRange, formatNumber } from '../utils/format'

const props = defineProps<{
  points: MapPoint[]
  selectedEventId?: string
  baiduMapAk: string
}>()

const emit = defineEmits<{
  select: [event: EventItem]
}>()

interface MarkerPosition {
  point: MapPoint
  x: number
  y: number
}

const mapEl = ref<HTMLDivElement | null>(null)
const mapInstance = ref<any>(null)
const markerPositions = ref<MarkerPosition[]>([])
const hoveredPoint = ref<MapPoint | null>(null)
const loadError = ref('')
let skipInitialFocus = true
let resizeObserver: ResizeObserver | null = null

const defaultCenter = { lng: 104.1954, lat: 35.8617, zoom: 5 }

const hoveredMarker = computed(() => {
  if (!hoveredPoint.value) return null
  return markerPositions.value.find((marker) => marker.point.id === hoveredPoint.value?.id) ?? null
})

const tooltipStyle = computed(() => {
  if (!hoveredMarker.value) return {}
  return {
    left: `${hoveredMarker.value.x}px`,
    top: `${hoveredMarker.value.y}px`
  }
})

function markerStyle(marker: MarkerPosition) {
  return {
    left: `${marker.x}px`,
    top: `${marker.y}px`
  }
}

function loadBaiduMapScript(ak: string) {
  if (window.BMapGL) return Promise.resolve()

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-baidu-map-sdk="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('百度地图 SDK 加载失败')), { once: true })
      return
    }

    const callbackName = `__initBaiduMap_${Date.now()}`
    window[callbackName] = () => {
      delete window[callbackName]
      resolve()
    }

    const script = document.createElement('script')
    script.dataset.baiduMapSdk = 'true'
    script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${encodeURIComponent(ak)}&callback=${callbackName}`
    script.async = true
    script.onerror = () => {
      delete window[callbackName]
      reject(new Error('百度地图 SDK 加载失败，请检查 AK 和 Referer 白名单'))
    }
    document.head.appendChild(script)
  })
}

async function initMap() {
  if (!mapEl.value || mapInstance.value) return

  try {
    await loadBaiduMapScript(props.baiduMapAk)
    await nextTick()

    const map = new window.BMapGL.Map(mapEl.value, {
      enableMapClick: false
    })
    const center = new window.BMapGL.Point(defaultCenter.lng, defaultCenter.lat)
    map.centerAndZoom(center, defaultCenter.zoom)
    map.enableScrollWheelZoom(true)
    map.setMinZoom(4)
    map.setMaxZoom(18)

    map.addEventListener('moving', updateMarkerPositions)
    map.addEventListener('moveend', updateMarkerPositions)
    map.addEventListener('zoomend', updateMarkerPositions)

    mapInstance.value = map
    updateMarkerPositions()

    resizeObserver = new ResizeObserver(() => {
      mapInstance.value?.checkResize?.()
      updateMarkerPositions()
    })
    resizeObserver.observe(mapEl.value)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '未知地图错误'
  }
}

function updateMarkerPositions() {
  const map = mapInstance.value
  if (!map) return

  markerPositions.value = props.points.map((point) => {
    const pixel = map.pointToOverlayPixel(new window.BMapGL.Point(point.lng, point.lat))
    return {
      point,
      x: pixel.x,
      y: pixel.y
    }
  })
}

function selectMarker(point: MapPoint) {
  const event = point.events[0]
  emit('select', event)
  focusPoint(point, 12)
}

function focusPoint(point: MapPoint, zoom = 11) {
  const map = mapInstance.value
  if (!map) return
  map.centerAndZoom(new window.BMapGL.Point(point.lng, point.lat), zoom)
  window.setTimeout(updateMarkerPositions, 80)
}

function zoomIn() {
  mapInstance.value?.zoomIn()
}

function zoomOut() {
  mapInstance.value?.zoomOut()
}

function resetView() {
  const map = mapInstance.value
  if (!map) return
  map.centerAndZoom(new window.BMapGL.Point(defaultCenter.lng, defaultCenter.lat), defaultCenter.zoom)
  window.setTimeout(updateMarkerPositions, 80)
}

onMounted(initMap)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => props.points,
  () => nextTick(updateMarkerPositions),
  { deep: true }
)

watch(
  () => props.selectedEventId,
  (selectedEventId) => {
    if (!selectedEventId) return

    const selectedPoint = props.points.find((point) => point.events.some((event) => event.id === selectedEventId))
    if (!selectedPoint) return

    if (skipInitialFocus) {
      skipInitialFocus = false
      updateMarkerPositions()
      return
    }

    focusPoint(selectedPoint, 11)
  }
)
</script>
