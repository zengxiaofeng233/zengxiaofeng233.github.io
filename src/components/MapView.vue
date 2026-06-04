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

      <div class="baidu-marker-layer" aria-label="活动点位">
        <button
          v-for="point in points"
          :key="point.id"
          :ref="(el) => setMarkerRef(point.id, el)"
          class="map-marker baidu-html-marker"
          :class="{ selected: point.events.some((event) => event.id === selectedEventId) }"
          type="button"
          @click="selectMarker(point)"
          @mouseenter="hoveredPoint = point"
          @mouseleave="hoveredPoint = null"
        >
          <span class="marker-dot">{{ point.events.length }}</span>
          <span class="marker-city">{{ point.city }}</span>
        </button>
      </div>

      <div ref="tooltipEl" v-if="hoveredPoint" class="map-tooltip">
        <strong>{{ hoveredPoint.events[0].title }}</strong>
        <span>{{ hoveredPoint.city }} · {{ hoveredPoint.events[0].venue }}</span>
        <span>{{ formatDateRange(hoveredPoint.events[0].startDate, hoveredPoint.events[0].endDate) }}</span>
        <span>{{ formatNumber(hoveredPoint.events[0].wantToGoCount) }} 人想去</span>
      </div>

      <div v-if="loadError" class="map-load-error">
        <strong>百度地图加载失败</strong>
        <span>{{ loadError }}</span>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUpdate, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { EventItem, MapPoint } from '../types'
import { formatDateRange, formatNumber } from '../utils/format'

const props = defineProps<{
  points: MapPoint[]
  selectedEventId?: string
  baiduMapAk: string
}>()

const emit = defineEmits<{
  select: [event: EventItem]
  zoomChange: [zoom: number]
}>()

const mapEl = ref<HTMLDivElement | null>(null)
const tooltipEl = ref<HTMLDivElement | null>(null)
const mapInstance = ref<any>(null)
const hoveredPoint = ref<MapPoint | null>(null)
const loadError = ref('')
const markerRefs = new Map<string, HTMLElement>()
let skipInitialFocus = true
let resizeObserver: ResizeObserver | null = null
let rafId = 0
let tracking = false

const defaultCenter = { lng: 104.1954, lat: 35.8617, zoom: 5 }

function setMarkerRef(id: string, el: unknown) {
  if (el instanceof HTMLElement) {
    markerRefs.set(id, el)
  }
}

onBeforeUpdate(() => {
  markerRefs.clear()
})

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

    map.addEventListener('moving', startTracking)
    map.addEventListener('zooming', startTracking)
    map.addEventListener('moveend', stopTrackingAfterUpdate)
    map.addEventListener('zoomend', stopTrackingAfterUpdate)
    map.addEventListener('dragstart', startTracking)
    map.addEventListener('dragend', stopTrackingAfterUpdate)

    mapInstance.value = map
    emitZoomChange()
    await nextTick()
    updateMarkerDomPositions()

    resizeObserver = new ResizeObserver(() => {
      mapInstance.value?.checkResize?.()
      requestMarkerUpdate()
    })
    resizeObserver.observe(mapEl.value)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '未知地图错误'
  }
}

function projectPoint(point: MapPoint) {
  const map = mapInstance.value
  if (!map) return null
  return map.pointToOverlayPixel(new window.BMapGL.Point(point.lng, point.lat))
}

function updateMarkerDomPositions() {
  const map = mapInstance.value
  if (!map) return

  for (const point of props.points) {
    const el = markerRefs.get(point.id)
    const pixel = projectPoint(point)
    if (!el || !pixel) continue
    el.style.transform = `translate3d(${pixel.x}px, ${pixel.y}px, 0) translate(-50%, -50%)`
  }

  if (hoveredPoint.value && tooltipEl.value) {
    const pixel = projectPoint(hoveredPoint.value)
    if (pixel) {
      tooltipEl.value.style.transform = `translate3d(${pixel.x + 18}px, ${pixel.y - 52}px, 0)`
    }
  }
}

function animationLoop() {
  updateMarkerDomPositions()
  if (tracking) {
    rafId = window.requestAnimationFrame(animationLoop)
  }
}

function startTracking() {
  if (tracking) return
  tracking = true
  rafId = window.requestAnimationFrame(animationLoop)
}

function stopTrackingAfterUpdate() {
  tracking = false
  if (rafId) {
    window.cancelAnimationFrame(rafId)
    rafId = 0
  }
  emitZoomChange()
  requestMarkerUpdate()
}

function requestMarkerUpdate() {
  if (rafId) window.cancelAnimationFrame(rafId)
  rafId = window.requestAnimationFrame(() => {
    rafId = 0
    updateMarkerDomPositions()
  })
}

function selectMarker(point: MapPoint) {
  const event = point.events[0]
  const map = mapInstance.value
  if (point.events.length > 1 && map && map.getZoom?.() < 10) {
    focusPoint(point, 10)
    return
  }

  emit('select', event)
  focusPoint(point, 12)
}

function emitZoomChange() {
  const zoom = mapInstance.value?.getZoom?.()
  if (typeof zoom === 'number') emit('zoomChange', zoom)
}

function focusPoint(point: MapPoint, zoom = 11) {
  const map = mapInstance.value
  if (!map) return
  startTracking()
  map.centerAndZoom(new window.BMapGL.Point(point.lng, point.lat), zoom)
  window.setTimeout(stopTrackingAfterUpdate, 220)
}

function zoomIn() {
  startTracking()
  mapInstance.value?.zoomIn()
  window.setTimeout(stopTrackingAfterUpdate, 220)
}

function zoomOut() {
  startTracking()
  mapInstance.value?.zoomOut()
  window.setTimeout(stopTrackingAfterUpdate, 220)
}

function resetView() {
  const map = mapInstance.value
  if (!map) return
  startTracking()
  map.centerAndZoom(new window.BMapGL.Point(defaultCenter.lng, defaultCenter.lat), defaultCenter.zoom)
  window.setTimeout(stopTrackingAfterUpdate, 220)
}

onMounted(initMap)

onBeforeUnmount(() => {
  tracking = false
  if (rafId) window.cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => props.points,
  () => nextTick(requestMarkerUpdate),
  { deep: true }
)

watch(hoveredPoint, () => nextTick(requestMarkerUpdate))

watch(
  () => props.selectedEventId,
  (selectedEventId) => {
    if (!selectedEventId) return

    const selectedPoint = props.points.find((point) => point.events.some((event) => event.id === selectedEventId))
    if (!selectedPoint) return

    if (skipInitialFocus) {
      skipInitialFocus = false
      requestMarkerUpdate()
      return
    }

    focusPoint(selectedPoint, 11)
  }
)
</script>
