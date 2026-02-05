<template>
  <p class="font-weight-thin"><v-icon v-if="icon" left>{{ icon }}</v-icon>{{ title }}</p>
</template>

<script setup lang="ts">
defineProps<{
  title: string,
  icon?: string
}>()
</script>