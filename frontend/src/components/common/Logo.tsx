import { Flame } from "lucide-react";
import { Link } from "react-router-dom";

export const Logo = () => (
  <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white shadow">
      <Flame className="h-5 w-5" />
    </span>
    <span className="text-foreground">FoodFlow</span>
  </Link>
);
