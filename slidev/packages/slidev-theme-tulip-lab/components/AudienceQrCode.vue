<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
import { onMounted, shallowRef } from 'vue'
import { resolveAudienceUrl } from '../utils/audienceUrl'

const audienceUrl = shallowRef('')
const env = import.meta.env as Record<string, string | boolean | undefined>

onMounted(() => {
  const target = String(env.VITE_TULIP_AUDIENCE_URL || import.meta.env.BASE_URL)
  audienceUrl.value = resolveAudienceUrl(target, window.location.origin)
})
</script>

<template>
  <aside v-if="audienceUrl" class="tulip-audience-qr" aria-label="Live audience view">
    <a
      class="tulip-audience-qr-link"
      :href="audienceUrl"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`Open live audience view at ${audienceUrl}`"
    >
      <QrcodeVue
        :value="audienceUrl"
        :size="112"
        :margin="2"
        level="M"
        render-as="svg"
        foreground="#1d2b3a"
      />
    </a>
    <span class="tulip-audience-qr-label">Scan to follow live</span>
  </aside>
</template>

<style scoped>
.tulip-audience-qr {
  position: absolute;
  right: var(--tulip-shell-x);
  bottom: calc(var(--tulip-content-bottom) + 0.2rem);
  z-index: 2;
  display: flex;
  width: 8rem;
  flex-direction: column;
  align-items: center;
  color: var(--tulip-shell-ink);
  font-family: var(--tulip-sans);
  text-align: center;
}

.tulip-audience-qr-link {
  display: grid;
  width: 7rem;
  height: 7rem;
  place-items: center;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--tulip-shell-ink) 18%, transparent);
  border-radius: 0.35rem;
  background: #fff;
  line-height: 0;
}

.tulip-audience-qr-link:focus-visible {
  outline: 2px solid var(--tulip-shell-ink);
  outline-offset: 0.18rem;
}

.tulip-audience-qr-label {
  margin-top: 0.35rem;
  font-size: 0.62rem;
  font-weight: 700;
  line-height: 1.2;
}
</style>
