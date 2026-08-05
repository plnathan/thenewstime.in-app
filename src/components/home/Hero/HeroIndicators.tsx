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
        bottom-25

        -translate-x-1/2

        z-[100]

        flex
        items-center
        gap-3
      "
    >
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`Slide ${index + 1}`}
          className={`
            rounded-full
            transition-all
            duration-300

            ${active === index
              ? "h-3 w-8 bg-white"
              : "h-3 w-3 bg-white/50 hover:bg-white"
            }
          `}
        />
      ))}
    </div>
  );
}