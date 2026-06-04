<template>
  <aside class="sidebar">
    <SearchBox :model-value="searchQuery" @update:model-value="$emit('update:searchQuery', $event)" />
    <FilterChips
      :region-filter="regionFilter"
      :type-filter="typeFilter"
      @update:region-filter="$emit('update:regionFilter', $event)"
      @update:type-filter="$emit('update:typeFilter', $event)"
    />

    <EventList :events="events" :selected-event-id="selectedEventId" @select="$emit('select', $event)" />

    <div class="sidebar-actions">
      <a :href="submitUrl" target="_blank" rel="noreferrer">投稿新群</a>
      <button type="button" @click="$emit('reset')">重置筛选</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { EventItem, RegionFilter, TypeFilter } from '../types'
import EventList from './EventList.vue'
import FilterChips from './FilterChips.vue'
import SearchBox from './SearchBox.vue'

defineProps<{
  events: EventItem[]
  selectedEventId?: string
  searchQuery: string
  regionFilter: RegionFilter
  typeFilter: TypeFilter
  submitUrl: string
}>()

defineEmits<{
  select: [event: EventItem]
  reset: []
  'update:searchQuery': [value: string]
  'update:regionFilter': [value: RegionFilter]
  'update:typeFilter': [value: TypeFilter]
}>()
</script>
