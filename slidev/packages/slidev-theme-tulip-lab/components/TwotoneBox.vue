<script setup lang="ts">
defineProps<{
  icon?: string
}>()
</script>

<template>
  <div class="tulip-twotone">
    <span v-if="icon" class="tulip-twotone-icon">{{ icon }}</span>
    <span class="tulip-twotone-body"><slot /></span>
  </div>
</template>

<style scoped>
.tulip-twotone {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  border: 1px solid var(--pd2);
  border-left: 5px solid var(--pd1);
  border-radius: 0.4rem;
  background: var(--pd3);
  padding: 0.9rem 1.1rem;
}

.tulip-twotone-icon {
  color: var(--pd1);
  font-size: 1.3rem;
  line-height: 1.4;
}

.tulip-twotone-body {
  flex: 1;
}
</style>
