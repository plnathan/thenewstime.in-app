import MenuButton from "../MenuButton";
import TopBar from "../TopBar";

import HeaderLogo from "./HeaderLogo";
import HeaderActions from "./HeaderActions";

import Navigation from "../Navigation";

import type { HeaderProps } from "./Header.types";

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header
      className="
        sticky
        top-0
        z-50
        bg-white
        border-b
        border-gray-200
      "
    >
      <TopBar />

      <div
        className="
          flex
          h-16
          items-center
          justify-between
          px-4
          lg:h-20
          lg:px-8
        "
      >
        <MenuButton onClick={onMenuClick} />

        <HeaderLogo />

        <HeaderActions />
      </div>
      <Navigation />
    </header>
  );
}
