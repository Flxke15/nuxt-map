<script setup lang="ts">
// Import icons จาก assets
import markerBlue from '~/assets/images/map/marker-icon-blue.png'
import markerGold from '~/assets/images/map/marker-icon-gold.png'
import markerGrey from '~/assets/images/map/marker-icon-grey.png'
import markerRed from '~/assets/images/map/marker-icon-red.png'
import markerShadow from '~/assets/images/map/marker-shadow.png'

// Props
interface Marker {
  id: number | string
  lat: number
  lng: number
  name: string
  description?: string
  type?: 'saved' | 'search' | 'pending' // ประเภท marker
}

interface Props {
  center?: [number, number]
  zoom?: number
  markers?: Marker[]
  height?: string
  selectedMarkerId?: number | string | null
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [13.702958, 100.543576], // CDG House, Bangkok ถูก Override ด้วยหน้า MapDemo.vue
  zoom: 13,
  markers: () => [],
  height: '400px',
  selectedMarkerId: null,
})

// Emits
const emit = defineEmits<{
  markerClick: [marker: Marker]
  mapClick: [latlng: { lat: number; lng: number }]
}>()

// Lazy load Leaflet components (client-side only)
const LMap = defineAsyncComponent(() =>
  import('@vue-leaflet/vue-leaflet').then((m) => m.LMap)
)
const LTileLayer = defineAsyncComponent(() =>
  import('@vue-leaflet/vue-leaflet').then((m) => m.LTileLayer)
)
const LMarker = defineAsyncComponent(() =>
  import('@vue-leaflet/vue-leaflet').then((m) => m.LMarker)
)
const LPopup = defineAsyncComponent(() =>
  import('@vue-leaflet/vue-leaflet').then((m) => m.LPopup)
)
const LTooltip = defineAsyncComponent(() =>
  import('@vue-leaflet/vue-leaflet').then((m) => m.LTooltip)
)
const LIcon = defineAsyncComponent(() =>
  import('@vue-leaflet/vue-leaflet').then((m) => m.LIcon)
)

// Import CSS only on client-side
onMounted(() => {
  import('leaflet/dist/leaflet.css')
})

// State
const mapRef = ref<InstanceType<typeof LMap> | null>(null)

// Icon URLs แยกตามประเภท
const icons = {
  saved: {
    url: markerBlue,
    shadowUrl: markerShadow,
  },
  search: {
    url: markerGold,
    shadowUrl: markerShadow,
  },
  pending: {
    url: markerGrey,
    shadowUrl: markerShadow,
  },
  selected: {
    url: markerRed,
    shadowUrl: markerShadow,
  },
}

// Methods
const getIconUrl = (marker: Marker) => {
  // ถ้า marker นี้ถูกเลือก ให้แสดงสีแดง
  if (props.selectedMarkerId && marker.id === props.selectedMarkerId) {
    return icons.selected.url
  }
  return icons[marker.type as keyof typeof icons]?.url || icons.saved.url
}

const onMarkerClick = (marker: Marker) => {
  emit('markerClick', marker)
}

const onMapClick = (event: L.LeafletMouseEvent) => {
  emit('mapClick', { lat: event.latlng.lat, lng: event.latlng.lng })
}
</script>

<template>
  <ClientOnly>
    <LMap
      ref="mapRef"
      :zoom="props.zoom"
      :center="props.center"
      :style="{ height: props.height, width: '100%' }"
      @click="onMapClick"
    >
      <!-- OpenStreetMap Tiles (ฟรี) -->
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        layer-type="base"
        name="OpenStreetMap"
      />

      <!-- Markers -->
      <LMarker
        v-for="marker in props.markers"
        :key="marker.id"
        :lat-lng="[marker.lat, marker.lng]"
        @click="onMarkerClick(marker)"
      >
        <!-- Custom Icon ตามประเภท -->
        <LIcon
          :icon-url="getIconUrl(marker)"
          :shadow-url="icons.saved.shadowUrl"
          :icon-size="[25, 41]"
          :icon-anchor="[12, 41]"
          :popup-anchor="[1, -34]"
          :shadow-size="[41, 41]"
        />

        <!-- Tooltip - แสดงเมื่อ hover -->
        <LTooltip>
          <div class="marker-tooltip">
            <strong>{{ marker.name }}</strong>
            <div v-if="marker.description" class="tooltip-desc">
              {{ marker.description }}
            </div>
          </div>
        </LTooltip>

        <!-- Popup - แสดงเมื่อคลิก -->
        <LPopup>
          <div class="marker-popup">
            <h3 class="font-bold text-lg">{{ marker.name }}</h3>
            <p v-if="marker.description" class="text-gray-600">
              {{ marker.description }}
            </p>
            <p class="text-sm text-gray-400 mt-2">
              {{ marker.lat.toFixed(6) }}, {{ marker.lng.toFixed(6) }}
            </p>
          </div>
        </LPopup>
      </LMarker>
    </LMap>

    <!-- Loading placeholder -->
    <template #fallback>
      <div
        :style="{ height: props.height }"
        class="bg-gray-200 flex items-center justify-center"
      >
        <span>กำลังโหลดแผนที่...</span>
      </div>
    </template>
  </ClientOnly>
</template>

<style scoped>
.marker-popup h3 {
  margin: 0 0 8px 0;
}

.marker-popup p {
  margin: 4px 0;
}

.marker-tooltip {
  text-align: center;
}

.marker-tooltip strong {
  display: block;
  font-size: 14px;
  color: #333;
}

.marker-tooltip .tooltip-desc {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
