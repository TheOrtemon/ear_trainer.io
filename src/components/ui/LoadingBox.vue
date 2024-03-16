<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import Spinner from '@/components/ui/Spinner.vue'
</script>

<template>
  <div area-label="Loading box">
    <AlertDialog>
      <AlertDialogContent class="w-fit">
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center">
            <Spinner class="mx-2" />
            Loading...
          </AlertDialogTitle>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
