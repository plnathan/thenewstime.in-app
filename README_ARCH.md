## Folder structure:

src
│
├── api
│ axios.ts
│
├── assets
│
├── components
│ common
│ Button.tsx
│ Loader.tsx
│ Pagination.tsx
│ EmptyState.tsx
│
├── features
│
│ news
│ api
│ news.api.ts
│
│ components
│ NewsCard.tsx
│ NewsGrid.tsx
│ NewsFilters.tsx
│
│ hooks
│ useNews.ts
│
│ pages
│ HomePage.tsx
│ NewsDetailPage.tsx
│
│ types
│ news.types.ts
│
├── layouts
│ MainLayout.tsx
│
├── routes
│ AppRoutes.tsx
│
├── utils
│
├── App.tsx
└── main.tsx

Technology

Since this is production, I'd use:

✔ React 19

✔ TypeScript

✔ Tailwind CSS

✔ Axios

✔ React Router

✔ TanStack Query

✔ React Hook Form

✔ Zod

✔ Context API

✔ Lazy Loading

✔ Code Splitting

✔ Skeleton Loading

✔ Environment Variables

✔ Reusable Components

## News Details architecture

src/
├── api/
│ └── news.api.ts
│
├── components/
│ └── news/
│ ├── NewsDetail/
│ │ ├── NewsDetail.tsx
│ │ ├── NewsDetail.types.ts
│ │ └── index.ts
│ │
│ ├── NewsDetailHeader/
│ │ ├── NewsDetailHeader.tsx
│ │ └── NewsDetailHeader.types.ts
│ │
│ ├── NewsContent/
│ │ ├── NewsContent.tsx
│ │ └── NewsContent.types.ts
│ │
│ └── RelatedNews/
│ ├── RelatedNews.tsx
│ └── RelatedNews.types.ts
│
├── pages/
│ └── NewsDetailPage/
│ └── NewsDetailPage.tsx
│
└── hooks/
└── useNewsDetail.ts

PostgreSQL
↓
news.repository.ts
↓
mapNews()
↓
news.service.ts
↓
NewsResponseDto
↓
Axios
↓
useNews()
↓
News / NewsView
↓
HomePage

## Data Flow

PostgreSQL
↓
news.repository.ts
↓
mapNews()
↓
News
↓
news.service.ts
↓
news.controller.ts
↓
toNewsResponseDto()
↓
REST API
↓
news.api.ts
↓
useNews()
↓
toNewsView()
↓
NewsView
↓
HomePage
↓
Hero / News Sections / News Cards

## Frontend media architecture:

                    ┌────────────────────┐
                    │   Admin Create      │
                    └─────────┬──────────┘
                              │
                         Create News
                              │
                              ▼
                         News ID
                              │
                              ▼
                    ┌────────────────────┐
                    │ NewsMediaUploader  │
                    └─────────┬──────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
                 Upload               Preview
                    │                    │
                    ▼                    ▼
                 API              NewsMediaItem
                    │                    │
                    ▼             ┌──────┴──────┐
               Cloudinary       Delete       Reorder

## Public:

                    News API
                       │
                       ▼
                 News + media[]
                       │
              ┌────────┴────────┐
              │                 │
         Primary image      Article media
              │                 │
              ▼                 ▼
       Homepage Hero       News Detail
       Homepage Card           │
                               │
                  ┌────────────┼────────────┐
                  │            │            │
                1 image      2–3         4+
                  │            │            │
                  ▼            ▼            ▼
               Top image   Inline imgs   Carousel

## deployment architecture

thenewstime.in
│
▼
┌─────────────────────────┐
│ Frontend │
│ React + Vite │
│ Vercel │
│ │
│ / │
│ /news/:slug │
│ /admin/news │ ← React Router
│ /admin/news/create │
│ /admin/news/:id/edit │
└─────────────────────────┘

Backend
│
▼
┌─────────────────────────┐
│ Node + Express │
│ Vercel │
│ │
│ /api/v1/news │
│ /api/v1/media │
│ etc. │
└─────────────────────────┘

/////////////////////
HomePage
↓
useNews({ publicOnly: true })
↓
getPublishedNewsList()
↓
GET /api/v1/news/public
↓
getPublishedNewsList()
↓
repository.findAll({
status: "PUBLISHED"
})
↓
PostgreSQL
↓
ONLY PUBLISHED

## Canonical feed

PUBLISHED news
↓
ORDER BY published_at DESC
↓
STATE → INDIA → WORLD → DISTRICT
↓
┌─────────────────────────────┐
│ HeroCarousel │ first 5
├─────────────────────────────┤
│ சமீபத்திய செய்திகள் │ next 10
├─────────────────────────────┤
│ தமிழ்நாடு │ remaining STATE
├─────────────────────────────┤
│ இந்தியா │ remaining INDIA
├─────────────────────────────┤
│ உலகம் │ remaining WORLD
├─────────────────────────────┤
│ மாவட்ட செய்திகள் │ remaining DISTRICT
└─────────────────────────────┘

---

Published API
│
│ published_at DESC
▼
┌──────────────────────┐
│ 50 articles │
└──────────────────────┘
│
├───────────────► Hero
│ 5
│
├───────────────► Latest
│ 10
│
└───────────────► Remaining
geographical sections

-------------------------
Home
│
├── Hero
│   └── 5 articles
│
├── சமீபத்திய செய்திகள்
│   └── articles 6–15
│       └── அனைத்தையும் பார்க்க
│             ↓
│           /news
│
├── தமிழ்நாடு
│   └── STATE + Tamil Nadu
│       └── மேலும்
│             ↓
│           /news?scope=STATE&stateId=<TN_ID>
│
├── இந்தியா
│   └── INDIA
│       └── மேலும்
│             ↓
│           /news?scope=INDIA
│
├── உலகம்
│   └── WORLD
│       └── மேலும்
│             ↓
│           /news?scope=WORLD
│
└── மாவட்ட செய்திகள்
    └── DISTRICT
        └── மேலும்
              ↓
            /news?scope=DISTRICT