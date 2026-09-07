# Taklifnoma — Telegram Mini App

Bu loyiha — foydalanuvchilar o'zlari online to'y taklifnomasi yaratadigan Telegram
Mini App (momento.uz'ga o'xshash, lekin self-service konstruktor). To'liq spec
`docs/superpowers/specs/` papkasida joylashadi. Ushbu fayl — kod yozishda
so'zsiz amal qilinadigan arxitektura va sifat qoidalari.

## Asosiy komponentlar

1. **Bot** — grammY (TypeScript). Mini App'ni ochadi, RSVP bildirishnomalarini yuboradi.
2. **Backend API** — Fastify (TypeScript) + Prisma + SQLite (lokal dev; keyin Postgres'ga ko'chiriladi).
3. **Builder Mini App** — React + Vite + Telegram WebApp SDK. Faqat Telegram ichida ishlaydi.
4. **Public Invitation Site** — server-rendered ochiq veb-sahifa (`/{slug}`), Telegram shart emas.

## Qat'iy qoidalar (hech qachon buzilmaydi)

### 1. Clean Architecture — backend

```
src/
  domain/          # Entity va biznes qoidalar. Hech qanday framework/DB/HTTP import qilinmaydi.
  application/     # Use-case'lar (masalan CreateInvitation, SubmitRsvp). domain'ga bog'liq,
                    # infratuzilmani interfeys (port) orqali chaqiradi.
  infrastructure/  # Prisma repository implementatsiyalari, Telegram Bot API client, tashqi servislar.
                    # application qatlamidagi interfeyslarni amalga oshiradi.
  presentation/    # Fastify route/controller. Faqat so'rovni validatsiya qilib use-case'ga uzatadi,
                    # biznes logika yozilmaydi.
  shared/
    constants/     # Barcha "sehrli qiymatlar" shu yerda: musiqa ro'yxati, shablon konfiguratsiyasi,
                    # RSVP status enum'lari, route yo'llari, limitlar va h.k.
```

Qoida: yuqori qatlam pastki qatlamni bilmaydi (presentation → application → domain), lekin
hech qachon aksincha emas. `domain/` papkasida `import` orqali Prisma, Fastify yoki Telegraf
ko'rinmasligi kerak.

### 2. Modular/feature-based tuzilma — frontend (Mini App)

```
src/
  components/      # Faqat UI (props orqali ishlaydi, ichida biznes logika yo'q — "dumb components")
  features/
    home/          # Har bir tab/ekran — o'zining component, hook va state'i bilan izolyatsiyalangan
    guests/
    settings/
    builder/
  services/        # API client, Telegram WebApp SDK wrapper — tashqi dunyo bilan yagona aloqa nuqtasi
  constants/       # Tab konfiguratsiyasi, route nomlari, musiqa ro'yxati, limitlar
  locales/         # Ko'p tillilik (pastga qarang)
```

Bir feature papkasi ichidagi kod boshqa feature'ga to'g'ridan-to'g'ri bog'lanmaydi — umumiy
narsa kerak bo'lsa `components/` yoki `services/` ga chiqariladi.

### 3. Hardcode qilish taqiqlanadi

- Matn, URL, limit, ro'yxat, konfiguratsiya qiymati — hech qachon to'g'ridan-to'g'ri komponent/
  funksiya ichiga yozilmaydi. Har doim `constants/` yoki `locales/` dan olinadi.
- Agar bir xil qiymat 2 martadan ko'p ishlatilsa — darhol konstantaga chiqariladi.
- Konfiguratsiya (masalan shablon ro'yxati, musiqa fayllari) kod emas, ma'lumot sifatida
  saqlanadi (`constants/templates.ts`, `constants/music.ts` kabi).

### 4. Ko'p tillilik — har bir til uchun alohida fayl

```
locales/
  uz.json   # standart til, MVP'da to'liq to'ldiriladi
  ru.json   # bo'sh/qisman bo'lishi mumkin, lekin struktura tayyor bo'ladi
  en.json
```

- `i18next` ishlatiladi (frontend, bot xabarlari va public sahifa uchun bir xil yondashuv).
- Kod ichida hech qachon qattiq matn yozilmaydi — faqat kalit orqali: `t("home.createButton")`.
- Yangi til qo'shish = yangi JSON fayl qo'shish. Komponent/logika kodi o'zgarmasligi kerak.

### 5. Umumiy sifat qoidalari

- TypeScript `strict` rejimida, `any` ishlatilmaydi.
- Har bir use-case, repository, servis — interfeys orqali ajratiladi (test uchun mock qilish oson bo'lishi kerak).
- Bitta fayl/funksiya bitta mas'uliyatga ega bo'ladi (Single Responsibility) — katta fayl
  ko'rinishi "bo'lib tashlash kerak" degan signal.
- Vaqtinchalik/placeholder kod, TODO qoldirib ketilgan yarim ishlar yozilmaydi.

## Texnologiyalar (qisqacha)

| Qism | Texnologiya |
|---|---|
| Bot | grammY + TypeScript |
| Backend | Fastify + TypeScript + Prisma + SQLite |
| Builder Mini App | React + Vite + Telegram WebApp SDK |
| Public sahifa | Server-rendered (backend bilan bir joyda yoki alohida SSR) |
| i18n | i18next, `locales/<til>.json` |
