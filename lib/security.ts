import { createHmac, timingSafeEqual } from "node:crypto";
export function signature(message: string, received: string, secret: string) {
  if (!/^[a-f0-9]{64}$/i.test(received)) return false;
  return timingSafeEqual(
    Buffer.from(
      createHmac("sha256", secret).update(message).digest("hex"),
      "hex",
    ),
    Buffer.from(received, "hex"),
  );
}
export function activeSubscription(s: {
  status: string;
  current_end: number | null;
}) {
  return (
    s.status === "active" &&
    s.current_end !== null &&
    s.current_end * 1000 > Date.now()
  );
}
export function paymentMode(key: string) {
  if (key.startsWith("rzp_test_")) return "test";
  if (key.startsWith("rzp_live_")) return "live";
  throw new Error(
    "Razorpay key ID must belong to Test Mode or Live Mode. Check configuration.",
  );
}
