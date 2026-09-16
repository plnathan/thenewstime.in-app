src/
├── api/
│ ├── axios.ts ← UPDATE
│ └── auth.api.ts ← NEW
│
├── auth/
│ ├── AuthContext.tsx ← NEW
│ └── auth.storage.ts ← NEW
│
├── pages/
│ └── AdminLogin/
│ └── AdminLoginPage.tsx ← NEW
│
└── router/
├── AppRouter.tsx ← UPDATE
└── ProtectedRoute.tsx ← NEW

---

Request
↓
Authorization: Bearer <accessToken>
↓
API

---

401
↓
refresh token
↓
new access token
↓
retry original request

---

## The application flow:

https://www.thenewstime.in/
│
├── Public website
│
└── /admin/login
│
▼
Admin Login Page
│
POST /auth/login
│
▼
accessToken + refreshToken
│
▼
/admin
│
▼
/admin/news

## Direct access:

https://www.thenewstime.in/admin/news

## Without authentication:

/admin/news
↓
ProtectedRoute
↓
not authenticated
↓
/admin/login

## Token lifecycle

Login
↓
accessToken
refreshToken
↓
local session
↓
Axios adds Bearer token
↓
API request

## When the access token expires:

API request
↓
401
↓
refresh token
↓
new access token
↓
retry original API request

## Auth Flow

                    ┌─────────────────────┐
                    │     AuthContext     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
          auth.api.ts      auth.storage.ts    auth.utils.ts
              │                │                │
              ▼                ▼                ▼
           Axios            localStorage       roles
              │                                 permissions
              ▼
        Backend Security API

## Axios refresh mechanism:
API request
    │
    ▼
Access Token
    │
    ├── valid ───────────────► API response
    │
    └── 401
         │
         ▼
   Refresh Token
         │
    ┌────┴────┐
    │         │
 success     failure
    │         │
    ▼         ▼
new token   clear session
    │         │
    ▼         ▼
retry       /admin/login