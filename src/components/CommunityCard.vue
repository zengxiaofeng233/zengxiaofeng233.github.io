<template>
  <article class="community-card">
    <div class="community-body">
      <strong>游客群：{{ community.contactValue }}</strong>
    </div>
    <button class="copy-button" type="button" @click="copyContact">
      {{ copied ? '已复制' : '复制群号' }}
    </button>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CommunityItem } from '../types'

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
