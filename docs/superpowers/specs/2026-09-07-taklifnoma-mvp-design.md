# Taklifnoma — Telegram Mini App MVP

Sana: 2026-09-07

## 1. Maqsad

Foydalanuvchi Telegram bot orqali Mini App'ni ochib, o'zi to'y taklifnomasi
yaratadigan, uni istalgan mehmonga oddiy veb-havola sifatida yubora oladigan
va mehmonlarning ishtirok tasdig'ini (RSVP) yig'a oladigan tizim.

## 2. Kontekst — momento.uz tadqiqoti

`momento.uz` — dizayn agentligi (B & Z Family): mijoz shablon tanlaydi va
buyurtma beradi (200 000 so'm), jamoa 24 soat ichida sahifani **qo'lda**
tayyorlab, alohida havola beradi (`momento.uz/wedding/{id}/{slug}`).
Bu **self-service emas**.

Tayyor taklifnoma sahifasining tarkibi (kuzatilgan): parol/qulf bilan
ochiladigan intro, kelin-kuyov ismi + sana + oyat, "bizning tarix" bo'limi,
jonli countdown taymer, to'y zali (rasmlar + Google/Yandex xarita), RSVP
bo'limi, fon musiqasi, 4 tilli almashtirgich (RU/EN/UZ-lotin/UZ-kirill),
ulashish va QR-kod.

Bizning loyiha shu g'oyadan ilhomlanadi, lekin **to'liq avtomatlashtirilgan
o'z-o'ziga xizmat ko'rsatuvchi konstruktor** sifatida quriladi.

## 3. MVP ko'lami

**Bor:**
- Bitta shablon, faqat **to'y** tadbir turi uchun.
- Foydalanuvchi faqat matn ma'lumot kiritadi (ism, sana, manzil, matn,
  musiqa tanlovi) — rasm yuklash yo'q, tayyor shablon dizayni ishlatiladi.
- Taklifnoma istalgan vaqt tahrirlanadi, o'zgarish bir xil havolada darhol
  ko'rinadi.
- Tayyor taklifnoma — oddiy veb-havola (`/{slug}`), Telegram shart emas,
  istalgan brauzerda ochiladi.
- RSVP: mehmon ochiq sahifada ism kiritib "Kelaman/Kelolmayman" deydi.
- Tashkilotchi RSVP javobini ikki joydan ko'radi: (1) Telegram bot xabari
  darhol keladi, (2) Mini App'ning "Mehmonlar" bo'limida ro'yxat/statistika.
- To'lov yo'q — MVP butunlay bepul.
- Faqat lokal ishlab chiqish muhiti (hosting/domen keyinroq hal qilinadi).

**Yo'q (keyingi bosqichlar uchun qoldiriladi):**
- To'lov tizimi (Click/Payme).
- Bir nechta shablon va boshqa tadbir turlari (tug'ilgan kun, yubiley...).
- Foydalanuvchi tomonidan rasm/gallereya yuklash.
- Ochiq sahifada til almashtirgich (struktura tayyor, kontent faqat `uz`).
- Mehmonlar ro'yxatini import qilish, kengaytirilgan statistika/analitika.

## 4. Arxitektura

Monorepo, 3 ta ishga tushiriladigan komponent + umumiy backend:

```
apps/
  bot/          # grammY (TypeScript) — /start, Mini App ochish, RSVP bildirishnomalari
  backend/      # Fastify (TypeScript) + Prisma + SQLite — Clean Architecture
  miniapp/      # React + Vite + Telegram WebApp SDK — tashkilotchi uchun builder
  public-site/  # Ochiq taklifnoma sahifasi (SSR), Telegram'siz ishlaydi
packages/
  shared/       # Umumiy tip/konstantalar (masalan RSVP status enum) bot/backend/frontend orasida
```

Backend ichki tuzilishi va frontend/i18n qoidalari `CLAUDE.md` faylida
belgilangan (Clean Architecture qatlamlari, modular feature papkalar,
hardcode taqiqi, har til uchun alohida `locales/*.json` fayl). Ushbu spec
o'sha qoidalarga zid kelmaydi — kod yozilganda `CLAUDE.md` asosiy qo'llanma
hisoblanadi.

**Oqim:** Bot → Mini App (builder, faqat Telegram ichida) → Backend API →
DB. Backend public-site'ga ma'lumot beradi → mehmon RSVP yuboradi → Backend
bot orqali tashkilotchiga xabar yuboradi + DB'ga yozadi → Mini App'ning
"Mehmonlar" bo'limi shu ma'lumotni o'qiydi.

## 5. Ma'lumotlar modeli

**Invitation**
| Maydon | Tur | Izoh |
|---|---|---|
| id | string (uuid) | |
| slug | string, unique | Ochiq havola uchun (`/{slug}`) |
| ownerTelegramId | bigint, unique | Bitta foydalanuvchida MVP'da bitta taklifnoma |
| ownerChatId | bigint | Bot bildirishnoma yuborishi uchun |
| groomName | string | |
| brideName | string | |
| eventDateTime | datetime | Sana + vaqt birga |
| venueName | string | |
| venueAddress | string | |
| mapUrl | string, nullable | Foydalanuvchi joylashtirgan Google/Yandex havola |
| greetingText | string, nullable | Bo'sh bo'lsa `locales/uz.json`'dagi standart matn ishlatiladi |
| musicTrackId | string | `constants/music.ts` dagi preset ro'yxatdan kalit |
| createdAt / updatedAt | datetime | |

**RsvpResponse**
| Maydon | Tur | Izoh |
|---|---|---|
| id | string (uuid) | |
| invitationId | string (FK) | |
| guestName | string | |
| status | enum: `COMING` \| `NOT_COMING` | |
| respondedAt | datetime | |

Alohida `User` jadvali MVP'da shart emas — `ownerTelegramId` orqali
tashkilotchi aniqlanadi (Telegram WebApp `initData` orqali tekshiriladi).

## 6. API (use-case'lar)

Barchasi Clean Architecture'dagi `application/` qatlamida alohida use-case
sifatida yoziladi, `presentation/` faqat chaqiradi:

| Endpoint | Use-case | Kim chaqiradi |
|---|---|---|
| `POST /api/invitations` | CreateInvitation | Mini App (birinchi marta) |
| `GET /api/invitations/me` | GetMyInvitation | Mini App (Bosh sahifa) |
| `PUT /api/invitations/me` | UpdateInvitation | Mini App (Tahrirlash) |
| `GET /api/invitations/me/guests` | ListGuests | Mini App (Mehmonlar tab) |
| `GET /api/public/invitations/:slug` | GetInvitationBySlug | Public sahifa (SSR) |
| `POST /api/public/invitations/:slug/rsvp` | SubmitRsvp | Public sahifa (mehmon) |

`SubmitRsvp` bajarilgach, use-case ichida `NotifyOwner` porti chaqiriladi —
uni `infrastructure/` qatlamidagi Telegram Bot client amalga oshiradi
(shu orqali application qatlami Telegram API'ni bilmaydi).

Autentifikatsiya: Mini App so'rovlari Telegram `initData` bilan yuboriladi,
backend uni Telegram bot tokeni bilan tekshiradi (HMAC validatsiya). Public
endpoint'lar autentifikatsiyasiz, lekin RSVP uchun oddiy rate-limit qo'yiladi
(spam'dan himoya).

## 7. Mini App ekranlari

Pastki navigatsiya (3 tab):

1. **Bosh sahifa** — taklifnoma yo'q bo'lsa: namuna + "Taklifnoma yaratish".
   Bor bo'lsa: preview kartochka (sana, status) + Tahrirlash/Ko'rish/Ulashish
   (havola + QR) tugmalari.
2. **Mehmonlar** — umumiy hisob ("N kishi keladi, M kishi kelmaydi") +
   javob berganlar ro'yxati (ism, status, vaqt). Bo'sh holat: "Hali hech kim
   javob bermagan".
3. **Sozlamalar** — Yordam/Aloqa, taklifnomani o'chirish. (Til tanlash —
   keyingi bosqich, struktura tayyor.)

**Builder forma** (Bosh sahifadan ochiladi, tab emas), qadamlar:
1. Kelin va kuyov ismlari
2. Sana va vaqt
3. To'y zali nomi + manzil + xarita havolasi
4. Tabrik matni / oyat (ixtiyoriy)
5. Fon musiqasi tanlash (tayyor treklardan biri, tinglab ko'rish tugmasi bilan)

Saqlagach — **Natija ekrani**: havola, QR-kod, Nusxalash/Ulashish/Ko'rish
tugmalari.

**Tahrirlash** — xuddi Builder forma, mavjud ma'lumot bilan oldindan
to'ldirilgan, "Yangilash" bosilganda bir xil havoladagi sahifa yangilanadi.

## 8. Ochiq taklifnoma sahifasi (public site)

Bitta uzluksiz scroll sahifa, bo'limlar:

1. **Hero** — kelin-kuyov ismi, sana (masalan "11-noyabr, 2026-yil,
   chorshanba"), tabrik matni.
2. **Countdown** — kun/soat/daqiqa/soniya jonli hisoblagich.
3. **To'y zali** — nomi, manzili, xarita havolasi (Google/Yandex tugmalari).
4. **RSVP forma** — ism kiritish + "Kelaman" / "Kelolmayman" tugmalari,
   yuborilgach tashakkur xabari ko'rsatiladi.
5. **Fon musiqasi** — floating tugma (yoqish/o'chirish), avtoplay yo'q
   (brauzer siyosati bo'yicha foydalanuvchi bosishi kerak).

MVP'da parol/qulf intro, gallereya, "bizning tarix" bo'limi va til
almashtirgich — yo'q (keyingi bosqich).

## 9. Testlash yondashuvi

- **Domain va application qatlamlari** (backend) — Vitest bilan unit test,
  Prisma/Fastify'siz, mock repository/notifier orqali. Clean Architecture
  aynan shuni osonlashtirish uchun tanlangan.
- **API integratsiya testlari** — fayl-asosli SQLite test DB bilan asosiy
  oqimlar: taklifnoma yaratish → RSVP yuborish → Mehmonlar ro'yxatida
  ko'rinishi.
- **Mini App va public sahifa** — MVP bosqichida qo'lda tekshiriladi
  (Telegram WebApp debug rejimi + brauzerda public havola), avtomatik UI
  test talab qilinmaydi.

## 10. Keyingi bosqichlar (ushbu spec doirasidan tashqari)

To'lov integratsiyasi, qo'shimcha shablonlar va tadbir turlari, rasm
yuklash, ochiq sahifada til almashtirgich, hosting/domen sozlash — har biri
alohida spec/reja sifatida keyinroq brainstorm qilinadi.
