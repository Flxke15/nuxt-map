<template>
  <v-app-bar>
    <v-app-bar-title>
       <v-tabs color="primary" align-tabs="center" v-model="selectedMenu">
        <v-tab
          v-for="menu in listMenu"
          :key="menu.id"
          :value="menu.id"
          :to="menu.route"
          >
          <v-icon left>{{ menu.icon }}</v-icon>
          {{ menu.title }}
        </v-tab>
      </v-tabs>
    </v-app-bar-title>
    <template v-slot:append>
      <v-btn icon="mdi-logout" to="/Login"></v-btn>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
const listMenu: Array<{ id: number; title: string; icon: string; route: string }> = [
  { id: 2, title: 'หน้าแรก', icon: 'mdi-home', route: '/Home' },
  { id: 3, title: 'แผนที่โครงการ', icon: 'mdi-map', route: '/MapDemo' },
]

const selectedMenu = ref(listMenu[0]?.id ?? 1)
</script>