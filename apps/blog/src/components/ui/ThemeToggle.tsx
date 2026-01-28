import { useState, useEffect } from "react";

const MoonIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
    <path
      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 5.05A1 1 0 003.636 3.636l-.707.707a1 1 0 101.414 1.414l.707-.707zM3 11a1 1 0 100-2H2a1 1 0 100 2h1zM13 17.25a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707z"
      fill-rule="evenodd"
      clip-rule="evenodd"
    ></path>
  </svg>
);

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("theme") ?? "light";
    }
    return "light";
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
