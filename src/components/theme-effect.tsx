import { useEffect } from "react";
import { useFinanceStore } from "@/lib/store";

const THEME_CLASSES = [
  "theme-dark",
  "theme-ocean",
  "theme-forest",
  "theme-sunset",
  "theme-midnight",
  "theme-contrast",
  "theme-pastel",
];

/** Renders nothing — keeps <html> theme class in sync with the store. */
export function ThemeEffect() {
  const theme = useFinanceStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...THEME_CLASSES);
    if (theme === "dark") root.classList.add("theme-dark");
    if (theme === "ocean") root.classList.add("theme-ocean");
    if (theme === "forest") root.classList.add("theme-forest");
    if (theme === "sunset") root.classList.add("theme-sunset");
    if (theme === "midnight") root.classList.add("theme-midnight");
    if (theme === "contrast") root.classList.add("theme-contrast");
    if (theme === "pastel") root.classList.add("theme-pastel");
  }, [theme]);

  return null;
}
