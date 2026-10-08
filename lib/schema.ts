import { z } from "zod";
export const preferences = z.object({
  age: z.number().int().min(18).max(100),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(300),
  gender: z.enum(["Male", "Female", "Prefer not to say"]),
  goal: z.enum(["Bulking", "Cutting", "Maintenance"]),
  experience: z.enum(["Beginner", "Intermediate", "Advanced"]),
  days: z.number().int().min(1).max(7),
  minutes: z.number().min(15).max(120),
  training: z.enum(["Weight Training", "Calisthenics", "Both"]),
  location: z.enum(["Home", "Gym"]),
  equipment: z.string().max(500),
  skills: z.array(z.string().max(50)).max(10),
  diet: z.enum(["Vegetarian", "Eggetarian", "Non-vegetarian"]),
  ingredients: z.string().max(1000),
  allergies: z.string().max(1000),
});
export const macros = z.object({
  calories: z.number().min(0).max(10000),
  protein: z.number().min(0).max(1000),
  carbs: z.number().min(0).max(1500),
  fat: z.number().min(0).max(1000),
});
export const meal = z.object({
  name: z.string().min(1).max(200),
  ingredients: z
    .array(z.object({ name: z.string(), rawGrams: z.number().nonnegative() }))
    .max(30),
  oilGrams: z.number().nonnegative(),
  nutrition: macros,
  micronutrients: z.string(),
  instructions: z.string(),
});
export const exercise = z.object({
  name: z.string(),
  sets: z.number().int().min(1).max(10),
  reps: z.string(),
  restSeconds: z.number().min(0).max(600),
  intensity: z.string(),
  technique: z.string(),
  progression: z.string(),
  tutorialQuery: z.string(),
  tutorialVideoId: z
    .string()
    .regex(/^[A-Za-z0-9_-]{11}$/)
    .optional(),
});
export const plan = z.object({
  targets: macros,
  notes: z.string(),
  meals: z.array(meal).min(1).max(8),
  workouts: z
    .array(
      z.object({
        day: z.number().int().min(1).max(7),
        title: z.string(),
        warmup: z.string(),
        recovery: z.string(),
        exercises: z.array(exercise).max(15),
      }),
    )
    .min(1)
    .max(7),
});
export const photoResult = z.object({
  foods: z
    .array(
      z.object({
        name: z.string(),
        grams: z.number().positive(),
        nutrition: macros,
      }),
    )
    .max(20),
  uncertainty: z.string(),
});
export const bodyResult = z
  .object({
    low: z.number().min(3).max(70),
    high: z.number().min(3).max(70),
    notice: z.string(),
  })
  .refine((v) => v.high >= v.low);
