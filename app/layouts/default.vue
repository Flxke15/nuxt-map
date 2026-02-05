<template>
  <v-app>
    <AppBar />
    <v-main>
      <v-container class="pa-8 default-layout" fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.default-layout {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>