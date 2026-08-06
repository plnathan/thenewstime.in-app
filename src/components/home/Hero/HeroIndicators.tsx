interface Props {
  total: number;
  active: number;
  onSelect: (index: number) => void;
}

export default function HeroIndicators({
  total,
  active,
  onSelect,
}: Props) {
  return (
    <div
      className="
        absolute

        left-1/2
        -translate-x-1/2

        bottom-5
        sm:bottom-6
        md:bottom-7

        z-40

        flex
        items-center
        gap-2
      "
    >
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Go to slide ${index + 1}`}
          onClick={() => onSelect(index)}
          className={`
            rounded-full
            transition-all
            duration-300

            ${active === index
              ? "h-2.5 w-8 bg-white"
              : "h-2.5 w-2.5 bg-white/50 hover:bg-white/80"
            }
          `}
        />
      ))}
    </div>
  );
}