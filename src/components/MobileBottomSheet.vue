<template>
  <div class="mobile-sheet" :class="{ open: Boolean(event) }" aria-live="polite">
    <div class="sheet-handle" aria-hidden="true"></div>
    <template v-if="event">
      <div class="sheet-header">
        <StatusBadge :status="event.status" />
        <button type="button" aria-label="关闭详情" @click="$emit('close')">×</button>
      </div>
      <h2>{{ event.title }}</h2>
      <p class="detail-location">{{ event.city }} · {{ event.venue }}</p>
      <img class="detail-cover" :src="event.coverUrl" :alt="event.title" />

      <dl class="detail-meta mobile">
        <div>
          <dt>时间</dt>
          <dd>{{ formatDateRange(event.startDate, event.endDate) }}</dd>
        </div>
        <div>
          <dt>届数</dt>
          <dd>第 {{ event.edition }} 届</dd>
        </div>
        <div>
          <dt>想去人数</dt>
          <dd>{{ formatNumber(event.wantToGoCount) }} 人</dd>
        </div>
        <div>
          <dt>场馆</dt>
          <dd>{{ event.venue }}</dd>
        </div>
      </dl>
      <div class="section-title-row compact">
        <h3>相关同好会 / QQ群</h3>
        <span>{{ relatedCommunities.length }} 个</span>
      </div>
      <CommunityCard
        v-for="community in relatedCommunities"
        :key="community.id"
        :community="community"
      />

      <div class="detail-actions sheet-actions">
        <a class="primary-action" :href="event.sourceUrl" target="_blank" rel="noreferrer">查看来源页面</a>
        <a :href="reportUrl" target="_blank" rel="noreferrer">举报信息有误</a>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { CommunityItem, EventItem } from '../types'
import { formatDateRange, formatNumber } from '../utils/format'
import CommunityCard from './CommunityCard.vue'
import StatusBadge from './StatusBadge.vue'

defineProps<{
  event: EventItem | null
  relatedCommunities: CommunityItem[]
  reportUrl: string
}>()

defineEmits<{
  close: []
}>()
</script>
