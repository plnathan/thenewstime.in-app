/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Constants
 * File       : app.ts
 * Description: Application level constants.
 * Version    : 1.0.0
 * -----------------------------------------------------------------------------
 */

export const APP = Object.freeze({
  NAME: "The News Time",

  SHORT_NAME: "TNT",

  DOMAIN: "thenewstime.in",

  VERSION: "1.0.0",

  DEFAULT_LANGUAGE: "ta",

  DEFAULT_PAGE_SIZE: 20,

  DEFAULT_TIMEZONE: "Asia/Kolkata",

  COPYRIGHT: `© ${new Date().getFullYear()} The News Time. All rights reserved.`,
} as const);

export const API = Object.freeze({
  BASE_PATH: "/api/v1",

  REQUEST_TIMEOUT: 30000,
} as const);

export const STORAGE_KEYS = Object.freeze({
  THEME: "tnt-theme",

  LANGUAGE: "tnt-language",

  SEARCH_HISTORY: "tnt-search-history",
} as const);

export const ROUTES = Object.freeze({
  HOME: "/",

  NEWS: "/news",

  SEARCH: "/search",

  CATEGORY: "/category",

  ABOUT: "/about",

  CONTACT: "/contact",
} as const);
