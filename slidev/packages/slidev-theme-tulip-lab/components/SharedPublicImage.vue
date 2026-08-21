<script setup lang="ts">
import { computed } from 'vue'
import { resolvePublicAssetPath } from '../utils/coverConfig'

const props = defineProps<{
  src: string
  alt: string
}>()

const resolvedSrc = computed(() => resolvePublicAssetPath(
  props.src,
  import.meta.env.BASE_URL,
))
</script>

<template>
  <img :src="resolvedSrc" :alt="alt">
</template>
