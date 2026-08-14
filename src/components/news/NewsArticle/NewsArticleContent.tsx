import { splitNewsContent } from "@/utils/news/content";

interface NewsArticleContentProps {
  content: string;
}

/**
 * Public article body renderer.
 *
 * News content is stored as plain text. Paragraphs are separated by one or
 * more blank lines, which lets the Admin editor remain simple while giving
 * the public article page proper paragraph spacing and indentation.
 */
export default function NewsArticleContent({
  content,
}: NewsArticleContentProps) {
  const paragraphs = splitNewsContent(content);

  // Keep a visual placeholder in the article layout for the future
  // advertisement system. No advertisement API/data is connected yet.
  const showAdPlaceholder = paragraphs.length >= 3;
  const advertisementPosition = Math.ceil(paragraphs.length / 2);

  if (!paragraphs.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-8 text-center">
        <p className="text-base leading-8 text-gray-500">
          இந்த செய்திக்கான உள்ளடக்கம் தற்போது கிடைக்கவில்லை.
        </p>
      </div>
    );
  }

  return (
    <div className="text-gray-800">
      {paragraphs.map((paragraph, index) => {
        const paragraphNumber = index + 1;
        const shouldShowPlaceholder =
          showAdPlaceholder && paragraphNumber === advertisementPosition;

        return (
          <div key={`${paragraphNumber}-${paragraph.slice(0, 32)}`}>
            <p
              className={[
                "indent-7 sm:indent-10",
                "font-[Noto_Sans_Tamil,Inter,system-ui,sans-serif]",
                "text-[1.05rem] sm:text-[1.1rem]",
                "leading-[2] sm:leading-[2.05]",
                "tracking-[0.005em]",
                "text-gray-800",
                index > 0 ? "mt-7 sm:mt-8" : "",
              ].join(" ")}
            >
              {paragraph}
            </p>

            {shouldShowPlaceholder && (
              <div
                className="my-10 sm:my-12"
                aria-label="Advertisement placeholder"
              >
                <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                      Advertisement
                    </span>
                    <p className="mt-2 text-sm text-gray-500">
                      விளம்பரத்திற்கான இடம்
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
