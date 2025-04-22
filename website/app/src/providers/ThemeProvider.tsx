import { useLocalStorageState } from "ahooks";
import { createContext, useContext, useEffect } from "react";

// 预加载主题设置到 HTML 元素，避免闪烁
// 尽早执行，不等待组件渲染
const initializeTheme = () => {
  try {
    const storedTheme = localStorage.getItem("nuwa-theme");
    // ahooks 的 useLocalStorageState 会将值存储为 JSON 字符串
    let theme = null;
    if (storedTheme) {
      const parsed = JSON.parse(storedTheme);
      theme = parsed;
    }
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // 如果有存储的主题则使用，否则使用系统偏好
    document.documentElement.className =
      theme || (systemPrefersDark ? "dark" : "light");
  } catch (e) {
    // 如果 localStorage 不可用或解析出错，使用默认亮色主题
    console.error("Failed to initialize theme:", e);
    document.documentElement.className = "light";
  }
};

// 立即执行，确保在组件渲染前设置主题
if (typeof window !== "undefined") {
  initializeTheme();
}

interface ThemeContextType {
  theme: "dark" | "light";
  setTheme: (value: "dark" | "light") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useLocalStorageState<"dark" | "light">(
    "nuwa-theme",
    {
      defaultValue: window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
    }
  );
  console.log("🚀 ~ ThemeProvider.tsx:43 ~ ThemeProvider ~ theme:", theme);

  useEffect(() => {
    // 当主题变化时更新 HTML 类名
    document.documentElement.className = theme || "light";
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme: theme || "light", setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
