// Only emit an embed after YouTube confirms availability and the title matches the exercise.
export async function verifyTutorial(
  id: string | undefined,
  name: string,
): Promise<string | undefined> {
  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return;
  try {
    const r = await fetch(
      "https://www.youtube.com/oembed?format=json&url=" +
        encodeURIComponent("https://www.youtube.com/watch?v=" + id),
      { signal: AbortSignal.timeout(4000) },
    );
    if (!r.ok) return;
    const v = await r.json();
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const title = normalize(v.title || "");
    const words = name
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3 && !["with", "the", "and"].includes(w));
    if (
      v.type === "video" &&
      typeof v.html === "string" &&
      v.html.includes("/embed/" + id) &&
      words.length &&
      words.every((w) => title.includes(normalize(w)))
    )
      return id;
  } catch {}
  return;
}
