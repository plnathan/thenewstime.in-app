import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      to="/"
      className="
        flex
        flex-col
        items-center
        leading-none
        select-none
      "
    >
      {/* Desktop */}

      <div className="hidden md:block text-center">
        <div
          className="
            text-[11px]
            tracking-[6px]
            text-gray-700
          "
        >
          THE
        </div>

        <div
          className="
            flex
            items-center
            justify-center
            gap-1
          "
        >
          <span
            className="
              text-[2.3rem]
              font-black
              text-green-700
            "
          >
            NEWS
          </span>

          <span
            className="
              text-[2.3rem]
              font-black
              text-green-900
            "
          >
            TIME
          </span>

          <span
            className="
              text-[1rem]
              font-black
              text-green-900
              self-start
              mt-1
            "
          >
            .in
          </span>
        </div>

        <div
          className="
            mt-1
            text-[11px]
            text-gray-500
          "
        >
          India's Digital Voice
        </div>
      </div>

      {/* Mobile */}

      <div
        className="
          md:hidden
          flex
          items-center
        "
      >
        <span
          className="
            text-2xl
            font-black
            text-green-700
          "
        >
          NEWS
        </span>

        <span
          className="
            ml-1
            text-2xl
            font-black
            text-green-900
          "
        >
          TIME
        </span>

        <span
          className="
            text-sm
            font-black
            text-green-900
            self-start
            mt-0.5
          "
        >
          .in
        </span>
      </div>
    </Link>
  );
}
