import { Menu, Search } from "lucide-react";

import Logo from "./Logo";
import Navigation from "../Navigation";

function getCurrentDate() {
  const date = new Date();

  const tamilDays = [
    "ஞாயிறு",
    "திங்கள்",
    "செவ்வாய்",
    "புதன்",
    "வியாழன்",
    "வெள்ளி",
    "சனி",
  ];

  const tamilMonths = [
    "ஜனவரி",
    "பிப்ரவரி",
    "மார்ச்",
    "ஏப்ரல்",
    "மே",
    "ஜூன்",
    "ஜூலை",
    "ஆகஸ்ட்",
    "செப்டம்பர்",
    "அக்டோபர்",
    "நவம்பர்",
    "டிசம்பர்",
  ];

  const dayName = tamilDays[date.getDay()];
  const day = date.getDate();
  const monthName = tamilMonths[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}

export default function Header() {
  const currentDate = getCurrentDate();

  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        bg-white
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
        {/* Menu */}
        <button
          type="button"
          className="
            rounded
            p-2
            hover:bg-gray-100
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-green-600
            focus-visible:ring-offset-2
          "
          aria-label="Open menu"
        >
          <Menu
            size={24}
            aria-hidden="true"
          />
        </button>

        {/* Logo */}
        <Logo />

        {/* Empty right side to keep logo centered */}
        <div
          className="
            h-10
            w-10
          "
          aria-hidden="true"
        />
      </div>

      {/* Navigation / Utility Row */}
      <div
        className="
          border-t
          border-gray-100
        "
      >
        {/* Mobile Date + E-Paper + Search */}
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-gray-100
            px-4
            py-1.5
            sm:hidden
          "
        >
          {/* Mobile Date */}
          <div
            className="
              min-w-0
              truncate
              text-xs
              font-medium
              text-gray-500
            "
          >
            {currentDate}
          </div>

          {/* Mobile E-Paper + Search */}
          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
              pl-3
            "
          >
            <button
              type="button"
              className="
                whitespace-nowrap
                text-xs
                font-medium
                text-gray-600
                transition-colors
                hover:text-green-700
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-green-600
                focus-visible:ring-offset-2
              "
            >
              தமிழ் E-Paper
            </button>

            <button
              type="button"
              className="
                rounded-full
                p-1.5
                text-gray-700
                transition-colors
                hover:bg-gray-100
                hover:text-green-700
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-green-600
                focus-visible:ring-offset-2
              "
              aria-label="Search"
            >
              <Search
                size={18}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div
          className="
            mx-auto
            flex
            h-12
            max-w-7xl
            items-center
            px-4
            lg:px-6
          "
        >
          {/* Desktop Date */}
          <div
            className="
              hidden
              shrink-0
              items-center
              pr-4
              text-xs
              font-medium
              text-gray-500
              sm:flex
              lg:pr-6
            "
          >
            {currentDate}
          </div>

          {/* Navigation */}
          <div className="min-w-0 flex-1">
            <Navigation />
          </div>

          {/* Desktop E-Paper + Search */}
          <div
            className="
              hidden
              shrink-0
              items-center
              gap-2
              pl-3
              sm:flex
              sm:gap-3
              sm:pl-4
              lg:gap-4
              lg:pl-6
            "
          >
            <button
              type="button"
              className="
                whitespace-nowrap
                text-xs
                font-medium
                text-gray-600
                transition-colors
                hover:text-green-700
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-green-600
                focus-visible:ring-offset-2
                sm:text-sm
              "
            >
              தமிழ் E-Paper
            </button>

            <button
              type="button"
              className="
                rounded-full
                p-2
                text-gray-700
                transition-colors
                hover:bg-gray-100
                hover:text-green-700
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-green-600
                focus-visible:ring-offset-2
              "
              aria-label="Search"
            >
              <Search
                size={20}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}