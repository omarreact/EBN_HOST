export function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor(value / 60);
  return minutes >= 60
    ? `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, "0")}:${seconds}`
    : `${minutes}:${seconds}`;
}
export function mediaError(code: number | undefined): string {
  return code === 2
    ? "The video connection was interrupted. Check your connection and retry."
    : code === 3
      ? "Your browser could not decode this video."
      : code === 4
        ? "This format is unsupported or the source is unavailable."
        : "Playback could not continue. Please retry.";
}
export function clampSeek(position: number, duration: number): number {
  return Math.max(
    0,
    Math.min(Number.isFinite(duration) ? duration : 0, position),
  );
}
