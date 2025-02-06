<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  fraction: {
    type: Number,
    required: true,
  },
})
const percent = computed(() =>
  props.fraction !== undefined ? `${props.fraction * 100}%` : undefined,
)
</script>

<template>
  <div
    id="battery-body"
    class="relative w-6 h-5 border rounded-sm overflow-hidden border-green-700 bg-green-50"
  >
    <div id="battery-charge" class="h-full bg-green-500"></div>
  </div>
  <div
    id="battery-after"
    class="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-2 border border-l-transparent border-transparent bg-green-700"
  ></div>
</template>

<style scoped>
#battery-charge {
  width: v-bind(percent);
}
</style>
