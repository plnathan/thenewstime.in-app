## Frontend folder structure

src/
├── api/
│ └── advertisements/
│ ├── advertisements.api.ts
│ └── ...
│
├── components/
│ └── advertisements/
│ └── Advertisement/
│ ├── Client/
│ │ ├── ClientSearch/
│ │ ├── ClientResultCard/
│ │ ├── ClientProfile/
│ │ ├── ClientHoldAlert/
│ │ └── ClientAdvertisementHistory/
│ ├── ...
│ └── ...
│
└── pages/
└── Advertisements/
└── Advertisement/
├── AdvertisementManagementPage.tsx
├── AdvertisementSearchPage.tsx
└── Client/
└── AdvertisementClientSelectionPage.tsx

## UI Strategy:

Prefer select → search → choose → auto-populate → confirm. Type only when the system genuinely cannot determine the value.

Client → Advertisement → Creative → Placement → Rules → Schedule → Rate Card/Pricing Snapshot → Agreed Amount → Financial Approval/Payment → Delivery → Tracking.

---

| Placement     | Typical shape        | Example creative size |
| ------------- | -------------------- | --------------------: |
| Header banner | Wide                 |            1200 × 150 |
| Top banner    | Wide                 |             970 × 250 |
| Sidebar       | Vertical             |             300 × 600 |
| Sidebar small | Rectangle            |             300 × 250 |
| In-content    | Landscape            |  728 × 90 / 640 × 360 |
| Modal         | Portrait/square-ish  | 600 × 800 / 600 × 600 |
| Mobile banner | Wide/mobile          |             320 × 100 |
| Video         | Depends on placement |            16:9, etc. |

---

## The client should be told what to provide:

This is especially important operationally.

Suppose the Ad Manager selects:

Placement: Homepage → Right Sidebar
Format: Sidebar Rectangle

The UI should tell the Ad Creator/client:

Required creative: 300 × 250 px
Aspect ratio: 6:5
File: JPG / PNG / WebP
Maximum file size: X MB

Then the client supplies artwork according to that specification.

For a modal:

Required creative: 600 × 800 px
Aspect ratio: 3:4

For a header:

Required creative: 1200 × 150 px
Aspect ratio: 8:1

This is much better than allowing arbitrary artwork and trying to make it fit later.
---------------------------
## Desktop / Mobile Ratio:

| Property         | Example  |
| ---------------- | -------- |
| Desktop width    | 1200px   |
| Desktop height   | 150px    |
| Desktop ratio    | 8:1      |
| Mobile width     | 320px    |
| Mobile height    | 100px    |
| Mobile ratio     | 3.2:1    |
| Mobile creative  | Optional |
| Desktop creative | Required |
------------------------------