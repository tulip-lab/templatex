<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import defaultQuestionsImage from '../assets/questions.gif'
import { asText, resolvePublicAssetPath } from '../utils/config'

const { $slidev } = useSlideContext()
const config = computed(() => $slidev.configs as Record<string, unknown>)
const questionsImage = computed(() => {
  const configured = asText(config.value.questionsImage)
  return configured
    ? resolvePublicAssetPath(configured, import.meta.env.BASE_URL)
    : defaultQuestionsImage
})
</script>

<template>
  <div class="slidev-layout tulip-standard-page">
    <main class="questions-wrap">
      <h1>Questions?</h1>
      <img :src="questionsImage" alt="Questions animation">
    </main>
  </div>
</template>

<style scoped>
.questions-wrap {
  position: absolute;
  inset: 12% 5.5% 10.5%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.questions-wrap h1 { margin: 0 0 1rem; }
.questions-wrap img {
  width: auto;
  height: 40%;
  max-height: 15.5rem;
  object-fit: contain;
}
</style>
