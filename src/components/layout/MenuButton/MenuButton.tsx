import { Menu } from "lucide-react";

interface MenuButtonProps {
  onClick?: () => void;
}

export default function MenuButton({ onClick }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open menu"
      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        transition-colors
        hover:bg-gray-100
      "
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}
