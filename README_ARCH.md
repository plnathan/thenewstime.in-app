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

Frontend media architecture:
----------------------------
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


Public:
-------
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