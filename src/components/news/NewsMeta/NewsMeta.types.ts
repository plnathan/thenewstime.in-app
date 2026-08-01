/**
 * -----------------------------------------------------------------------------
 * Project     : thenewstime.in
 * Package     : News Components
 * Component   : NewsMeta
 * File        : NewsMeta.types.ts
 * Description : Metadata row for news articles.
 * Author      : TheNewsTime Team
 * Version     : 1.0.0
 * -----------------------------------------------------------------------------
 */

import type { HTMLAttributes } from "react";

export interface NewsMetaProps extends HTMLAttributes<HTMLDivElement> {
  publishedAt: string;

  views?: number;

  comments?: number;

  readingTime?: number;

  audioAvailable?: boolean;

  live?: boolean;

  compact?: boolean;
}
