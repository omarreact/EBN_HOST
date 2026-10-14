"use client";
import { useSyncExternalStore } from "react";
import { PreferencesSchema, defaultPreferences } from "./preferences";
import { read } from "./storage";
function subscribe(callback: () => void) {
  window.addEventListener("pinflix-storage", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("pinflix-storage", callback);
    window.removeEventListener("storage", callback);
  };
}
let raw = "";
let cached = defaultPreferences;
function snapshot() {
  const value = JSON.stringify(read("preferences", defaultPreferences));
  if (value !== raw) {
    raw = value;
    const parsed = PreferencesSchema.safeParse(JSON.parse(value));
    cached = parsed.success ? parsed.data : defaultPreferences;
  }
  return cached;
}
export function usePreferences() {
  return useSyncExternalStore(subscribe, snapshot, () => defaultPreferences);
}
