import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full bg-background hover:bg-accent hover:text-accent-foreground"
        onClick={toggleTheme}
      >
        {isDarkMode ? (
          <Moon className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem]" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
};

export default ThemeToggle;
