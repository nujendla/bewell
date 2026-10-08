import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { signature, activeSubscription } from "../lib/security";
import { preferences, plan, photoResult } from "../lib/schema";
test("payment signatures reject forged, malformed and mismatched payloads", () => {
  const secret = "test-only-secret",
    body = "pay_123|sub_123",
    sig = createHmac("sha256", secret).update(body).digest("hex");
  assert.equal(signature(body, sig, secret), true);
  assert.equal(signature("pay_other|sub_123", sig, secret), false);
  assert.equal(signature(body, "x", secret), false);
  assert.equal(signature(body, "0".repeat(64), secret), false);
});
test("Premium requires active status and a current paid period", () => {
  const future = Math.floor(Date.now() / 1000) + 3600;
  for (const status of [
    "created",
    "authenticated",
    "pending",
    "halted",
    "cancelled",
    "completed",
  ])
    assert.equal(activeSubscription({ status, current_end: future }), false);
  assert.equal(
    activeSubscription({ status: "active", current_end: future }),
    true,
  );
  assert.equal(activeSubscription({ status: "active", current_end: 1 }), false);
  assert.equal(
    activeSubscription({ status: "active", current_end: null }),
    false,
  );
});
test("onboarding rejects underage, invalid frequency and unsafe ranges", () => {
  const p = {
    age: 22,
    height: 170,
    weight: 65,
    gender: "Male",
    goal: "Maintenance",
    experience: "Beginner",
    days: 4,
    minutes: 45,
    training: "Both",
    location: "Home",
    equipment: "none",
    skills: [],
    diet: "Vegetarian",
    ingredients: "rice",
    allergies: "",
  };
  assert.equal(preferences.safeParse(p).success, true);
  for (const invalid of [
    { age: 16 },
    { days: 8 },
    { weight: 0 },
    { height: 900 },
  ])
    assert.equal(preferences.safeParse({ ...p, ...invalid }).success, false);
});
test("AI output must contain structured nutrition and workouts", () => {
  assert.equal(plan.safeParse({ notes: "looks good" }).success, false);
  assert.equal(
    photoResult.safeParse({
      foods: [
        {
          name: "rice",
          grams: -10,
          nutrition: { calories: 100, protein: 2, carbs: 20, fat: 0 },
        },
      ],
      uncertainty: "estimate",
    }).success,
    false,
  );
});
import { energyTargets, remainingMealScale } from "../lib/nutrition";
test("meal adjustments stay bounded and do not punish exceeding the target", () => {
  assert.equal(remainingMealScale(2000, 2200, 500), 1);
  assert.equal(remainingMealScale(2000, 1900, 1000), 0.75);
  assert.equal(remainingMealScale(2000, 0, 1000), 1.25);
  assert.equal(remainingMealScale(2000, 1000, 1000), 1);
});
test("energy targets use modest goal offsets and preserve a minimum", () => {
  const p = preferences.parse({
    age: 22,
    height: 170,
    weight: 65,
    gender: "Male",
    goal: "Maintenance",
    experience: "Beginner",
    days: 4,
    minutes: 45,
    training: "Both",
    location: "Home",
    equipment: "none",
    skills: [],
    diet: "Vegetarian",
    ingredients: "rice",
    allergies: "",
  });
  assert.equal(
    energyTargets({ ...p, goal: "Bulking" }).calories -
      energyTargets(p).calories,
    250,
  );
  assert.equal(
    energyTargets(p).calories -
      energyTargets({ ...p, goal: "Cutting" }).calories,
    250,
  );
  assert.ok(
    energyTargets({ ...p, age: 100, height: 100, weight: 30, goal: "Cutting" })
      .calories >= 1600,
  );
});
import { verifyTutorial } from "../lib/tutorials";
test("tutorial verification only returns matched, embeddable video IDs", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          type: "video",
          title: "Perfect push up technique",
          html: '<iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>',
        }),
        { status: 200 },
      );
    assert.equal(await verifyTutorial("abcdefghijk", "Push up"), "abcdefghijk");
    assert.equal(await verifyTutorial("abcdefghijk", "Deadlift"), undefined);
    assert.equal(
      await verifyTutorial("javascript:alert(1)", "Push up"),
      undefined,
    );
    globalThis.fetch = async () => new Response("", { status: 403 });
    assert.equal(await verifyTutorial("abcdefghijk", "Push up"), undefined);
  } finally {
    globalThis.fetch = original;
  }
});
import { paymentMode } from "../lib/security";
test("Razorpay mode is explicit and unknown key formats fail closed", () => {
  assert.equal(paymentMode("rzp_test_fixture"), "test");
  assert.equal(paymentMode("rzp_live_fixture"), "live");
  assert.throws(() => paymentMode("unknown"));
});
