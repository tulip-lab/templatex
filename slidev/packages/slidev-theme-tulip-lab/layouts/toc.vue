<script setup lang="ts">
import logo from '../assets/tulip-logo.png'
import AudienceQrCode from '../components/AudienceQrCode.vue'
</script>

<template>
  <div class="slidev-layout tulip-toc">
    <img :src="logo" class="tulip-toc-watermark" alt="" aria-hidden="true" />
    <main class="tulip-layout-content tulip-toc-content">
      <slot />
    </main>
    <AudienceQrCode />
  </div>
</template>

<style scoped>
.tulip-toc-watermark {
  position: absolute;
  left: 50%;
  bottom: 8%;
  width: 17%;
  transform: translateX(-50%);
  opacity: 0.055;
  pointer-events: none;
}

.tulip-toc-content {
  box-sizing: border-box;
  padding-right: 9rem;
}
</style>
