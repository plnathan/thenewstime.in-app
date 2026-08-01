/**
 * -----------------------------------------------------------------------------
 * Project    : thenewstime.in
 * Package    : UI Framework
 * Module     : Core Library
 * File       : cn.ts
 * Description: Utility for merging Tailwind CSS class names.
 * Version    : 1.0.0
 * -----------------------------------------------------------------------------
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional Tailwind CSS class names.
 *
 * Example:
 * cn(
 *   "flex",
 *   isActive && "text-green-700",
 *   className
 * )
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
