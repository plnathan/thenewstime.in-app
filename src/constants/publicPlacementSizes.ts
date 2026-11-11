/** Public placement display sizes in pixels. Tablet: 768–1023px, mobile: <768px. */
export const PUBLIC_PLACEMENT_SIZES = {
  HOME_TOP: {
    desktop: { width: 970, height: 120 },
    tablet: { width: 728, height: 113 },
    mobile: { width: 320, height: 100 },
  },
  HOME_BANNER: {
    desktop: { width: 728, height: 90 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
  },
  HOME_BETWEEN_SECTIONS: {
    desktop: { width: 728, height: 120 },
    tablet: { width: 728, height: 120 },
    mobile: { width: 320, height: 100 },
  },
  HOME_SIDEBAR: {
    desktop: { width: 300, height: 600 },
    tablet: { width: 300, height: 600 },
    mobile: { width: 300, height: 250 },
  },
  HOME_BOTTOM: {
    desktop: { width: 728, height: 90 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
  },
  HOME_MODAL: {
    desktop: { width: 600, height: 400 },
    tablet: { width: 540, height: 360 },
    mobile: { width: 320, height: 280 },
  },
  NEWS_LIST_TOP: {
    desktop: { width: 970, height: 120 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
  },

  NEWS_LIST_BANNER: {
    desktop: { width: 728, height: 90 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
  },
  NEWS_LIST_SIDEBAR: {
    desktop: { width: 300, height: 600 },
    tablet: { width: 300, height: 600 },
    mobile: { width: 300, height: 250 },
  },
  NEWS_LIST_BETWEEN: {
    desktop: { width: 728, height: 90 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
  },
  NEWS_LIST_BOTTOM: {
    desktop: { width: 728, height: 90 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
  },
  NEWS_LIST_MODAL: {
    desktop: { width: 600, height: 400 },
    tablet: { width: 540, height: 360 },
    mobile: { width: 320, height: 280 },
  },
  NEWS_DETAIL_TOP: {
    desktop: { width: 970, height: 120 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
  },

  NEWS_DETAIL_BANNER: {
    desktop: { width: 728, height: 90 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
  },
  NEWS_DETAIL_SIDEBAR: {
    desktop: { width: 300, height: 600 },
    tablet: { width: 300, height: 600 },
    mobile: { width: 300, height: 250 },
  },
  NEWS_DETAIL_BETWEEN: {
    desktop: { width: 728, height: 120 },
    tablet: { width: 728, height: 120 },
    mobile: { width: 320, height: 100 },
  },
  NEWS_DETAIL_BOTTOM: {
    desktop: { width: 728, height: 90 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
  },
  NEWS_DETAIL_MODAL: {
    desktop: { width: 600, height: 400 },
    tablet: { width: 540, height: 360 },
    mobile: { width: 320, height: 280 },
  },
} as const;

export type PublicPlacementCode = keyof typeof PUBLIC_PLACEMENT_SIZES;
