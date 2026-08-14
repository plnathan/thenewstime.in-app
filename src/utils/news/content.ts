/**
 * Split plain-text news content into readable article paragraphs.
 *
 * Authors can separate paragraphs with one or more blank lines. A single
 * newline inside a paragraph is preserved as a space so copied/wrapped text
 * does not accidentally become dozens of short paragraphs.
 */
export function splitNewsContent(content: string | null | undefined): string[] {
  if (!content?.trim()) return [];

  return content
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}
