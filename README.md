# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Project Structure

```
nuxt-template/
├── app/                    # แอพพลิเคชันหลัก
│   ├── app.vue             # Root component ของแอพ
│   ├── assets/             # Static assets ที่จะถูก process โดย build tool
│   │   ├── css/
│   │   │   └── main.css    # Global CSS styles
│   │   └── images/         # รูปภาพที่ใช้ในแอพ
│   ├── components/         # Vue components ที่ใช้ซ้ำได้
│   ├── layouts/            # Layout templates
│   │   ├── auth.vue        # Layout สำหรับหน้า authentication
│   │   └── default.vue     # Layout หลักของแอพ
│   ├── middleware/         # Route middleware
│   ├── pages/              # หน้าเพจต่างๆ (auto-routing)
│   │   ├── index.vue       # หน้าแรก (/)
│   │   ├── Home.vue        # หน้า Home (/home)
│   │   └── Login.vue       # หน้า Login (/login)
│   ├── plugins/            # Nuxt plugins
│   └── utils/              # Utility functions
├── public/                 # Static files (ไม่ถูก process)
│   └── robots.txt          # SEO robots configuration
├── nuxt.config.ts          # Nuxt configuration
├── package.json            # Dependencies และ scripts
├── tsconfig.json           # TypeScript configuration
└── vuetify.config.ts       # Vuetify UI framework configuration
```

### คำอธิบายโฟลเดอร์

| โฟลเดอร์ | คำอธิบาย |
|----------|----------|
| `app/` | โฟลเดอร์หลักที่เก็บโค้ดของแอพพลิเคชัน |
| `assets/` | ไฟล์ static เช่น CSS, รูปภาพ ที่จะถูก process โดย Vite |
| `components/` | Vue components ที่สามารถใช้ซ้ำได้ (auto-import) |
| `layouts/` | Template layouts สำหรับห่อหน้าเพจต่างๆ |
| `middleware/` | Route middleware สำหรับจัดการ navigation |
| `pages/` | หน้าเพจที่จะถูกสร้าง route อัตโนมัติ |
| `plugins/` | Plugins ที่ต้องการ run ก่อน Vue app |
| `utils/` | Helper functions และ utilities |
| `public/` | Static files ที่จะ serve โดยตรง |

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
