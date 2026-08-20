import type { NavigationItem } from "./Navigation.types";

export const navigationItems: NavigationItem[] = [
  {
    id: 1,
    label: "முகப்பு",
    path: "/",
  },
  {
    id: 2,
    label: "தமிழ்நாடு",
    path: "/news?scope=STATE&state=tamil-nadu",
  },
  {
    id: 3,
    label: "இந்தியா",
    path: "/news?scope=INDIA",
  },
  {
    id: 4,
    label: "உலகம்",
    path: "/news?scope=WORLD",
  },
  {
    id: 5,
    label: "அரசியல்",
    path: "/news?category=politics",
  },
  {
    id: 6,
    label: "வணிகம்",
    path: "/news?category=business",
  },
  {
    id: 7,
    label: "விளையாட்டு",
    path: "/news?category=sports",
  },
  {
    id: 8,
    label: "தொழில்நுட்பம்",
    path: "/news?category=technology",
  },
  {
    id: 9,
    label: "சினிமா",
    path: "/news?category=cinema",
  },
];
