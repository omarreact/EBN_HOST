import { z } from "zod";

export const PreferencesSchema = z.object({
  name: z.string().trim().min(1).max(40).default("Film lover"),
  avatar: z.enum(["red", "violet", "blue", "amber"]).default("red"),
  autoplay: z.boolean().default(false),
  motion: z.boolean().default(true),
  quality: z.enum(["auto", "high", "data-saver"]).default("auto"),
  captions: z.boolean().default(false),
});
export type Preferences = z.infer<typeof PreferencesSchema>;
export const defaultPreferences = PreferencesSchema.parse({});
