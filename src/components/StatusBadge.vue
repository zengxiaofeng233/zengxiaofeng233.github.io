<template>
  <span class="status-badge" :class="status">
    {{ statusLabel(status) }}
  </span>
</template>

<script setup lang="ts">
import { statusLabel } from '../utils/format'

defineProps<{
  status: string
}>()
</script>
