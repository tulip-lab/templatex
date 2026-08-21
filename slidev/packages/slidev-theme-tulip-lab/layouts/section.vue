<script setup lang="ts">
import logo from '../assets/tulip-logo.png'
</script>

<template>
  <div class="slidev-layout tulip-section">
    <img :src="logo" class="tulip-section-watermark" alt="" aria-hidden="true" />
    <main class="tulip-layout-content tulip-layout-content--centered tulip-section-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.tulip-section-watermark {
  position: absolute;
  right: 8%;
  bottom: 11%;
  width: 17%;
  opacity: 0.055;
}

.tulip-section-main :deep(h1) {
  max-width: 16em;
  margin-inline: auto;
  font-family: var(--tulip-serif);
  font-size: 3rem;
  letter-spacing: -0.02em;
}
</style>
