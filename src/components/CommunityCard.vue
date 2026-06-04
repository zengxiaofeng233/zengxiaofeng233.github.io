<template>
  <article class="community-card">
    <div class="community-icon" aria-hidden="true">群</div>
    <div class="community-body">
      <div class="community-title-row">
        <strong>{{ community.name }}</strong>
        <StatusBadge :status="community.status" />
      </div>
      <span>{{ community.contactType }}：{{ community.contactValue }}</span>
      <small>{{ community.type }} · {{ formatNumber(community.memberCount) }} 人 · {{ community.city }}</small>
      <p>{{ community.description }}</p>
    </div>
    <button class="copy-button" type="button" @click="copyContact">
      {{ copied ? '已复制' : '复制群号' }}
    </button>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CommunityItem } from '../types'
import { formatNumber } from '../utils/format'
import StatusBadge from './StatusBadge.vue'

const props = defineProps<{
  community: CommunityItem
}>()

const copied = ref(false)

async function copyContact() {
  await navigator.clipboard.writeText(props.community.contactValue)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1600)
}
</script>
