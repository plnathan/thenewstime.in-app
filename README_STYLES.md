| Pixels |       rem |
| -----: | --------: |
|    1px | 0.0625rem |
|    2px |  0.125rem |
|    4px |   0.25rem |
|    6px |  0.375rem |
|    8px |    0.5rem |
|   10px |  0.625rem |
|   12px |   0.75rem |
|   14px |  0.875rem |
|   16px |      1rem |
|   20px |   1.25rem |
|   24px |    1.5rem |
|   28px |   1.75rem |
|   32px |      2rem |
|   40px |    2.5rem |
|   48px |      3rem |
|   64px |      4rem |

Use rem for belows:

font-size

padding

margin

gap

border-radius

width

height

## CSS Flow:

src/

index.css <-- Entry point

styles/
index.css <-- Imports all application styles

    globals.css
    typography.css
    utilities.css
    animations.css
    scrollbar.css

---

main.tsx
│
▼
index.css
│
▼
@import "tailwindcss"

@import "./styles/index.css"

     │
     ▼

globals.css

typography.css

utilities.css

animations.css

scrollbar.css

## New Homepage Architecture

<HomePage>

    <MainLayout>

        <Header />

        <BreakingTicker />

        <HeroSection />

        <HomeGrid>

            <MainContent>

                <LatestNewsSection />

                <TamilNaduSection />

                <IndiaSection />

                <WorldSection />

            </MainContent>

            <Sidebar>

                <TrendingNews />

                <MostRead />

                <Advertisement />

            </Sidebar>

        </HomeGrid>

        <Footer />

    </MainLayout>

</HomePage>

## Responsive Breakpoints

Mobile

0–639px

────────────

Tablet

640–1023px

────────────

Laptop

1024–1279px

────────────

Desktop

1280+

---

src/
├── layouts/
│ └── MainLayout/
│ ├── MainLayout.tsx
│ ├── MainLayout.types.ts
│ └── index.ts
│
├── components/
│ ├── container/
│ │ ├── AppContainer/
│ │ │ ├── AppContainer.tsx
│ │ │ └── index.ts
│ │ │
│ │ └── MainContent/
│ │ ├── MainContent.tsx
│ │ └── index.ts
│ │
│ └── home/
│ └── HomeGrid/
│ ├── HomeGrid.tsx
│ └── index.ts
