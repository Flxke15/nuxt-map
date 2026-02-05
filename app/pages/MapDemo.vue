<script setup lang="ts">
// Type สำหรับ marker
interface MarkerData {
  id: number | string
  lat: number
  lng: number
  name: string
  description?: string
  type?: 'saved' | 'search' | 'pending'
}

// ตัวอย่างข้อมูล markers (บันทึกแล้ว)
const savedMarkers = ref<MarkerData[]>([
  {
    id: 1,
    lat: 13.7563,
    lng: 100.5018,
    name: 'โครงการ A - สยามพารากอน',
    description: 'โครงการพัฒนาพื้นที่การค้า',
    type: 'saved',
  },
  {
    id: 2,
    lat: 13.7469,
    lng: 100.5349,
    name: 'โครงการ B - เอ็มควอเทียร์',
    description: 'โครงการศูนย์การค้าและที่พักอาศัย',
    type: 'saved',
  },
  {
    id: 3,
    lat: 13.7459,
    lng: 100.5396,
    name: 'โครงการ C - เบญจสิริ',
    description: 'โครงการสวนสาธารณะ',
    type: 'saved',
  },
  {
    id: 4,
    lat: 13.702958,
    lng: 100.543576,
    name: 'CDG House',
    description: 'โครงการทดสอบ',
    type: 'saved',
  }
])

// ผลการค้นหา (สีเหลือง)
const searchResult = ref<MarkerData | null>(null)

// รวม markers ทั้งหมดสำหรับแสดงในแผนที่
const allMarkers = computed(() => {
  const markers = [...savedMarkers.value]
  if (searchResult.value) {
    markers.push(searchResult.value)
  }
  return markers
})

const center = ref<[number, number]>([13.7563, 100.5018])
const selectedMarker = ref<MarkerData | null>(null)

// Dialog สำหรับเพิ่มหมุด
const showAddMarkerDialog = ref(false)
const pendingMarkerLocation = ref<{ lat: number; lng: number } | null>(null)
const newMarkerForm = ref({
  name: '',
  description: '',
})

// เมื่อคลิกที่ marker
const onMarkerClick = (marker: MarkerData) => {
  selectedMarker.value = marker
}

// เมื่อคลิกที่แผนที่ (เปิด dialog ยืนยัน)
const onMapClick = (latlng: { lat: number; lng: number }) => {
  pendingMarkerLocation.value = latlng
  newMarkerForm.value = { name: '', description: '' }
  showAddMarkerDialog.value = true
}

// ยืนยันเพิ่มหมุด
const confirmAddMarker = () => {
  if (!pendingMarkerLocation.value || !newMarkerForm.value.name.trim()) return

  const newMarker: MarkerData = {
    id: Date.now(),
    lat: pendingMarkerLocation.value.lat,
    lng: pendingMarkerLocation.value.lng,
    name: newMarkerForm.value.name.trim(),
    description: newMarkerForm.value.description.trim() || '',
    type: 'saved',
  }
  savedMarkers.value.push(newMarker)
  showAddMarkerDialog.value = false
  pendingMarkerLocation.value = null
}

// ยกเลิกเพิ่มหมุด
const cancelAddMarker = () => {
  showAddMarkerDialog.value = false
  pendingMarkerLocation.value = null
  newMarkerForm.value = { name: '', description: '' }
}

// ค้นหาสถานที่ (ใช้ Nominatim - ฟรี)
const searchQuery = ref('')
const isSearching = ref(false)

const searchLocation = async () => {
  if (!searchQuery.value.trim()) return

  isSearching.value = true
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=1`
    )
    const data = await response.json()

    if (data.length > 0) {
      const result = data[0]
      const lat = Number.parseFloat(result.lat)
      const lng = Number.parseFloat(result.lon)

      center.value = [lat, lng]

      // เก็บเป็นผลค้นหา (สีเหลือง) ยังไม่บันทึก
      searchResult.value = {
        id: `search-${Date.now()}`,
        lat,
        lng,
        name: result.display_name.split(',')[0],
        description: result.display_name,
        type: 'search',
      }
    } else {
      alert('ไม่พบสถานที่')
    }
  } catch (error) {
    console.error('Search error:', error)
    alert('เกิดข้อผิดพลาดในการค้นหา')
  } finally {
    isSearching.value = false
  }
}

// บันทึกผลค้นหาเป็น marker ถาวร
const saveSearchResult = () => {
  if (!searchResult.value) return
  
  const saved: MarkerData = {
    ...searchResult.value,
    id: Date.now(),
    type: 'saved',
  }
  savedMarkers.value.push(saved)
  searchResult.value = null
}

// ยกเลิกผลค้นหา
const clearSearchResult = () => {
  searchResult.value = null
}
</script>

<template>
  <v-container>
    <AppHeader class="text-h4 mb-4" title="แผนที่โครงการ" />
    <p>แผนที่โครงการ</p>
    <!-- ช่องค้นหา -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          label="ค้นหาสถานที่..."
          placeholder="เช่น สยามพารากอน, Central World"
          variant="outlined"
          density="compact"
          hide-details
          prepend-inner-icon="mdi-magnify"
          @keyup.enter="searchLocation"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-btn
          :loading="isSearching"
          color="primary"
          block
          @click="searchLocation"
        >
          <v-icon left>mdi-magnify</v-icon>
          ค้นหา
        </v-btn>
      </v-col>
    </v-row>

    <!-- แผนที่ -->
    <v-card class="mb-4">
      <Map
        :center="center"
        :markers="allMarkers"
        :zoom="14"
        height="500px"
        @marker-click="onMarkerClick"
        @map-click="onMapClick"
      />
    </v-card>

    <!-- ผลการค้นหา (ยังไม่บันทึก) -->
    <v-card v-if="searchResult" class="mb-4" color="amber-lighten-4">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="amber-darken-2">mdi-map-marker-question</v-icon>
        ผลการค้นหา (ยังไม่บันทึก)
      </v-card-title>
      <v-card-text>
        <p class="font-weight-bold">{{ searchResult.name }}</p>
        <p class="text-body-2">{{ searchResult.description }}</p>
        <p class="text-caption text-grey">
          พิกัด: {{ searchResult.lat.toFixed(6) }}, {{ searchResult.lng.toFixed(6) }}
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" color="grey" @click="clearSearchResult">
          <v-icon left>mdi-close</v-icon>
          ยกเลิก
        </v-btn>
        <v-btn variant="flat" color="success" @click="saveSearchResult">
          <v-icon left>mdi-content-save</v-icon>
          บันทึกหมุด
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- ข้อมูล marker ที่เลือก -->
    <v-card v-if="selectedMarker" class="mb-4">
      <v-card-title>
        <v-icon left>mdi-map-marker</v-icon>
        {{ selectedMarker.name }}
      </v-card-title>
      <v-card-text>
        <p>{{ selectedMarker.description }}</p>
        <p class="text-caption text-grey">
          พิกัด: {{ selectedMarker.lat.toFixed(6) }},
          {{ selectedMarker.lng.toFixed(6) }}
        </p>
      </v-card-text>
    </v-card>

    <!-- คำแนะนำ -->
    <v-alert type="info" variant="tonal" class="mb-4">
      <div>💡 คลิกที่แผนที่เพื่อเพิ่มหมุดใหม่</div>
      <div>💡 คลิกที่หมุดเพื่อดูข้อมูลโครงการ</div>
      <div class="mt-2">
        <v-chip size="small" color="blue" class="mr-2">🔵 บันทึกแล้ว</v-chip>
        <v-chip size="small" color="amber">🟡 ผลค้นหา (รอยืนยัน)</v-chip>
      </div>
    </v-alert>

    <!-- Dialog เพิ่มหมุดใหม่ -->
    <v-dialog v-model="showAddMarkerDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-map-marker-plus</v-icon>
          เพิ่มหมุดใหม่
        </v-card-title>

        <v-card-text>
          <!-- Mini Map แสดงตำแหน่งที่เลือก -->
          <div v-if="pendingMarkerLocation" class="mini-map-container mb-4">
            <Map
              :center="[pendingMarkerLocation.lat, pendingMarkerLocation.lng]"
              :markers="[{
                id: 'pending',
                lat: pendingMarkerLocation.lat,
                lng: pendingMarkerLocation.lng,
                name: 'ตำแหน่งที่เลือก',
                description: '',
                type: 'pending'
              }]"
              :zoom="16"
              height="200px"
            />
          </div>

          <!-- แสดงพิกัดที่เลือก -->
          <v-alert v-if="pendingMarkerLocation" type="info" variant="tonal" density="compact" class="mb-4">
            📍 พิกัด: {{ pendingMarkerLocation.lat.toFixed(6) }}, {{ pendingMarkerLocation.lng.toFixed(6) }}
          </v-alert>

          <v-text-field
            v-model="newMarkerForm.name"
            label="ชื่อโครงการ *"
            placeholder="กรอกชื่อโครงการ"
            variant="outlined"
            density="compact"
            :rules="[(v) => !!v.trim() || 'กรุณากรอกชื่อโครงการ']"
            class="mb-2"
          />

          <v-textarea
            v-model="newMarkerForm.description"
            label="รายละเอียด"
            placeholder="กรอกรายละเอียดโครงการ (ไม่บังคับ)"
            variant="outlined"
            density="compact"
            rows="3"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancelAddMarker">
            ยกเลิก
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!newMarkerForm.name.trim()"
            @click="confirmAddMarker"
          >
            <v-icon left>mdi-check</v-icon>
            ยืนยันเพิ่มหมุด
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
