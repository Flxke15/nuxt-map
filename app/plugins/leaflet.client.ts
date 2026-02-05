import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default defineNuxtPlugin(() => {
  // Fix Leaflet default icon issue
  // This is a known issue when using Leaflet with bundlers like Vite/Webpack
  delete (L.Icon.Default.prototype as any)._getIconUrl

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
})
