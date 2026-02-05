<script setup lang="ts">
import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LTooltip,
  LIcon,
} from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

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
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [13.7563, 100.5018], // Bangkok
  zoom: 13,
  markers: () => [],
  height: '400px',
})

// Emits
const emit = defineEmits<{
  markerClick: [marker: Marker]
  mapClick: [latlng: { lat: number; lng: number }]
}>()

// State
const mapRef = ref<InstanceType<typeof LMap> | null>(null)

// Icon URLs แยกตามประเภท
const icons = {
  saved: {
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  },
  search: {
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  },
  pending: {
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  },
}

// Methods
const getIconUrl = (type?: string) => {
  return icons[type as keyof typeof icons]?.url || icons.saved.url
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
          :icon-url="getIconUrl(marker.type)"
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
