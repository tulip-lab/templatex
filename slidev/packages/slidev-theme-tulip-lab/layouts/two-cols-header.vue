<script setup lang="ts">
type Accent = 'blue' | 'warm' | 'green' | 'purple' | 'red'

interface Props {
  accent?: Accent
  class?: string
  layoutClass?: string
}

const props = defineProps<Props>()

defineSlots<{
  default(): unknown
  left(): unknown
  right(): unknown
  bottom(): unknown
}>()
</script>

<template>
  <div
    class="slidev-layout two-cols-header"
    :class="[props.layoutClass, props.accent ? `tulip-accent-${props.accent}` : undefined]"
  >
    <main class="tulip-layout-content tulip-titled-layout tulip-two-cols-header-grid">
      <header class="tulip-title-region">
        <slot />
      </header>
      <div class="tulip-two-cols-body">
        <section class="col-left" :class="props.class">
          <slot name="left" />
        </section>
        <section class="col-right" :class="props.class">
          <slot name="right" />
        </section>
      </div>
      <footer v-if="$slots.bottom" class="col-bottom" :class="props.class">
        <slot name="bottom" />
      </footer>
    </main>
  </div>
</template>

<style scoped>
.tulip-two-cols-header-grid {
  grid-template-rows: var(--tulip-title-region-height) minmax(0, 1fr) auto;
}

.tulip-two-cols-body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  min-height: 0;
}

.col-left,
.col-right {
  min-width: 0;
}

.col-bottom {
  min-width: 0;
  align-self: end;
}
</style>
