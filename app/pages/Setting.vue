<template>
  <v-container>
    <v-card class="pa-6" max-width="500">
      <v-card-title>ตั้งค่า</v-card-title>
      <v-card-subtitle>ขนาดตัวอักษร</v-card-subtitle>
      
      <v-card-text>
        <div class="d-flex align-center justify-center ga-4">
          <v-btn 
            icon="mdi-minus" 
            variant="outlined"
            :disabled="sizeIndex === 0"
            @click="decreaseSize"
          />
          <span class="text-h6 mx-4" style="min-width: 40px; text-align: center;">
            {{ currentSize.label }}
          </span>
          <v-btn 
            icon="mdi-plus" 
            variant="outlined"
            :disabled="sizeIndex === fontSizes.length - 1"
            @click="increaseSize"
          />
        </div>
        
        <div class="mt-6 pa-4 bg-grey-lighten-4 rounded">
          <p class="text-subtitle-2 mb-2">ตัวอย่าง:</p>
          <p :style="{ fontSize: currentSize.value + 'px' }">
            สวัสดี Hello World 你好
          </p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const fontSizes = [
  { label: 'XS', value: 12 },
  { label: 'S', value: 14 },
  { label: 'M', value: 16 },
  { label: 'L', value: 20 },
  { label: 'XL', value: 24 },
] as const

const sizeIndex = ref(2) // เริ่มต้นที่ M (16px)

const currentSize = computed(() => fontSizes[sizeIndex.value]!)

const decreaseSize = () => {
  if (sizeIndex.value > 0) sizeIndex.value--
}

const increaseSize = () => {
  if (sizeIndex.value < fontSizes.length - 1) sizeIndex.value++
}

watch(sizeIndex, (newIndex) => {
  document.documentElement.style.setProperty('--font-size-base', `${fontSizes[newIndex]!.value}px`)
})
</script>