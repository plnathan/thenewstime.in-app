export interface PageLoaderProps {
  /**
   * Loading message displayed below the animation.
   *
   * Defaults to "செய்தி ஏற்றப்படுகிறது..."
   */
  message?: string;

  /**
   * Controls the overall loader size.
   *
   * "page" is intended for full-page loading states.
   * "content" is intended for smaller content areas.
   */
  variant?: "page" | "content";
}
