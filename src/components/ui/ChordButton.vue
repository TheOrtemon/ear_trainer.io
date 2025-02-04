<script setup lang="ts">
import { Button } from './button'
import ChordBattery from './ChordBattery.vue'

defineProps({
  fraction: {
    type: Number,
    default: undefined,
  },
})
</script>

<template>
  <Button
    variant="secondary"
    rounded="yes"
    size="m"
    class="mx-2 mt-2 w-14 focus:ring-transparent relative border border-gray-300"
  >
    <div
      v-if="fraction !== undefined"
      class="absolute content-[''] grid place-items-center top-[4%] right-[2%] translate-x-2/4 -translate-y-2/4 min-w-[24px] min-h-[24px]"
    >
      <ChordBattery :fraction="fraction"></ChordBattery>
    </div>
    <slot />
  </Button>
</template>
