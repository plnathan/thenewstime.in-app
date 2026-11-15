import { Link } from "react-router-dom";

import logo from "@/assets/logo/thenewstime_logo_2_new.png";

export default function Logo() {
  return (
    <Link
      to="/"
      className="
        flex
        shrink-0
        select-none
        items-center
      "
      aria-label="The NewsTime - Home"
    >
      <div className="flex h-full items-center justify-center">
        <img
          src={logo}
          alt="The News Time"
          className="max-h-[80px] h-auto max-w-full object-contain"
        />
      </div>
    </Link>
  );
}