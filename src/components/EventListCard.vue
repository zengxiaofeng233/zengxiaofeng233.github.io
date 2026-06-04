<template>
  <button class="event-card" :class="{ selected }" type="button" @click="$emit('select', event)">
    <img class="event-card-cover" :src="event.coverUrl" :alt="event.title" loading="lazy" />
    <span class="event-card-body">
      <span class="event-card-top">
        <StatusBadge :status="event.status" />
        <span>{{ regionLabel(event.region) }}</span>
      </span>
      <strong>{{ event.title }}</strong>
      <small>{{ event.city }} · {{ event.venue }}</small>
      <span class="event-card-meta">
        <span>{{ formatDateRange(event.startDate, event.endDate) }}</span>
        <span>{{ formatNumber(event.wantToGoCount) }} 人想去</span>
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import type { EventItem } from '../types'
import { formatDateRange, formatNumber, regionLabel } from '../utils/format'
import StatusBadge from './StatusBadge.vue'

defineProps<{
  event: EventItem
  selected: boolean
}>()

defineEmits<{
  select: [event: EventItem]
}>()
</script>
