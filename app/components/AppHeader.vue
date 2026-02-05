<template>
  <p class="font-weight-thin">{{ title }}</p>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>