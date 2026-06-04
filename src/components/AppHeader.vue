<template>
  <header class="app-header">
    <a class="brand" href="#map" aria-label="返回地图">
      <span class="brand-mark" aria-hidden="true">UM</span>
      <span>
        <strong>全国赛马娘同好会地图</strong>
        <small>Uma Musume Fan Map CN</small>
      </span>
    </a>

    <nav class="header-nav" aria-label="主导航">
      <a href="#map" class="active">地图</a>
      <a href="#communities">同好会</a>
      <a href="#events">漫展活动</a>
      <a :href="submitUrl" target="_blank" rel="noreferrer">投稿/纠错</a>
      <a href="#about">关于</a>
    </nav>

    <a class="github-link" :href="githubUrl" target="_blank" rel="noreferrer" aria-label="GitHub 开源链接">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.97c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.95-2.34 4.81-4.57 5.07.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.59.69.49A10.16 10.16 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
      </svg>
    </a>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  githubUrl: string
  submitUrl: string
}>()
</script>
