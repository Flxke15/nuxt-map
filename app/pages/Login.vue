<template>
  <v-container class="pa-0" fluid>
    <div class="d-flex justify-center">
      <v-card class="pa-8" width="80%">
        <v-card-title>
          <AppHeader :title="name" class="text-center"/>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <p class="mb-2">ผู้ใช้งาน</p>
              <v-text-field
                v-model="loginData.username"
                placeholder="ชื่อผู้ใช้งาน"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <p class="mb-2">รหัสผ่าน</p>
              <v-text-field
                v-model="loginData.password"
                placeholder="รหัสผ่าน"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-row justify="center">
            <v-col cols="12" sm="3">
              <v-btn
                color="primary"
                variant="tonal"
                size="large"
                width="100%"
                prepend-icon="mdi-login"
                to="/Home"
              >
                เข้าสู่ระบบ
              </v-btn>
            </v-col>
            <v-col cols="12" sm="3">
              <v-btn
                color="red"
                variant="tonal"
                size="large"
                width="100%"
                prepend-icon="mdi-login"
              >
                ไม่มีอะไร
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import AppHeader from '~/components/AppHeader.vue';

definePageMeta({
  layout: 'auth'
})

const defaultLogin = {
  username: '',
  password: ''
}
const loginData = ref(structuredClone(defaultLogin));

const name = ref('ระบบ');
</script>