<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'
import { asText, resolvePublicAssetPath } from '../utils/config'

const { $slidev } = useSlideContext()
const config = computed(() => $slidev.configs as Record<string, unknown>)
const questionsImage = computed(() => {
  const configured = asText(config.value.questionsImage)
  return configured ? resolvePublicAssetPath(configured, import.meta.env.BASE_URL) : ''
})
</script>

<template>
  <div class="slidev-layout tulip-standard-page">
    <main class="questions-wrap">
      <h1>Questions?</h1>
      <img v-if="questionsImage" :src="questionsImage" alt="Questions">
      <div v-else class="questions-mark" aria-hidden="true">
        ?
      </div>
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
.questions-mark {
  display: grid;
  width: 12rem;
  height: 12rem;
  place-items: center;
  border: 0.16rem solid color-mix(in srgb, var(--tulip-purple, #705b9e) 24%, white);
  border-radius: 50%;
  background: color-mix(in srgb, var(--tulip-purple, #705b9e) 8%, white);
  color: var(--tulip-purple, #705b9e);
  font-family: var(--tulip-font-serif, Georgia, serif);
  font-size: 8.5rem;
  font-weight: 650;
  line-height: 1;
}
.questions-wrap img {
  width: auto;
  height: 40%;
  max-height: 15.5rem;
  object-fit: contain;
}
</style>
