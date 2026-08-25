<script setup lang="ts">
interface Props {
  balanced?: boolean
  columns?: number | string
}

const props = defineProps<Props>()
</script>

<template>
  <div
    class="slidev-layout tulip-references"
    :class="{
      'tulip-references--balanced': props.balanced,
      'tulip-references--two-columns': Number(props.columns) === 2,
    }"
  >
    <main class="tulip-layout-content tulip-layout-content--references">
      <slot />
    </main>
  </div>
</template>
