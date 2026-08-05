import { Menu, Search } from "lucide-react";

import Logo from "./Logo";
import Navigation from "../Navigation";

export default function Header() {
  return (
    <header
      className="
        sticky
        top-0
        z-50
        bg-white
        border-b
      "
    >
      {/* Top Header */}

      <div
        className="
          mx-auto
          flex
          h-20
          max-w-7xl
          items-center
          justify-between
          px-4
          lg:px-6
        "
      >
        {/* Left */}

        <button
          className="
            rounded
            p-2
            hover:bg-gray-100
          "
        >
          <Menu size={24} />
        </button>

        {/* Center */}

        <Logo />

        {/* Right */}

        <div
          className="
            flex
            items-center
            gap-6
            text-sm
          "
        >
          <span
            className="
              hidden
              lg:block
              text-gray-600
            "
          >
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>

          <button
            className="
              hidden
              lg:block
              hover:text-green-700
            "
          >
            E-Paper
          </button>

          <button
            className="
              hidden
              md:block
              hover:text-green-700
            "
          >
            தமிழ்
          </button>

          <button
            className="
              rounded-full
              p-2
              hover:bg-gray-100
            "
          >
            <Search size={22} />
          </button>
        </div>
      </div>

      <Navigation />
    </header>
  );
}
