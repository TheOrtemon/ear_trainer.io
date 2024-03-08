<script setup lang="ts">
import { Button } from './button'
</script>

<template>
  <Button variant="secondary" rounded="yes" size="m" class="mx-1 focus:ring-transparent">
    <slot />
  </Button>
</template>
