<script setup lang="ts">
type Accent = 'blue' | 'warm' | 'green' | 'purple' | 'red'

interface Props {
  accent?: Accent
  bodyCenter?: boolean
}

const props = defineProps<Props>()

defineSlots<{
  header(): unknown
  default(): unknown
}>()
</script>

<template>
  <div
    class="slidev-layout tulip-wideslide"
    :class="props.accent ? `tulip-accent-${props.accent}` : undefined"
  >
    <main
      class="tulip-layout-content tulip-layout-content--wide"
      :class="{ 'tulip-titled-layout': $slots.header }"
    >
      <header v-if="$slots.header" class="tulip-title-region">
        <slot name="header" />
      </header>
      <section :class="{ 'tulip-slide-body': $slots.header, 'tulip-slide-body--centered': props.bodyCenter }">
        <slot />
      </section>
    </main>
  </div>
</template>
