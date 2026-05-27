import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Moon, Sun, Key, BrainCircuit } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function Header({ apiKey, setApiKey, provider, setProvider }) {
  const { theme, setTheme } = useTheme();
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  useEffect(() => {
    setTempKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(tempKey);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-semibold tracking-tight text-lg hidden sm:inline-block">
            Resume Intelligence
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-lg p-1 border">
            <button
              onClick={() => setProvider("gemini")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                provider === "gemini" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Gemini
            </button>
          </div>

          <div className="flex items-center gap-2 relative group">
            <div className="relative w-48 sm:w-64">
              <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type={showKey ? "text" : "password"}
                placeholder={`${provider === 'gemini' ? 'AIza...' : 'sk-...'}`}
                value={tempKey}
                onChange={(e) => {
                  setTempKey(e.target.value);
                  setApiKey(e.target.value);
                }}
                className="pl-9 pr-9 h-9 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {/* Tooltip hint */}
            <div className="absolute top-12 right-0 hidden group-hover:block w-72 p-3 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border animate-in fade-in zoom-in z-50">
              <p className="mb-2">Your API key never touches our servers — it lives only in this browser tab.</p>
              <p className="text-[10px] text-muted-foreground">
                Get a free Gemini key at aistudio.google.com/apikey or an OpenAI key at platform.openai.com/api-keys
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
