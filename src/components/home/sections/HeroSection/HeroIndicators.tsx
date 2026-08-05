interface HeroIndicatorsProps {
  total: number;
  active: number;
  onSelect: (index: number) => void;
}

export default function HeroIndicators({
  total,
  active,
  onSelect,
}: HeroIndicatorsProps) {
  return (
    <div
      className="
        absolute
        bottom-5
        left-1/2
        z-20
        flex
        -translate-x-1/2
        gap-2
      "
    >
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Slide ${index + 1}`}
          onClick={() => onSelect(index)}
          className={
            index === active
              ? "h-2 w-6 rounded-full bg-white transition-all"
              : "h-2 w-2 rounded-full bg-white/50 transition-all hover:bg-white"
          }
        />
      ))}
    </div>
  );
}
