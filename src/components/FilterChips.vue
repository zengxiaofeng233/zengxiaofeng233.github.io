<template>
  <section class="filter-groups" aria-label="筛选条件">
    <div class="chip-row" aria-label="地区筛选">
      <button :class="chipClass(regionFilter === 'all')" type="button" @click="$emit('update:regionFilter', 'all')">全部</button>
      <button :class="chipClass(regionFilter === 'mainland')" type="button" @click="$emit('update:regionFilter', 'mainland')">中国大陆</button>
      <button :class="chipClass(regionFilter === 'hmt')" type="button" @click="$emit('update:regionFilter', 'hmt')">港澳台</button>
      <button :class="chipClass(regionFilter === 'overseas')" type="button" @click="$emit('update:regionFilter', 'overseas')">海外</button>
    </div>
    <div class="chip-row" aria-label="类型筛选">
      <button :class="chipClass(typeFilter === 'all')" type="button" @click="$emit('update:typeFilter', 'all')">全部</button>
      <button :class="chipClass(typeFilter === 'event')" type="button" @click="$emit('update:typeFilter', 'event')">Only</button>
      <button :class="chipClass(typeFilter === 'community')" type="button" @click="$emit('update:typeFilter', 'community')">同好会</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RegionFilter, TypeFilter } from '../types'

defineProps<{
  regionFilter: RegionFilter
  typeFilter: TypeFilter
}>()

defineEmits<{
  'update:regionFilter': [value: RegionFilter]
  'update:typeFilter': [value: TypeFilter]
}>()

function chipClass(active: boolean) {
  return ['chip', { active }]
}
</script>
