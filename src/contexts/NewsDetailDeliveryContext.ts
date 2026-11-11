import { createContext, useContext } from "react";

/** Undefined outside an article; null while its identity is being resolved. */
export const NewsDetailDeliveryContext = createContext<
  number | null | undefined
>(undefined);

export function useNewsDetailDeliveryId(): number | null | undefined {
  return useContext(NewsDetailDeliveryContext);
}
