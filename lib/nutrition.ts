import type { z } from "zod";
import type { preferences } from "./schema";
type Pref = z.infer<typeof preferences>;
// Mifflin–St Jeor resting energy estimate, plus a modest activity factor.
// When gender is withheld, use the midpoint of the sex-specific equation constants.
export function energyTargets(p: Pref) {
  const constant = p.gender === "Male" ? 5 : p.gender === "Female" ? -161 : -78;
  const resting = 10 * p.weight + 6.25 * p.height - 5 * p.age + constant;
  const activity = p.days <= 2 ? 1.35 : p.days <= 4 ? 1.5 : 1.65;
  const offset = p.goal === "Bulking" ? 250 : p.goal === "Cutting" ? -250 : 0;
  const calories = Math.max(1600, Math.round(resting * activity + offset));
  const protein = Math.round(p.weight * 1.6),
    fat = Math.round((calories * 0.28) / 9),
    carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  return { calories, protein, carbs: Math.max(0, carbs), fat };
}
export function remainingMealScale(
  target: number,
  consumed: number,
  remainingPlanned: number,
) {
  const remaining = Math.max(0, target - consumed);
  if (!remaining || !remainingPlanned) return 1;
  return Math.max(0.75, Math.min(1.25, remaining / remainingPlanned));
}
