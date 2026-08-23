<script setup lang="ts">
import { useSlideLiveSync } from '../composables/useSlideLiveSync'

const {
  enabled,
  enterPresenterFullscreen,
  isFullscreenPresenter,
  nav,
  returnToPresenter,
  status,
  statusLabel,
} = useSlideLiveSync()
</script>

<template>
  <div v-if="enabled" class="slide-sync-tools">
    <button
      v-if="nav.isPresenter.value"
      class="slide-sync-fullscreen"
      type="button"
      title="Open a clean, synchronized presenter view"
      @click="enterPresenterFullscreen"
    >
      <span class="slide-sync-fullscreen__icon i-carbon-maximize" aria-hidden="true" />
      Presenter Fullscreen
    </button>
    <button
      v-else-if="isFullscreenPresenter"
      class="slide-sync-fullscreen slide-sync-fullscreen--return"
      type="button"
      title="Return to Presenter Mode"
      @click="returnToPresenter"
    >
      <span class="slide-sync-fullscreen__icon i-carbon-user-speaker" aria-hidden="true" />
      Presenter Mode
    </button>
    <div
      v-if="nav.isPresenter.value || isFullscreenPresenter || status !== 'connected'"
      class="slide-sync-status"
      :class="`slide-sync-status--${status}`"
      role="status"
      :aria-label="statusLabel"
      :title="statusLabel"
    >
      <span aria-hidden="true" />
      {{ statusLabel }}
    </div>
  </div>
</template>

<style scoped>
.slide-sync-tools {
  position: fixed;
  top: 0.7rem;
  right: 0.7rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-family: "Avenir Next", "Segoe UI", sans-serif;
}

.slide-sync-fullscreen,
.slide-sync-status {
  border: 1px solid rgb(62 47 124 / 22%);
  border-radius: 999px;
  background: rgb(255 255 255 / 94%);
  color: #3e2f7c;
  box-shadow: 0 3px 12px rgb(39 55 68 / 12%);
  backdrop-filter: blur(10px);
}

.slide-sync-fullscreen {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.38rem 0.62rem;
  font: 750 0.58rem/1 system-ui, sans-serif;
  cursor: pointer;
}

.slide-sync-fullscreen:hover {
  border-color: rgb(112 91 158 / 55%);
  background: #f2eff8;
}

.slide-sync-fullscreen:focus-visible {
  outline: 2px solid #705b9e;
  outline-offset: 2px;
}

.slide-sync-fullscreen__icon {
  width: 0.72rem;
  height: 0.72rem;
}

.slide-sync-fullscreen--return {
  opacity: 0;
  transition: opacity 160ms ease;
}

.slide-sync-tools:hover .slide-sync-fullscreen--return,
.slide-sync-fullscreen--return:focus-visible {
  opacity: 1;
}

.slide-sync-status {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.34rem 0.52rem;
  color: #4b5563;
  font: 650 0.56rem/1 system-ui, sans-serif;
}

.slide-sync-status span {
  width: 0.45rem;
  height: 0.45rem;
  flex: 0 0 0.45rem;
  border-radius: 50%;
  background: #d97706;
}

.slide-sync-status--connected span {
  background: #059669;
}

.slide-sync-status--disconnected span,
.slide-sync-status--drawing-error span,
.slide-sync-status--mismatch span {
  background: #dc2626;
}
</style>

<style>
html.slide-sync-audience #slide-container > :not(#slide-content),
html.slide-sync-enabled button[title="Play Mode"] {
  display: none !important;
}

html.slide-sync-audience #slide-container {
  cursor: default !important;
}
</style>
