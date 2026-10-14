"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { PreferencesSchema, type Preferences } from "@/lib/preferences";
import { write } from "@/lib/storage";
import { usePreferences } from "@/lib/store-hooks";
export type Account = {
  uid: string;
  email: string;
  name: string;
  verified: boolean;
};
type Context = {
  user: Account | null;
  configured: boolean;
  preferences: Preferences;
  updatePreferences: (p: Preferences) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};
const AccountContext = createContext<Context | null>(null);
export function useAccount() {
  const c = useContext(AccountContext);
  if (!c) throw new Error("Account provider missing");
  return c;
}
export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [configured, setConfigured] = useState(false);
  const preferences = usePreferences();
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/account/", { cache: "no-store" });
      if (!r.ok) return;
      const d = await r.json();
      setUser(d.user || null);
      setConfigured(!!d.configured);
    } catch {}
  }, []);
  const updatePreferences = useCallback((p: Preferences) => {
    const valid = PreferencesSchema.parse(p);
    write("preferences", valid);
    document.documentElement.dataset.motion = valid.motion ? "on" : "off";
    window.dispatchEvent(new Event("pinflix-preferences"));
  }, []);
  useEffect(() => {
    const task = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(task);
  }, [refresh]);
  useEffect(() => {
    document.documentElement.dataset.motion = preferences.motion ? "on" : "off";
    window.dispatchEvent(new Event("pinflix-preferences"));
  }, [preferences.motion]);
  const logout = async () => {
    const r = await fetch("/api/account/", { method: "DELETE" });
    if (r.ok) {
      setUser(null);
    }
  };
  return (
    <AccountContext.Provider
      value={{
        user,
        configured,
        preferences,
        updatePreferences,
        refresh,
        logout,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}
