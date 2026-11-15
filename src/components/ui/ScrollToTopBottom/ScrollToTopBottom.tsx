import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ScrollDirection = "up" | "down";

const SCROLL_THRESHOLD = 200;
const DIRECTION_THRESHOLD = 4;
const BOTTOM_TOLERANCE = 2;

export default function ScrollToTopBottom() {
  const [direction, setDirection] = useState<ScrollDirection>("down");
  const [isVisible, setIsVisible] = useState(false);
  const previousScrollY = useRef(0);

  useEffect(() => {
    previousScrollY.current = Math.max(0, window.scrollY);

    const handleScroll = () => {
      const scrollTop = Math.max(0, window.scrollY);
      const maxScrollTop = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );

      setIsVisible(scrollTop > SCROLL_THRESHOLD && maxScrollTop > SCROLL_THRESHOLD);

      if (scrollTop >= maxScrollTop - BOTTOM_TOLERANCE) {
        setDirection("up");
      } else if (scrollTop <= BOTTOM_TOLERANCE) {
        setDirection("down");
      } else {
        const delta = scrollTop - previousScrollY.current;
        if (delta > DIRECTION_THRESHOLD) {
          setDirection("down");
        } else if (delta < -DIRECTION_THRESHOLD) {
          setDirection("up");
        }
      }

      previousScrollY.current = scrollTop;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleClick = () => {
    window.scrollTo({
      top: direction === "up" ? 0 : document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  const isUp = direction === "up";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isUp ? "Scroll to top" : "Scroll to bottom"}
      title={isUp ? "Scroll to top" : "Scroll to bottom"}
      className={[
        "fixed",
        "right-1",
        "bottom-[75px]",
        "z-50",
        "flex",
        "h-11",
        "w-11",
        "items-center",
        "justify-center",
        "rounded-full",
        "bg-green-700",
        "text-white",
        "shadow-lg",
        "transition-all",
        "duration-200",
        "hover:bg-green-800",
        "hover:shadow-xl",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-green-500",
        "focus:ring-offset-2",
        "active:scale-95",
        "sm:right-2",
        "sm:bottom-[79px]",
      ].join(" ")}
    >
      {isUp ? (
        <ArrowUp className="h-5 w-5" aria-hidden="true" />
      ) : (
        <ArrowDown className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
