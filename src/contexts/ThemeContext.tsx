import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const fetchUserTheme = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const response = await fetch(`/api/getUserTheme?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            setTheme(data.theme);
          } else {
            console.error("Failed to fetch user theme");
          }
        } catch (err) {
          console.error("Error fetching user theme:", err);
        }
      }
    };

    fetchUserTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    const userId = localStorage.getItem("userId");
    if (userId) {
      try {
        const response = await fetch("/api/updateTheme", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, theme: newTheme }),
        });

        if (!response.ok) {
          console.error("Failed to update theme");
        }
      } catch (err) {
        console.error("Error updating theme:", err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};