<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import Spinner from '@/components/ui/Spinner.vue'
</script>

<template>
  <AlertDialog>
    <AlertDialogContent class="w-fit">
      <AlertDialogHeader>
        <AlertDialogTitle class="flex items-center">
          <Spinner class="mx-2" />
          Loading...
        </AlertDialogTitle>
        <AlertDialogDescription class="mt-1">
          The instrument is being loaded to your local storage.
        </AlertDialogDescription>
      </AlertDialogHeader>
    </AlertDialogContent>
  </AlertDialog>
</template>
