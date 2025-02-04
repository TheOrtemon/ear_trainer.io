<template>
  <!-- <header> -->
  <!--   Header -->
  <!--   <nav> -->
  <!--     <RouterLink to="/"> -->
  <!--       <Button> -->
  <!--         Home -->
  <!--       </Button> -->
  <!--     </RouterLink> -->
  <!--     <RouterLink to="/chords"> -->
  <!--       <Button> -->
  <!--         Chord trainer -->
  <!--       </Button> -->
  <!--     </RouterLink> -->
  <!--     <RouterLink to="/melody"> -->
  <!--       <Button> -->
  <!--         Melody trainer -->
  <!--       </Button> -->
  <!--     </RouterLink> -->
  <!--   </nav> -->
  <!-- </header> -->
    <!-- <p><strong>Current route path:</strong> {{ $route.fullPath }}</p> -->
  <div class="min-h-screen flex items-center justify-center font-Roboto">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
