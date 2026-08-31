import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScrollToTopBottom() {
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show button after moving down from the top
      setIsVisible(scrollTop > 200);

      // Determine whether the user is near the bottom
      const distanceFromBottom =
        documentHeight - (scrollTop + windowHeight);

      setIsNearBottom(distanceFromBottom < 200);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = () => {
    if (isNearBottom) {
      // Move to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      // Move to bottom
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isNearBottom ? "Scroll to top" : "Scroll to bottom"}
      title={isNearBottom ? "Scroll to top" : "Scroll to bottom"}
      className={[
        "fixed",
        "right-4",
        "bottom-5",
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
        "sm:right-6",
        "sm:bottom-6",
      ].join(" ")}
    >
      {isNearBottom ? (
        <ArrowUp
          className="h-5 w-5"
          aria-hidden="true"
        />
      ) : (
        <ArrowDown
          className="h-5 w-5"
          aria-hidden="true"
        />
      )}
    </button>
  );
}