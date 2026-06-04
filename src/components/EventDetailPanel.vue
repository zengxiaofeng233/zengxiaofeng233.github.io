<template>
  <aside class="detail-panel" :class="{ open }" aria-live="polite">
    <template v-if="event">
      <div class="detail-header">
        <StatusBadge :status="event.status" />
        <button type="button" aria-label="关闭详情" @click="$emit('close')">×</button>
      </div>

      <h2>{{ event.title }}</h2>
      <p class="detail-location">{{ event.city }} · {{ event.venue }}</p>
      <img class="detail-cover" :src="event.coverUrl" :alt="event.title" />

      <dl class="detail-meta">
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
        <div>
          <dt>来源</dt>
          <dd>{{ event.source }}</dd>
        </div>
      </dl>

      <section class="detail-section">
        <h3>简介</h3>
        <p>{{ event.description }}</p>
      </section>

      <section class="detail-section" id="communities">
        <div class="section-title-row compact">
          <h3>相关同好会 / QQ群</h3>
          <span>{{ relatedCommunities.length }} 个</span>
        </div>
        <CommunityCard
          v-for="community in relatedCommunities"
          :key="community.id"
          :community="community"
        />
        <p v-if="!relatedCommunities.length" class="muted">暂无相关 QQ 群信息。</p>
      </section>

      <div class="detail-actions">
        <a class="primary-action" :href="event.sourceUrl" target="_blank" rel="noreferrer">查看来源页面</a>
        <button type="button" @click="shareEvent">分享</button>
        <a :href="reportUrl" target="_blank" rel="noreferrer">举报信息有误</a>
      </div>
    </template>

  </aside>
</template>

<script setup lang="ts">
import type { CommunityItem, EventItem } from '../types'
import { formatDateRange, formatNumber } from '../utils/format'
import CommunityCard from './CommunityCard.vue'
import StatusBadge from './StatusBadge.vue'

const props = defineProps<{
  event: EventItem | null
  relatedCommunities: CommunityItem[]
  reportUrl: string
  open: boolean
}>()

defineEmits<{
  close: []
}>()

async function shareEvent() {
  if (!props.event) return
  const url = `${window.location.origin}${window.location.pathname}#${props.event.id}`
  const text = `${props.event.title} - ${props.event.city}`

  if (navigator.share) {
    await navigator.share({ title: props.event.title, text, url })
    return
  }

  await navigator.clipboard.writeText(url)
}
</script>
