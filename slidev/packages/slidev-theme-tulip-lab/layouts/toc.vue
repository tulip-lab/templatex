<script setup lang="ts">
import AudienceQrCode from '../components/AudienceQrCode.vue'
</script>

<template>
  <div class="slidev-layout tulip-toc">
    <main class="tulip-layout-content tulip-toc-content">
      <slot />
    </main>
    <AudienceQrCode />
  </div>
</template>

<style scoped>
.tulip-toc-content {
  box-sizing: border-box;
  padding-right: 9rem;
}
</style>
