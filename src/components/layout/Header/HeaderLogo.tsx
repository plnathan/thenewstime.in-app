export default function HeaderLogo() {
  return (
    <a
      href="/"
      className="
        flex
        flex-col
        items-center
        gap-1
      "
    >
      <span
        className="
          text-xs
          font-semibold
          tracking-[0.15em]
          text-gray-700
        "
      >
        THE
      </span>

      {/* <div className="flex items-baseline justify-center"> */}
      <span
        className="
      text-3xl
      font-extrabold
      uppercase
      text-green-700
    "
      >
        News Time
      </span>

      {/* <span
          className="
      ml-0.5
      text-2xl
      font-black
      text-black-700
    "
        >
          .in
        </span>
      </div> */}
      <span
        className="
          mt-1
          text-[11px]
          tracking-wide
          text-black-700
        "
      >
        India's Digital Voice
      </span>
    </a>
  );
}
