"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface DevModeContextType {
  isDevMode: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (passcode: string) => { success: boolean; error?: string };
  logout: () => void;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

const DEV_PASSCODE = process.env.NEXT_PUBLIC_DEV_PASSCODE || "devpost2026";
const STORAGE_KEY = "supplypulse_dev_mode_active";

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Load dev mode status from localStorage on client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        setIsDevMode(true);
      }
    } catch {
      // localStorage may be disabled or restricted
    }
  }, []);

  const login = (passcode: string) => {
    if (passcode.trim() === DEV_PASSCODE) {
      setIsDevMode(true);
      setIsAuthModalOpen(false);
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        /* ignore */
      }
      return { success: true };
    }
    return { success: false, error: "Invalid developer passcode. Try default: devpost2026" };
  };

  const logout = () => {
    setIsDevMode(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  // Prevent SSR hydration mismatch
  const value = {
    isDevMode: isMounted ? isDevMode : false,
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    logout,
  };

  return (
    <DevModeContext.Provider value={value}>
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error("useDevMode must be used within a DevModeProvider");
  }
  return context;
}
