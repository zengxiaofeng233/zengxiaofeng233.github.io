<template>
  <section class="event-list-section" id="events">
    <div class="section-title-row">
      <h2>近期活动</h2>
      <span>{{ events.length }} 项</span>
    </div>

    <div v-if="events.length" class="event-list">
      <EventListCard
        v-for="event in events"
        :key="event.id"
        :event="event"
        :selected="selectedEventId === event.id"
        @select="$emit('select', $event)"
      />
    </div>
    <div v-else class="empty-state">
      <strong>没有匹配的活动</strong>
      <span>尝试调整搜索关键词或筛选条件。</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EventItem } from '../types'
import EventListCard from './EventListCard.vue'

defineProps<{
  events: EventItem[]
  selectedEventId?: string
}>()

defineEmits<{
  select: [event: EventItem]
}>()
</script>
