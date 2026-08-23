import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      to="/"
      className="
        flex
        select-none
        items-center
        leading-none
      "
    >
      <div
        className="
          relative
          pt-1.5
          text-center
          sm:pt-2
        "
      >
        <div
          className="
            flex
            items-baseline
            justify-center
          "
        >
          {/* N + THE superscript */}
          <span
            className="
              relative
              text-[1.7rem]
              font-black
              text-green-700
              sm:text-[2rem]
              md:text-[2.3rem]
            "
          >
            <span
              className="
                absolute
                -top-0.5
                left-0.5
                text-[6px]
                font-bold
                tracking-[1px]
                text-gray-700
                sm:-top-1
                sm:text-[8px]
                sm:tracking-[1.3px]
                md:text-[9px]
                md:tracking-[1.5px]
              "
            >
              THE
            </span>

            N
          </span>

          <span
            className="
              text-[1.7rem]
              font-black
              text-green-700
              sm:text-[2rem]
              md:text-[2.3rem]
            "
          >
            EWS
          </span>

          <span
            className="
              text-[1.7rem]
              font-black
              text-green-900
              sm:text-[2rem]
              md:text-[2.3rem]
            "
          >
            TIME
          </span>

          <span
            className="
              ml-0.5
              text-[0.75rem]
              font-black
              text-green-900
              sm:text-[0.9rem]
              md:text-[1rem]
            "
          >
            .in
          </span>
        </div>

        {/* Slogan */}
        <div
          className="
              mt-0.5
              whitespace-nowrap
              text-[12px]
              text-gray-500
              sm:mt-1
              sm:text-[8px]
              md:text-[9px]
            "
        >
          India's Digital Voice
        </div>
      </div>
    </Link>
  );
}