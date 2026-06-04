<template>
  <button
    class="map-marker"
    :class="{ selected }"
    type="button"
    :style="markerStyle"
    @click="$emit('select', point.events[0])"
    @mouseenter="$emit('hover', point)"
    @mouseleave="$emit('hover', null)"
  >
    <span class="marker-dot">{{ point.events.length }}</span>
    <span class="marker-city">{{ point.city }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EventItem, MapPoint } from '../types'

const props = defineProps<{
  point: MapPoint
  selected: boolean
  x: number
  y: number
}>()

defineEmits<{
  select: [event: EventItem]
  hover: [point: MapPoint | null]
}>()

const markerStyle = computed(() => ({
  left: `${props.x}%`,
  top: `${props.y}%`
}))
</script>
