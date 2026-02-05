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

// รายการผลการค้นหา (แสดงให้เลือก)
interface SearchResultItem {
  lat: number
  lng: number
  name: string
  displayName: string
}
const searchResults = ref<SearchResultItem[]>([])

// หมุดชั่วคราวจากการคลิกแผนที่ (สีเทา)
const pendingMapMarker = ref<MarkerData | null>(null)

// รวม markers ทั้งหมดสำหรับแสดงในแผนที่
const allMarkers = computed(() => {
  const markers = [...savedMarkers.value]
  if (searchResult.value) {
    markers.push(searchResult.value)
  }
  if (pendingMapMarker.value) {
    markers.push(pendingMapMarker.value)
  }
  return markers
})

const center = ref<[number, number]>([13.702958, 100.543576]) // CDG House, Bangkok
const selectedMarker = ref<MarkerData | null>(null)

// Dialog รวมสำหรับเพิ่ม/บันทึกหมุด
const showMarkerDialog = ref(false)
const markerDialogSource = ref<'map' | 'search'>('map')
const pendingMarkerLocation = ref<{ lat: number; lng: number } | null>(null)
const markerForm = ref({
  name: '',
  description: '',
})

// ตำแหน่งที่จะบันทึก (มาจากคลิกแผนที่หรือผลค้นหา)
const dialogLocation = computed(() => {
  if (markerDialogSource.value === 'search' && searchResult.value) {
    return { lat: searchResult.value.lat, lng: searchResult.value.lng }
  }
  return pendingMarkerLocation.value
})

// หัว dialog
const dialogTitle = computed(() => {
  return markerDialogSource.value === 'search' ? 'บันทึกหมุดจากผลค้นหา' : 'เพิ่มหมุดใหม่'
})

// icon และ color ของ dialog
const dialogIcon = computed(() => {
  return markerDialogSource.value === 'search' ? 'mdi-content-save' : 'mdi-map-marker-plus'
})

const dialogColor = computed(() => {
  return markerDialogSource.value === 'search' ? 'success' : 'primary'
})

// เมื่อคลิกที่ marker
const onMarkerClick = (marker: MarkerData) => {
  selectedMarker.value = marker
}

// เมื่อคลิกที่แผนที่ (แสดงหมุดชั่วคราวก่อน)
const onMapClick = (latlng: { lat: number; lng: number }) => {
  pendingMapMarker.value = {
    id: `pending-${Date.now()}`,
    lat: latlng.lat,
    lng: latlng.lng,
    name: 'ตำแหน่งที่เลือก',
    description: '',
    type: 'pending',
  }
}

// เปิด dialog บันทึกหมุดจากการคลิกแผนที่
const savePendingMapMarker = () => {
  if (!pendingMapMarker.value) return
  
  pendingMarkerLocation.value = {
    lat: pendingMapMarker.value.lat,
    lng: pendingMapMarker.value.lng,
  }
  markerForm.value = { name: '', description: '' }
  markerDialogSource.value = 'map'
  showMarkerDialog.value = true
}

// ยกเลิกหมุดชั่วคราวจากการคลิกแผนที่
const clearPendingMapMarker = () => {
  pendingMapMarker.value = null
}

// ยืนยันบันทึกหมุด
const confirmSaveMarker = () => {
  if (!dialogLocation.value || !markerForm.value.name.trim()) return

  const newMarker: MarkerData = {
    id: Date.now(),
    lat: dialogLocation.value.lat,
    lng: dialogLocation.value.lng,
    name: markerForm.value.name.trim(),
    description: markerForm.value.description.trim() || '',
    type: 'saved',
  }
  savedMarkers.value.push(newMarker)
  
  // ถ้ามาจากผลค้นหา ให้ลบผลค้นหาด้วย
  if (markerDialogSource.value === 'search') {
    searchResult.value = null
  } else {
    // ถ้ามาจากคลิกแผนที่ ให้ลบ pending marker ด้วย
    pendingMapMarker.value = null
  }
  
  closeMarkerDialog()
}

// ปิด dialog
const closeMarkerDialog = () => {
  showMarkerDialog.value = false
  pendingMarkerLocation.value = null
  markerForm.value = { name: '', description: '' }
}

// ค้นหาสถานที่ (ใช้ Nominatim - ฟรี)
const searchQuery = ref('')
const isSearching = ref(false)
const SEARCH_TIMEOUT = 10000 // 10 วินาที

const searchLocation = async () => {
  if (!searchQuery.value.trim()) return

  isSearching.value = true
  searchResults.value = [] // ล้างผลการค้นหาเก่า
  searchResult.value = null // ล้างผลที่เลือกไว้
  
  // สร้าง AbortController สำหรับ timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), SEARCH_TIMEOUT)
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=5&countrycodes=th`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'NuxtMapApp/1.0', // Nominatim ต้องการ User-Agent
        },
      }
    )
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    
    const data = await response.json()

    if (data.length > 0) {
      // เก็บผลการค้นหาทั้งหมด
      searchResults.value = data.map((result: any) => ({
        lat: Number.parseFloat(result.lat),
        lng: Number.parseFloat(result.lon),
        name: result.display_name.split(',')[0],
        displayName: result.display_name,
      }))
    } else {
      alert('ไม่พบสถานที่')
    }
  } catch (error) {
    clearTimeout(timeoutId)
    console.error('Search error:', error)
    
    if (error instanceof Error && error.name === 'AbortError') {
      alert('การค้นหาใช้เวลานานเกินไป กรุณาลองใหม่')
    } else {
      alert('เกิดข้อผิดพลาดในการค้นหา')
    }
  } finally {
    isSearching.value = false
  }
}

// เลือกผลการค้นหา
const selectSearchResult = (item: SearchResultItem) => {
  center.value = [item.lat, item.lng]
  searchResult.value = {
    id: `search-${Date.now()}`,
    lat: item.lat,
    lng: item.lng,
    name: item.name,
    description: item.displayName,
    type: 'search',
  }
  searchResults.value = [] // ล้างรายการหลังเลือก
}

// เปิด dialog บันทึกผลค้นหา
const saveSearchResult = () => {
  if (!searchResult.value) return
  
  // ตั้งค่าเริ่มต้นจากผลค้นหา
  markerForm.value = {
    name: searchResult.value.name,
    description: searchResult.value.description || '',
  }
  markerDialogSource.value = 'search'
  showMarkerDialog.value = true
}

// ยกเลิกผลค้นหา
const clearSearchResult = () => {
  searchResult.value = null
  searchResults.value = []
}

// Headers สำหรับ data table
const tableHeaders = [
  { title: 'ชื่อโครงการ', key: 'name', sortable: true, cellProps: { class: 'text-start' }, align: 'center' as const },
  { title: 'รายละเอียด', key: 'description', sortable: false, cellProps: { class: 'text-start' }, align: 'center' as const },
  { title: 'ละติจูด', key: 'lat', sortable: true, cellProps: { class: 'text-center' }, align: 'center' as const },
  { title: 'ลองจิจูด', key: 'lng', sortable: true, cellProps: { class: 'text-center' }, align: 'center' as const },
  { title: 'จัดการ', key: 'actions', sortable: false, align: 'center' as const },
]

// ไปที่ตำแหน่ง marker
const goToMarker = (marker: MarkerData) => {
  center.value = [marker.lat, marker.lng]
  selectedMarker.value = marker
}

// ลบ marker
const deleteMarker = (marker: MarkerData) => {
  const index = savedMarkers.value.findIndex(m => m.id === marker.id)
  if (index > -1) {
    savedMarkers.value.splice(index, 1)
    if (selectedMarker.value?.id === marker.id) {
      selectedMarker.value = null
    }
  }
}
</script>

<template>
  <v-container>
    <AppHeader class="text-h4 mb-4" title="แผนที่โครงการ" icon="mdi-map-search" />
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

    <!-- รายการผลการค้นหา -->
    <v-card v-if="searchResults.length > 0" class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-format-list-bulleted</v-icon>
        ผลการค้นหา ({{ searchResults.length }} รายการ)
      </v-card-title>
      <v-list>
        <v-list-item
          v-for="(item, index) in searchResults"
          :key="index"
          @click="selectSearchResult(item)"
          class="cursor-pointer"
        >
          <template #prepend>
            <v-icon color="amber">mdi-map-marker</v-icon>
          </template>
          <v-list-item-title>{{ item.name }}</v-list-item-title>
          <v-list-item-subtitle class="text-truncate">
            {{ item.displayName }}
          </v-list-item-subtitle>
          <template #append>
            <v-btn icon size="small" variant="text" color="primary">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- แผนที่ -->
    <v-card class="mb-4">
      <Map
        :center="center"
        :markers="allMarkers"
        :zoom="14"
        :selected-marker-id="selectedMarker?.id"
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

    <!-- หมุดจากการคลิกแผนที่ (ยังไม่บันทึก) -->
    <v-card v-if="pendingMapMarker" class="mb-4" color="grey-lighten-3">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="grey-darken-1">mdi-map-marker-plus</v-icon>
        ตำแหน่งที่เลือก (ยังไม่บันทึก)
      </v-card-title>
      <v-card-text>
        <p class="text-caption text-grey">
          พิกัด: {{ pendingMapMarker.lat.toFixed(6) }}, {{ pendingMapMarker.lng.toFixed(6) }}
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" color="grey" @click="clearPendingMapMarker">
          <v-icon left>mdi-close</v-icon>
          ยกเลิก
        </v-btn>
        <v-btn variant="flat" color="primary" @click="savePendingMapMarker">
          <v-icon left>mdi-content-save</v-icon>
          บันทึกหมุด
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Dialog เพิ่ม/บันทึกหมุด (ใช้ร่วมกัน) -->
    <v-dialog v-model="showMarkerDialog" max-width="1000" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" :color="dialogColor">{{ dialogIcon }}</v-icon>
          {{ dialogTitle }}
        </v-card-title>

        <v-card-text>
          <!-- Mini Map แสดงตำแหน่ง -->
          <div v-if="dialogLocation" class="mini-map-container mb-4">
            <Map
              :center="[dialogLocation.lat, dialogLocation.lng]"
              :markers="[{
                id: 'preview',
                lat: dialogLocation.lat,
                lng: dialogLocation.lng,
                name: 'ตำแหน่งที่จะบันทึก',
                description: '',
                type: markerDialogSource === 'search' ? 'search' : 'pending'
              }]"
              :zoom="16"
              height="300px"
            />
          </div>

          <!-- แสดงพิกัด -->
          <v-alert v-if="dialogLocation" type="info" variant="tonal" density="compact" class="mb-4">
            📍 พิกัด: {{ dialogLocation.lat.toFixed(6) }}, {{ dialogLocation.lng.toFixed(6) }}
          </v-alert>

          <v-text-field
            v-model="markerForm.name"
            label="ชื่อโครงการ *"
            placeholder="กรอกชื่อโครงการ"
            variant="outlined"
            density="compact"
            :rules="[(v) => !!v.trim() || 'กรุณากรอกชื่อโครงการ']"
            class="mb-2"
          />

          <v-textarea
            v-model="markerForm.description"
            label="รายละเอียด"
            placeholder="กรอกรายละเอียดโครงการ (ไม่บังคับ)"
            variant="outlined"
            density="compact"
            rows="3"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeMarkerDialog">
            ยกเลิก
          </v-btn>
          <v-btn
            :color="dialogColor"
            variant="flat"
            :disabled="!markerForm.name.trim()"
            @click="confirmSaveMarker"
          >
            <v-icon left>mdi-check</v-icon>
            ยืนยันบันทึก
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ข้อมูล marker ที่เลือก -->
    <v-card v-if="selectedMarker" class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon left color="error">mdi-map-marker</v-icon>
        {{ selectedMarker.name }}
        <v-spacer />
        <v-btn
          icon
          size="small"
          variant="text"
          @click="selectedMarker = null"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
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
      <div>💡 คลิกที่แผนที่เพื่อเลือกตำแหน่ง แล้วกดบันทึก</div>
      <div>💡 คลิกที่หมุดเพื่อดูข้อมูลโครงการ</div>
      <div class="mt-2">
        <v-chip size="small" color="blue" class="mr-2">🔵 บันทึกแล้ว</v-chip>
        <v-chip size="small" color="amber" class="mr-2">🟡 ผลค้นหา</v-chip>
        <v-chip size="small" color="grey">⚫ คลิกจากแผนที่</v-chip>
      </div>
    </v-alert>

    <!-- ตารางรายการ markers ที่บันทึกแล้ว -->
    <v-card class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="blue">mdi-format-list-bulleted</v-icon>
        รายการโครงการที่บันทึก ({{ savedMarkers.length }} รายการ)
      </v-card-title>
      <v-data-table
        :headers="tableHeaders"
        :items="savedMarkers"
        :items-per-page="5"
        class="elevation-0"
        hover
      >
        <template #item.lat="{ item }">
          {{ item.lat.toFixed(6) }}
        </template>
        <template #item.lng="{ item }">
          {{ item.lng.toFixed(6) }}
        </template>
        <template #item.description="{ item }">
          <span class="text-truncate d-inline-block" style="max-width: 200px;">
            {{ item.description || '-' }}
          </span>
        </template>
        <template #item.actions="{ item }">
          <v-btn
            icon
            size="small"
            variant="text"
            color="primary"
            @click="goToMarker(item)"
            title="ไปที่ตำแหน่ง"
          >
            <v-icon>mdi-crosshairs-gps</v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            color="error"
            @click="deleteMarker(item)"
            title="ลบ"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <template #no-data>
          <div class="text-center py-4 text-grey">
            <v-icon size="48" color="grey-lighten-1">mdi-map-marker-off</v-icon>
            <p class="mt-2">ยังไม่มีโครงการที่บันทึก</p>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
