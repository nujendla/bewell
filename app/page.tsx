"use client";
import { useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import {
  ArrowUpRight,
  ArrowRight,
  Activity,
  Flame,
  Dumbbell,
  Utensils,
  CheckCircle2,
  Camera,
  Zap,
  Target,
  ChevronRight,
  ShieldCheck,
  Trash2,
  LogOut,
  Plus,
} from "lucide-react";
import { browser } from "@/lib/supabase";
import { preferences, plan as planSchema, photoResult } from "@/lib/schema";
import { z } from "zod";
import { remainingMealScale } from "@/lib/nutrition";
type Pref = z.infer<typeof preferences>;
type Plan = z.infer<typeof planSchema>;
type Snap = z.infer<typeof photoResult>;
type Task = { id: string; title: string; completed: boolean };
type State = {
  profile: { preferences: Pref } | null;
  plan: { data: Plan } | null;
  premium: boolean;
  meals: {
    data: {
      name: string;
      nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
    };
  }[];
  workouts: { data: { title: string } }[];
  history: {
    id: string;
    day: string;
    data: {
      title: string;
      recovery: string;
      sets: { exercise: string; reps: number; weight: number }[];
    };
  }[];
  tasks: Task[];
  weights: { day: string; weight: number }[];
  analyses: {
    id: string;
    result: { low: number; high: number; notice: string };
  }[];
  subscriptions: { id: string; status: string }[];
};
const initial: Pref = {
  age: 22,
  height: 170,
  weight: 65,
  gender: "Prefer not to say",
  goal: "Maintenance",
  experience: "Beginner",
  days: 4,
  minutes: 45,
  training: "Both",
  location: "Home",
  equipment: "No equipment",
  skills: [],
  diet: "Vegetarian",
  ingredients: "Rice, lentils, paneer, vegetables",
  allergies: "",
};
const day = () => new Date().toLocaleDateString("en-CA");
async function api(path: string, body?: unknown) {
  const r = await fetch("/api/" + path, {
    method: body === undefined ? "GET" : "POST",
    ...(body === undefined
      ? {}
      : body instanceof FormData
        ? { body }
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
  });
  const v = await r.json();
  if (!r.ok) throw new Error(v.error || "Request failed");
  return v;
}
function Choices({
  values,
  value,
  onChange,
}: {
  values: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="choices">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          className={value === v ? "selected" : ""}
          onClick={() => onChange(v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
function Athlete() {
  return (
    <div className="art" aria-label="Original illustrated athlete silhouettes">
      <svg viewBox="0 0 440 480" role="img">
        <defs>
          <linearGradient id="body" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#b94351" />
            <stop offset=".5" stopColor="#3c303d" />
            <stop offset="1" stopColor="#17171e" />
          </linearGradient>
          <linearGradient id="edge">
            <stop stopColor="#ff3a4c" />
            <stop offset="1" stopColor="#773746" />
          </linearGradient>
        </defs>
        <path
          d="M110 420L340 60M75 370L300 30M180 465L385 100"
          stroke="#ff3545"
          strokeWidth="1"
          opacity=".2"
        />
        <g fill="url(#body)" stroke="#a64d5d" strokeWidth="1.3">
          <path d="M194 95l6-25 16-19 26-2 24 15 8 29-14 34-18 10-24-6z" />
          <path d="M208 128l-16 22-37 13-27 27-17 65 16 17 25-27 20-42 14 33 7 60 60 2 20-58 12-35 22 41 23 13 16-19-20-67-33-25-28-10-13-14-18 14z" />
          <path d="M191 297l-7 61-9 72 28 6 29-65 8-46 15 43 34 61 26-12-23-68-16-48z" />
          <path d="M175 430l-16 15-7 11 55 1-4-21M289 428l11 19 34 9 11-8-30-30" />
        </g>
        <path
          d="M218 58l-24 26 3-35 18-14 36 3 29 26-16 12-10-18-10 10-6-12-10 10z"
          fill="#18171d"
          stroke="#a64d5d"
        />
        <g fill="none" stroke="url(#edge)" strokeWidth="2">
          <path d="M184 175l29 25 25-13 26 12 24-29M213 201l-9 36 28 10 28-10-10-36M206 251l26 7 25-6M209 272l23 6 18-4M234 213v75M170 176l-21 39M305 179l20 43M197 313l17 12-19 64M267 319l-16 8 36 65" />
        </g>
        <g fill="#352934" stroke="#7f3e50" opacity=".8">
          <path d="M335 189l4-25 17-15 22 9 8 23-14 21-17-1zM345 202l-19 20-11 46 15 14 14-37 5 46 37-2 8-48 16 34 15-8-22-51-25-14-18 12zM348 295l-12 58-8 51 18 5 23-61 8 56 21-1-7-66-4-45z" />
        </g>
        <text x="108" y="466" fill="#ff3545" fontSize="9" letterSpacing="5">
          YOUR NEXT CHAPTER
        </text>
      </svg>
      <div className="float-card fc1">
        <span className="tag">ONE DAY AT A TIME</span>
        <b>Stronger. Every day.</b>
        <span className="muted">Your effort. Your evolution.</span>
      </div>
      <div className="float-card fc2">
        <span className="tag">BUILT AROUND YOU</span>
        <b>
          <Zap size={17} style={{ display: "inline", color: "#ff3545" }} />{" "}
          AI-powered plans
        </b>
        <span className="mini">Training + nutrition + progress</span>
      </div>
    </div>
  );
}
export default function Page() {
  const dialogRef = useRef<HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [view, setView] = useState("welcome"),
    [tab, setTab] = useState("HOME"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [state, setState] = useState<State | null>(null),
    [pref, setPref] = useState<Pref>(initial),
    [step, setStep] = useState(0),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [authMode, setAuthMode] = useState("login"),
    [message, setMessage] = useState(""),
    [modal, setModal] = useState(""),
    [taskTitle, setTaskTitle] = useState(""),
    [snap, setSnap] = useState<Snap | null>(null),
    [consent, setConsent] = useState(false),
    [file, setFile] = useState<File | null>(null),
    [mealName, setMealName] = useState("Rice + dal"),
    [portion, setPortion] = useState(200),
    [mealNutrition, setMealNutrition] = useState({
      calories: 300,
      protein: 10,
      carbs: 50,
      fat: 6,
    }),
    [sets, setSets] = useState<
      { exercise: string; reps: number; weight: number }[]
    >([]),
    [recovery, setRecovery] = useState(""),
    [weight, setWeight] = useState(65);
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") setModal("");
      if (event.key !== "Tab" || !dialog) return;
      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]',
        ),
      ).filter((el) => el.getClientRects().length);
      const first = items[0],
        last = items.at(-1);
      if (!first) {
        event.preventDefault();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [modal]);
  async function refresh() {
    const s: State = await api("state?day=" + day());
    setState(s);
    if (s.profile) {
      setPref(s.profile.preferences);
      setView("app");
    } else setView("onboarding");
  }
  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    let cancel = false;
    let unsubscribe = () => {};
    try {
      const db = browser();
      db.auth.getUser().then(({ data }) => {
        if (cancel) return;
        setUser(data.user);
        setLoading(false);
        if (data.user) {
          if (new URLSearchParams(location.search).get("recover") === "1") {
            setAuthMode("update");
            setView("auth");
          } else run(refresh);
        }
      });
      const { data } = db.auth.onAuthStateChange((_event, u) => {
        if (cancel) return;
        setUser(u?.user || null);
        if (!u) {
          setView("welcome");
          setState(null);
        } else if (_event === "SIGNED_IN" || _event === "PASSWORD_RECOVERY") {
          if (_event === "PASSWORD_RECOVERY") {
            setAuthMode("update");
            setView("auth");
          } else run(refresh);
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch {
      setLoading(false);
    }
    return () => {
      cancel = true;
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (view === "onboarding") {
      const saved = localStorage.getItem(
        "beingwell-onboarding-" + (user?.id || "draft"),
      );
      if (saved) {
        try {
          setPref(preferences.parse(JSON.parse(saved)));
        } catch {}
      }
    }
  }, [view, user?.id]);
  function update<K extends keyof Pref>(k: K, v: Pref[K]) {
    const next = { ...pref, [k]: v };
    setPref(next);
    localStorage.setItem(
      "beingwell-onboarding-" + (user?.id || "draft"),
      JSON.stringify(next),
    );
  }
  async function authenticate() {
    const db = browser();
    if (authMode === "signup") {
      const { error } = await db.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: location.origin + "/auth/callback" },
      });
      if (error) throw error;
      setMessage("Check your email to verify your account, then sign in.");
    } else if (authMode === "recover") {
      const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: location.origin + "/auth/callback?recover=1",
      });
      if (error) throw error;
      setMessage("If an account exists, a recovery link is on its way.");
    } else if (authMode === "update") {
      const { error } = await db.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Password updated.");
      await refresh();
    } else {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await refresh();
    }
  }
  async function subscribe() {
    const s = await api("subscribe", {});
    if (!(window as Window & { Razorpay?: unknown }).Razorpay)
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Checkout could not load. Please retry."));
        document.body.appendChild(script);
      });
    const Razorpay = (
      window as unknown as {
        Razorpay: new (o: unknown) => { open: () => void };
      }
    ).Razorpay;
    new Razorpay({
      key: s.key,
      subscription_id: s.id,
      name: "BEINGWELL",
      description: "Premium · ₹99 / month",
      theme: { color: "#ff3545" },
      handler: (v: unknown) =>
        run(async () => {
          const result = await api("verify", v);
          setMessage(
            result.active
              ? "Premium is active."
              : "Payment received; awaiting active subscription confirmation. Refresh after webhook verification.",
          );
          await refresh();
        }),
    }).open();
  }
  const p = state?.plan?.data,
    tasks = state?.tasks || [],
    percent = tasks.length
      ? Math.round(
          (tasks.filter((t) => t.completed).length / tasks.length) * 100,
        )
      : 0;
  const consumed = (state?.meals || []).reduce(
    (n, m) => n + m.data.nutrition.calories,
    0,
  );
  const remainingMeals =
    p?.meals.filter(
      (m) => !(state?.meals || []).some((log) => log.data.name === m.name),
    ) || [];
  const mealScale = p
    ? remainingMealScale(
        p.targets.calories,
        consumed,
        remainingMeals.reduce((n, m) => n + m.nutrition.calories, 0),
      )
    : 1;
  function openWorkout(title: string) {
    const w = p?.workouts.find((w) => w.title === title);
    setSets(
      w?.exercises.flatMap((e) =>
        Array.from({ length: e.sets }, () => ({
          exercise: e.name,
          reps: 0,
          weight: 0,
        })),
      ) || [],
    );
    setMealName(title);
    setModal("workout");
  }
  function shareAchievement() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#111114";
    c.fillRect(0, 0, 1080, 1080);
    c.fillStyle = "#ff3545";
    c.fillRect(80, 100, 70, 8);
    c.font = "bold 60px Arial";
    c.fillText("BEINGWELL", 80, 210);
    c.fillStyle = "#fff";
    c.font = "bold 160px Arial";
    c.fillText("100%", 80, 480);
    c.font = "bold 56px Arial";
    c.fillText("SHOWED UP.", 80, 600);
    c.fillText("GOT IT DONE.", 80, 680);
    c.fillStyle = "#9999a5";
    c.font = "32px Arial";
    c.fillText("Daily tasks completed · " + day(), 80, 850);
    c.font = "24px Arial";
    c.fillText("BE WELL. BUILD YOURSELF.", 80, 960);
    const a = document.createElement("a");
    a.download = "beingwell-achievement-" + day() + ".png";
    a.href = canvas.toDataURL();
    a.click();
  }
  const features = [
    {
      icon: Dumbbell,
      title: "Train with intention.",
      text: "Personalized weight training, calisthenics and skill progressions. Your equipment. Your pace.",
    },
    {
      icon: Utensils,
      title: "Fuel your potential.",
      text: "Everyday ingredients, practical meal plans and mess-friendly adjustments. No diet budget required.",
    },
    {
      icon: Camera,
      title: "A little clarity. A lot of progress.",
      text: "Optional body estimates and food photo analysis, with consent and room for correction.",
    },
    {
      icon: Activity,
      title: "Make progress visible.",
      text: "Log meals, sets and weight. Turn your daily effort into a story you can actually follow.",
    },
    {
      icon: CheckCircle2,
      title: "Win your day.",
      text: "Small tasks. Consistent action. A daily achievement worth celebrating.",
    },
    {
      icon: Zap,
      title: "Guidance that grows with you.",
      text: "AI-assisted plans that consider your preferences, performance and recovery.",
    },
  ];
  return (
    <div className="shell">
      <header className="header">
        <button
          className="brand"
          style={{ background: "none", border: 0, color: "white" }}
          onClick={() => !user && setView("welcome")}
          aria-label="BEINGWELL home"
        >
          <i>B</i>BEING<span>WELL</span>
        </button>
        {view === "app" && state?.premium ? (
          <nav className="app-nav">
            {["HOME", "DIET", "EXERCISE", "TO-DO"].map((t) => (
              <button
                className={tab === t ? "active" : ""}
                key={t}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </nav>
        ) : (
          <nav className="public-nav">
            <button
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              THE EXPERIENCE
            </button>
            <button
              onClick={() => {
                setView("auth");
                setAuthMode("login");
              }}
            >
              SIGN IN <ArrowUpRight size={12} style={{ display: "inline" }} />
            </button>
          </nav>
        )}
        {user ? (
          <button
            className="secondary"
            aria-label="Sign out"
            onClick={() =>
              run(async () => {
                await browser().auth.signOut();
              })
            }
          >
            <LogOut size={16} />
          </button>
        ) : (
          <span className="pill">BUILT FOR YOUR JOURNEY</span>
        )}
      </header>
      {error && (
        <div className="notice" role="alert">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}
      {message && (
        <div className="notice" role="status">
          <span>{message}</span>
          <button onClick={() => setMessage("")}>×</button>
        </div>
      )}
      {loading ? (
        <div className="empty muted">Loading your space…</div>
      ) : view === "welcome" ? (
        <>
          <section className="hero">
            <div>
              <span className="pill">YOUR EVOLUTION STARTS HERE</span>
              <h1>
                BE WELL.
                <br />
                BUILD
                <br />
                <em>YOURSELF.</em>
              </h1>
              <p className="muted">
                Become the strongest version of you. Personalized training,
                smarter nutrition and daily wins — all in one place.
              </p>
              <div className="hero-actions">
                <button
                  className="primary"
                  onClick={() => {
                    setView("auth");
                    setAuthMode("signup");
                  }}
                >
                  BE WELL <ArrowUpRight size={18} />
                </button>
                <span className="mini">
                  Your next chapter
                  <br />
                  starts with one step.
                </span>
              </div>
              <small>
                ₹99 / month Premium · No free trial · Cancel recurring payments
              </small>
            </div>
            <Athlete />
          </section>
          <section id="features">
            <div className="section-head">
              <div>
                <span className="tag">MORE THAN A WORKOUT APP</span>
                <h2>Everything you need. Built around you.</h2>
              </div>
              <span className="mini">01 — THE EXPERIENCE</span>
            </div>
            <div className="grid">
              {features.map((f, i) => (
                <article className="card" key={f.title}>
                  <span className="index">0{i + 1}</span>
                  <div className="icon">
                    <f.icon size={22} />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : view === "auth" ? (
        <section className="panel card">
          <span className="tag">YOUR NEXT CHAPTER</span>
          <h1>
            {authMode === "signup"
              ? "Build your beginning."
              : authMode === "recover"
                ? "Get back on track."
                : authMode === "update"
                  ? "A fresh start."
                  : "Welcome back."}
          </h1>
          <p className="muted">
            One account for your training, nutrition and progress.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(authenticate);
            }}
          >
            {authMode !== "update" && (
              <>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </>
            )}
            {authMode !== "recover" && (
              <>
                <label htmlFor="password">
                  Password · at least 8 characters
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={
                    authMode === "login" ? "current-password" : "new-password"
                  }
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </>
            )}
            <button
              className="primary"
              disabled={busy}
              style={{ marginTop: 24, width: "100%" }}
            >
              {busy
                ? "Please wait…"
                : authMode === "signup"
                  ? "CREATE ACCOUNT"
                  : authMode === "recover"
                    ? "SEND RECOVERY LINK"
                    : authMode === "update"
                      ? "UPDATE PASSWORD"
                      : "SIGN IN"}
              <ArrowRight size={16} />
            </button>
          </form>
          <div className="row spread" style={{ marginTop: 20 }}>
            <button
              className="secondary"
              onClick={() =>
                setAuthMode(authMode === "signup" ? "login" : "signup")
              }
            >
              {authMode === "signup"
                ? "Already a member? Sign in"
                : "Create an account"}
            </button>
            <button
              className="secondary"
              onClick={() => setAuthMode("recover")}
            >
              Forgot password?
            </button>
          </div>
        </section>
      ) : view === "onboarding" ? (
        <section className="panel card">
          <span className="tag">STEP {step + 1} OF 3 · YOUR BLUEPRINT</span>
          <h1>
            {
              ["Start with you.", "Find your strength.", "Fuel your journey."][
                step
              ]
            }
          </h1>
          <p className="muted">
            Your choices stay saved on this device while you finish onboarding.
            For adults 18+.
          </p>
          <div className="steps">
            <div style={{ width: ((step + 1) / 3) * 100 + "%" }} />
          </div>
          {step === 0 ? (
            <>
              <div className="form-grid">
                {(["age", "height", "weight"] as const).map((k) => (
                  <div key={k}>
                    <label htmlFor={k}>
                      {k === "age"
                        ? "Age"
                        : k === "height"
                          ? "Height (cm)"
                          : "Weight (kg)"}
                    </label>
                    <input
                      id={k}
                      type="number"
                      min={k === "age" ? 18 : k === "height" ? 100 : 30}
                      max={k === "age" ? 100 : k === "height" ? 250 : 300}
                      value={pref[k]}
                      onChange={(e) => update(k, Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>
              <label>Gender</label>
              <Choices
                values={["Male", "Female", "Prefer not to say"]}
                value={pref.gender}
                onChange={(v) => update("gender", v as Pref["gender"])}
              />
              <label>Your primary goal</label>
              <Choices
                values={["Bulking", "Cutting", "Maintenance"]}
                value={pref.goal}
                onChange={(v) => update("goal", v as Pref["goal"])}
              />
              <label>Experience</label>
              <Choices
                values={["Beginner", "Intermediate", "Advanced"]}
                value={pref.experience}
                onChange={(v) => update("experience", v as Pref["experience"])}
              />
            </>
          ) : step === 1 ? (
            <>
              <label>Training style</label>
              <Choices
                values={["Weight Training", "Calisthenics", "Both"]}
                value={pref.training}
                onChange={(v) => update("training", v as Pref["training"])}
              />
              <label>Where do you train?</label>
              <Choices
                values={["Home", "Gym"]}
                value={pref.location}
                onChange={(v) => update("location", v as Pref["location"])}
              />
              <label>Days per week</label>
              <Choices
                values={["1", "2", "3", "4", "5", "6", "7"]}
                value={String(pref.days)}
                onChange={(v) => update("days", Number(v))}
              />
              <label>Minutes per workout</label>
              <Choices
                values={["15", "30", "45", "60", "90", "120"]}
                value={String(pref.minutes)}
                onChange={(v) => update("minutes", Number(v))}
              />
              <label htmlFor="equipment">Available equipment</label>
              {pref.location === "Gym" && (
                <Choices
                  values={[
                    "Standard gym",
                    "Dumbbells + machines",
                    "Barbells + rack",
                  ]}
                  value={pref.equipment}
                  onChange={(v) => update("equipment", v)}
                />
              )}
              <input
                id="equipment"
                value={pref.equipment}
                onChange={(e) => update("equipment", e.target.value)}
                placeholder="Dumbbells, bands, pull-up bar, or no equipment"
              />
              {pref.training !== "Weight Training" && (
                <>
                  <label>Skills to work toward (optional)</label>
                  <div className="choices">
                    {[
                      "L-sit",
                      "Handstand",
                      "Planche",
                      "Front lever",
                      "Muscle-up",
                    ].map((s) => (
                      <button
                        className={pref.skills.includes(s) ? "selected" : ""}
                        aria-pressed={pref.skills.includes(s)}
                        key={s}
                        onClick={() =>
                          update(
                            "skills",
                            pref.skills.includes(s)
                              ? pref.skills.filter((x) => x !== s)
                              : [...pref.skills, s],
                          )
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <label>Dietary preference</label>
              <Choices
                values={["Vegetarian", "Eggetarian", "Non-vegetarian"]}
                value={pref.diet}
                onChange={(v) => update("diet", v as Pref["diet"])}
              />
              <label htmlFor="ingredients">Ingredients you enjoy</label>
              <textarea
                id="ingredients"
                value={pref.ingredients}
                onChange={(e) => update("ingredients", e.target.value)}
              />
              <label htmlFor="allergies">
                Allergies and ingredients to avoid
              </label>
              <textarea
                id="allergies"
                value={pref.allergies}
                onChange={(e) => update("allergies", e.target.value)}
                placeholder="For example: peanuts, dairy. Leave blank if none."
              />
              <p className="mini">
                No supplements recommended by default. An optional body scan is
                available after activation; you can skip it and generate a plan.
              </p>
            </>
          )}
          <div className="row spread" style={{ marginTop: 30 }}>
            <button
              className="secondary"
              onClick={() => (step ? setStep(step - 1) : setView("app"))}
            >
              BACK
            </button>
            <button
              className="primary"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  preferences.parse(pref);
                  if (step < 2) setStep(step + 1);
                  else {
                    await api("preferences", pref);
                    await refresh();
                    localStorage.removeItem("beingwell-onboarding-" + user?.id);
                  }
                })
              }
            >
              {step < 2 ? "CONTINUE" : "SAVE MY BLUEPRINT"}
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      ) : (
        <main className="dashboard">
          {!state ? (
            <div className="empty">
              <p className="muted">Your saved data could not load.</p>
              <button
                className="primary"
                disabled={busy}
                onClick={() => run(refresh)}
              >
                RETRY
              </button>
            </div>
          ) : !state.profile ? (
            <div className="empty">
              <button className="primary" onClick={() => setView("onboarding")}>
                COMPLETE ONBOARDING
              </button>
            </div>
          ) : !state.premium ? (
            <section className="panel card">
              <span className="tag">YOUR BLUEPRINT IS SAVED</span>
              <h1>Invest in yourself.</h1>
              <p className="muted">
                Personalized plans. Daily tracking. AI photo estimates.
                <br />
                Your complete fitness space for ₹99 per month.
              </p>
              <div className="row">
                <ShieldCheck color="#ff3545" />
                <span className="muted">
                  Recurring subscription · No free trial
                </span>
              </div>
              <button
                className="primary"
                disabled={busy}
                onClick={() => run(subscribe)}
                style={{ marginTop: 25 }}
              >
                ACTIVATE PREMIUM <ArrowUpRight size={18} />
              </button>
              <p className="mini">
                Access unlocks only after server verification confirms an active
                subscription. Razorpay-supported recurring methods depend on
                merchant and customer eligibility.
              </p>
              <button
                className="secondary"
                disabled={busy}
                onClick={() => run(refresh)}
              >
                REFRESH PAYMENT STATUS
              </button>
              <button className="secondary" onClick={() => setModal("account")}>
                MANAGE SUBSCRIPTION & PHOTOS
              </button>
              {state.subscriptions.map((s) => (
                <p className="mini" key={s.id}>
                  Subscription status: {s.status}
                </p>
              ))}
            </section>
          ) : (
            <>
              <div className="row spread">
                <div>
                  <span className="tag">{day()} · YOUR DAILY EVOLUTION</span>
                  <h1>
                    {tab === "HOME"
                      ? `Let's build, ${user?.email?.split("@")[0] || "athlete"}.`
                      : tab === "DIET"
                        ? "Fuel the work."
                        : tab === "EXERCISE"
                          ? "Show up. Get stronger."
                          : "Small steps. Big change."}
                  </h1>
                </div>
                <div className="row">
                  <button
                    className="secondary"
                    onClick={() => {
                      setStep(0);
                      setView("onboarding");
                    }}
                  >
                    EDIT PREFERENCES
                  </button>
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() => run(refresh)}
                  >
                    REFRESH
                  </button>
                </div>
              </div>
              {!p ? (
                <div className="card empty">
                  <div className="icon" style={{ margin: "auto" }}>
                    <Zap />
                  </div>
                  <h2>Your blueprint. Your plan.</h2>
                  <p className="muted">
                    Generate your first workout and meal plan. You can skip the
                    optional body scan.
                  </p>
                  <div className="row" style={{ justifyContent: "center" }}>
                    <button
                      className="secondary"
                      onClick={() => {
                        setModal("body");
                        setConsent(false);
                      }}
                    >
                      OPTIONAL BODY SCAN
                    </button>
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() =>
                        run(async () => {
                          await api("generate", {});
                          await refresh();
                        })
                      }
                    >
                      {busy ? "GENERATING…" : "SKIP SCAN & GENERATE PLAN"}
                    </button>
                  </div>
                </div>
              ) : tab === "HOME" ? (
                <>
                  <div className="stats">
                    {[
                      {
                        label: "DAILY CALORIE TARGET",
                        value: Math.round(p.targets.calories),
                        unit: "kcal",
                        icon: Target,
                      },
                      {
                        label: "FUEL LOGGED",
                        value: Math.round(consumed),
                        unit: "kcal",
                        icon: Flame,
                      },
                      {
                        label: "REMAINING TODAY",
                        value: Math.round(
                          Math.max(0, p.targets.calories - consumed),
                        ),
                        unit: "kcal",
                        icon: Utensils,
                      },
                      {
                        label: "DAILY TASKS",
                        value: percent,
                        unit: "% complete",
                        icon: CheckCircle2,
                      },
                    ].map((s) => (
                      <article className="card stat" key={s.label}>
                        <div className="row spread">
                          <span className="tag">{s.label}</span>
                          <s.icon size={18} color="#ff3545" />
                        </div>
                        <strong>{s.value.toLocaleString()}</strong>
                        <small>{s.unit}</small>
                      </article>
                    ))}
                  </div>
                  <div className="section-head">
                    <h2>Make today count.</h2>
                    <span className="pill">CONSISTENCY OVER PERFECTION</span>
                  </div>
                  <div className="two">
                    <div className="card">
                      <span className="tag">YOUR TRAINING</span>
                      {(() => {
                        const todayWorkout = p.workouts.find(
                          (w) => w.day === (new Date().getDay() || 7),
                        );
                        return (
                          <>
                            <h3>{todayWorkout?.title || "Recovery day"}</h3>
                            <p>
                              {todayWorkout
                                ? todayWorkout.warmup
                                : "Rest, gentle movement and recovery. Your next session is in Exercise."}
                            </p>
                            {todayWorkout && (
                              <button
                                className="primary"
                                onClick={() => openWorkout(todayWorkout.title)}
                              >
                                LOG WORKOUT <ChevronRight size={16} />
                              </button>
                            )}
                          </>
                        );
                      })()}
                      <p className="mini">
                        {state.workouts.length} session(s) logged today
                      </p>
                    </div>
                    <div className="card">
                      <span className="tag">YOUR NUTRITION</span>
                      <h3>Fuel with purpose.</h3>
                      <div className="row spread">
                        {(["protein", "carbs", "fat"] as const).map((k) => (
                          <div key={k}>
                            <strong>{Math.round(p.targets[k])} g</strong>
                            <p>{k}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        className="secondary"
                        onClick={() => setModal("meal")}
                      >
                        LOG A MEAL{" "}
                        <Plus size={14} style={{ display: "inline" }} />
                      </button>
                    </div>
                    <div className="card">
                      <span className="tag">DAILY WINS</span>
                      <h3>
                        {tasks.filter((t) => t.completed).length} of{" "}
                        {tasks.length} tasks complete
                      </h3>
                      <div className="progress">
                        <div style={{ width: percent + "%" }} />
                      </div>
                      <button
                        className="secondary"
                        onClick={() => setTab("TO-DO")}
                      >
                        YOUR TO-DO LIST
                      </button>
                    </div>
                    <div className="card">
                      <span className="tag">WEIGHT PROGRESS</span>
                      <h3>
                        {state.weights.length
                          ? state.weights.at(-1)?.weight + " kg"
                          : "Start your progress story"}
                      </h3>
                      <p>
                        {state.weights.length > 1
                          ? `First logged: ${state.weights[0].weight} kg · Latest: ${state.weights.at(-1)?.weight} kg`
                          : "Log your weight at a pace that feels comfortable."}
                      </p>
                      <button
                        className="secondary"
                        onClick={() => setModal("weight")}
                      >
                        LOG WEIGHT
                      </button>
                    </div>
                  </div>
                </>
              ) : tab === "DIET" ? (
                <>
                  <div className="row" style={{ marginBottom: 24 }}>
                    <button
                      className="primary"
                      onClick={() => setModal("mess")}
                    >
                      EATING OUT / MESS MODE <Utensils size={16} />
                    </button>
                    <button
                      className="secondary"
                      onClick={() => {
                        setModal("photo");
                        setConsent(false);
                        setSnap(null);
                      }}
                    >
                      CALORIE SNAP{" "}
                      <Camera size={16} style={{ display: "inline" }} />
                    </button>
                    <button
                      className="secondary"
                      onClick={() => setModal("meal")}
                    >
                      MANUAL MEAL LOG
                    </button>
                  </div>
                  <p className="muted">
                    Nutrition and micronutrients are estimates, not laboratory
                    measurements. Ingredient quantities below are raw weights;
                    cooked yield varies.{" "}
                    {Math.round(Math.max(0, p.targets.calories - consumed))}{" "}
                    kcal remain today. Keep regular meals; no punitive exercise
                    or extreme restriction.
                  </p>
                  <div className="two">
                    {p.meals.map((original, i) => {
                      const scale = remainingMeals.includes(original)
                        ? mealScale
                        : 1;
                      const m = {
                        ...original,
                        ingredients: original.ingredients.map((x) => ({
                          ...x,
                          rawGrams: Math.round(x.rawGrams * scale),
                        })),
                        oilGrams: Math.round(original.oilGrams * scale),
                        nutrition: {
                          calories: original.nutrition.calories * scale,
                          protein: original.nutrition.protein * scale,
                          carbs: original.nutrition.carbs * scale,
                          fat: original.nutrition.fat * scale,
                        },
                      };
                      return (
                        <article className="card meal" key={i}>
                          <span className="tag">
                            MEAL {i + 1} · RAW INGREDIENT WEIGHTS
                          </span>
                          <h3>{m.name}</h3>
                          <span className="pill">
                            ≈ {Math.round(m.nutrition.calories)} kcal
                          </span>
                          <ul>
                            {m.ingredients.map((x, j) => (
                              <li key={j}>
                                {x.name} — {x.rawGrams} g raw
                              </li>
                            ))}
                            <li>Oil — {m.oilGrams} g</li>
                          </ul>
                          <div className="mini">
                            Protein {m.nutrition.protein} g · Carbs{" "}
                            {m.nutrition.carbs} g · Fat {m.nutrition.fat} g
                          </div>
                          <p>{m.instructions}</p>
                          <p>Micronutrients (estimated): {m.micronutrients}</p>
                          <button
                            className="secondary"
                            disabled={busy}
                            onClick={() =>
                              run(async () => {
                                await api("log", {
                                  kind: "meal",
                                  day: day(),
                                  data: {
                                    name: m.name,
                                    nutrition: m.nutrition,
                                    portion:
                                      "Recommended raw ingredient quantities",
                                  },
                                });
                                await refresh();
                              })
                            }
                          >
                            LOG THIS MEAL
                          </button>
                        </article>
                      );
                    })}
                  </div>
                  <h3>Logged today</h3>
                  {state.meals.map((m, i) => (
                    <p className="muted" key={i}>
                      {m.data.name} · ≈{Math.round(m.data.nutrition.calories)}{" "}
                      kcal
                    </p>
                  ))}
                </>
              ) : tab === "EXERCISE" ? (
                <>
                  <p className="muted">{p.notes}</p>
                  {p.workouts.map((w) => (
                    <article className="card meal" key={w.day}>
                      <div className="row spread">
                        <div>
                          <span className="tag">
                            DAY {w.day} · {pref.training}
                          </span>
                          <h3>{w.title}</h3>
                        </div>
                        <button
                          className="primary"
                          onClick={() => openWorkout(w.title)}
                        >
                          LOG SESSION <ArrowRight size={16} />
                        </button>
                      </div>
                      <p>
                        <b>Warm-up:</b> {w.warmup}
                      </p>
                      {w.exercises.map((e, i) => (
                        <details
                          key={i}
                          style={{
                            borderTop: "1px solid #303038",
                            padding: "15px 0",
                          }}
                        >
                          <summary style={{ cursor: "pointer" }}>
                            {e.name}{" "}
                            <span className="mini">
                              {" "}
                              · {e.sets} × {e.reps} · {e.restSeconds}s rest
                            </span>
                          </summary>
                          <p>{e.technique}</p>
                          <p>
                            Intensity: {e.intensity}
                            <br />
                            Progression: {e.progression}
                          </p>
                          {e.tutorialVideoId && (
                            <iframe
                              className="video"
                              title={e.name + " tutorial"}
                              src={
                                "https://www.youtube-nocookie.com/embed/" +
                                e.tutorialVideoId
                              }
                              loading="lazy"
                              sandbox="allow-scripts allow-same-origin allow-presentation"
                              allow="fullscreen; encrypted-media"
                              allowFullScreen
                              referrerPolicy="strict-origin-when-cross-origin"
                            />
                          )}
                          <a
                            className="secondary"
                            href={
                              "https://www.youtube.com/results?search_query=" +
                              encodeURIComponent(e.tutorialQuery)
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            FIND A YOUTUBE TUTORIAL ↗
                          </a>
                          <p className="mini">
                            Tutorial search links are provided until a suitable,
                            embeddable video is verified. Use the external link
                            if playback is unavailable.
                          </p>
                        </details>
                      ))}
                      <p>
                        <b>Recovery:</b> {w.recovery}
                      </p>
                    </article>
                  ))}
                  <h2>Training history</h2>
                  {state.history.length ? (
                    state.history.map((log) => (
                      <details className="card meal" key={log.id}>
                        <summary>
                          {log.day} · {log.data.title}
                        </summary>
                        <p>{log.data.recovery}</p>
                        {log.data.sets.map((s, i) => (
                          <p className="mini" key={i}>
                            {s.exercise}: {s.reps} reps · {s.weight} kg
                          </p>
                        ))}
                      </details>
                    ))
                  ) : (
                    <p className="muted">
                      Your completed sets will appear here.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="two">
                    <div className="card">
                      <span className="tag">YOUR DAILY CHECKLIST</span>
                      <form
                        className="row"
                        onSubmit={(e) => {
                          e.preventDefault();
                          run(async () => {
                            await api("task", {
                              day: day(),
                              title: taskTitle,
                              completed: false,
                            });
                            setTaskTitle("");
                            await refresh();
                          });
                        }}
                      >
                        <input
                          aria-label="New task"
                          placeholder="What's one thing you'll do today?"
                          maxLength={200}
                          required
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          style={{ flex: 1, marginTop: 20 }}
                        />
                        <button
                          className="primary"
                          disabled={busy}
                          aria-label="Add task"
                        >
                          <Plus size={18} />
                        </button>
                      </form>
                      {tasks.length ? (
                        tasks.map((t) => (
                          <div
                            className={"task " + (t.completed ? "done" : "")}
                            key={t.id}
                          >
                            <input
                              type="checkbox"
                              aria-label={"Complete " + t.title}
                              checked={t.completed}
                              disabled={busy}
                              onChange={() =>
                                run(async () => {
                                  await api("task", {
                                    ...t,
                                    day: day(),
                                    completed: !t.completed,
                                  });
                                  await refresh();
                                })
                              }
                            />
                            <span>{t.title}</span>
                            <button
                              onClick={() => {
                                const title = prompt("Edit task", t.title);
                                if (title)
                                  run(async () => {
                                    await api("task", {
                                      ...t,
                                      day: day(),
                                      title,
                                    });
                                    await refresh();
                                  });
                              }}
                            >
                              EDIT
                            </button>
                            <button
                              aria-label={"Delete " + t.title}
                              onClick={() =>
                                run(async () => {
                                  await api("task", {
                                    ...t,
                                    day: day(),
                                    remove: true,
                                  });
                                  await refresh();
                                })
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="muted">
                          A fresh page. Add your first daily task.
                        </p>
                      )}
                    </div>
                    <div className="card achievement">
                      <span className="tag">SHOW UP FOR YOURSELF</span>
                      <div>
                        <strong>{percent}%</strong>
                      </div>
                      <h2>
                        {percent === 100
                          ? "You did the work."
                          : "Every small win counts."}
                      </h2>
                      <p className="muted">
                        {tasks.filter((t) => t.completed).length} completed ·{" "}
                        {tasks.filter((t) => !t.completed).length} remaining
                      </p>
                      <div className="progress">
                        <div style={{ width: percent + "%" }} />
                      </div>
                      {percent === 100 && (
                        <button className="primary" onClick={shareAchievement}>
                          SAVE ACHIEVEMENT IMAGE
                        </button>
                      )}
                      <p className="mini">
                        Your share image includes only completion percentage and
                        date.
                      </p>
                    </div>
                  </div>
                </>
              )}
              {p && (
                <div className="row" style={{ marginTop: 30 }}>
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        await api("generate", {});
                        await refresh();
                      })
                    }
                  >
                    {busy ? "PLEASE WAIT…" : "REGENERATE PLAN"}
                  </button>
                  <button
                    className="secondary"
                    onClick={() => {
                      setModal("body");
                      setConsent(false);
                    }}
                  >
                    OPTIONAL BODY SCAN
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setModal("account")}
                  >
                    MANAGE SUBSCRIPTION & PHOTOS
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      )}
      {modal && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal"
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={modal}
          >
            <div className="row spread">
              <h2>
                {modal === "photo"
                  ? "Calorie Snap"
                  : modal === "body"
                    ? "Optional body scan"
                    : modal === "mess"
                      ? "Eating Out / Mess Mode"
                      : modal === "workout"
                        ? "Log your session"
                        : modal === "weight"
                          ? "Weight check-in"
                          : modal === "account"
                            ? "Your account"
                            : "Log a meal"}
              </h2>
              <button
                className="secondary"
                aria-label="Close dialog"
                onClick={() => setModal("")}
              >
                ×
              </button>
            </div>
            {modal === "photo" || modal === "body" ? (
              <>
                <p className="muted">
                  {modal === "body"
                    ? "Photo-based body-fat estimates are approximate, not medical measurements. This scan is optional. Photos are stored privately and can be deleted."
                    : "Food and portion identification is approximate. Correct the results before saving. Food photos are sent for analysis and are not stored by this app."}
                </p>
                <label htmlFor="photo">JPEG, PNG or WebP · under 5 MB</label>
                <input
                  id="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label className="row">
                  <input
                    style={{ width: 20, minHeight: 20 }}
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  I consent to sending this photo and relevant preferences to
                  Google Gemini for analysis.
                </label>
                <div className="row">
                  <button
                    className="primary"
                    disabled={busy || !file || !consent}
                    onClick={() =>
                      run(async () => {
                        const f = new FormData();
                        f.set("photo", file!);
                        f.set("consent", "yes");
                        const result = await api(modal, f);
                        if (modal === "photo") setSnap(result);
                        else {
                          setMessage(
                            `Approximate body-fat range: ${result.low}–${result.high}%. ${result.notice}`,
                          );
                          await refresh();
                          setModal("");
                        }
                      })
                    }
                  >
                    {busy ? "ANALYZING…" : "ANALYZE / RETRY"}
                  </button>
                  <button className="secondary" onClick={() => setModal("")}>
                    SKIP SCAN
                  </button>
                </div>
                {snap && (
                  <>
                    <p className="muted">{snap.uncertainty}</p>
                    {snap.foods.map((food, i) => (
                      <div key={i} className="card" style={{ marginTop: 12 }}>
                        <label>Detected food</label>
                        <input
                          value={food.name}
                          onChange={(e) =>
                            setSnap({
                              ...snap,
                              foods: snap.foods.map((f, j) =>
                                i === j ? { ...f, name: e.target.value } : f,
                              ),
                            })
                          }
                        />
                        <label>Estimated portion (grams)</label>
                        <input
                          type="number"
                          min={1}
                          value={food.grams}
                          onChange={(e) => {
                            const grams = Math.max(1, Number(e.target.value)),
                              ratio = grams / food.grams;
                            setSnap({
                              ...snap,
                              foods: snap.foods.map((f, j) =>
                                i === j
                                  ? {
                                      ...f,
                                      grams,
                                      nutrition: {
                                        calories: f.nutrition.calories * ratio,
                                        protein: f.nutrition.protein * ratio,
                                        carbs: f.nutrition.carbs * ratio,
                                        fat: f.nutrition.fat * ratio,
                                      },
                                    }
                                  : f,
                              ),
                            });
                          }}
                        />
                        <div className="form-grid">
                          {(
                            ["calories", "protein", "carbs", "fat"] as const
                          ).map((k) => (
                            <div key={k}>
                              <label>
                                {k} {k === "calories" ? "(kcal)" : "(g)"}
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={Math.round(food.nutrition[k])}
                                onChange={(e) =>
                                  setSnap({
                                    ...snap,
                                    foods: snap.foods.map((f, j) =>
                                      i === j
                                        ? {
                                            ...f,
                                            nutrition: {
                                              ...f.nutrition,
                                              [k]: Number(e.target.value),
                                            },
                                          }
                                        : f,
                                    ),
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      className="primary"
                      disabled={busy || !snap.foods.length}
                      onClick={() =>
                        run(async () => {
                          photoResult.parse(snap);
                          await api("log", {
                            kind: "meal",
                            day: day(),
                            data: {
                              name: snap.foods
                                .map((f) => f.name)
                                .join(" + ")
                                .slice(0, 200),
                              nutrition: snap.foods.reduce(
                                (sum, f) => ({
                                  calories: sum.calories + f.nutrition.calories,
                                  protein: sum.protein + f.nutrition.protein,
                                  carbs: sum.carbs + f.nutrition.carbs,
                                  fat: sum.fat + f.nutrition.fat,
                                }),
                                { calories: 0, protein: 0, carbs: 0, fat: 0 },
                              ),
                              portion:
                                snap.foods
                                  .map((f) => f.name + ": " + f.grams + " g")
                                  .join(", ")
                                  .slice(0, 450) +
                                " (photo estimate, confirmed)",
                            },
                          });
                          await refresh();
                          setModal("");
                        })
                      }
                      style={{ marginTop: 20 }}
                    >
                      CONFIRM & SAVE MEAL
                    </button>
                  </>
                )}
              </>
            ) : modal === "meal" || modal === "mess" ? (
              <>
                <p className="muted">
                  {modal === "mess"
                    ? "Choose a dish and estimate its portion. These are broad estimates; adjust for recipe and oil. Continue regular meals after eating out."
                    : "Enter nutrition from a label or reliable food composition source. Estimates are welcome."}
                </p>
                {modal === "mess" ? (
                  <>
                    <label>Common dish</label>
                    <Choices
                      values={[
                        "Rice",
                        "Watery dal",
                        "Roti",
                        "Sambar",
                        "Curry",
                        "Eggs",
                        "Dosa",
                        "Idli",
                        "Fried foods",
                        "Other",
                      ]}
                      value={mealName}
                      onChange={(v) => {
                        setMealName(v);
                        const sample: Record<string, number[]> = {
                          Rice: [130, 2.7, 28, 0.3],
                          "Watery dal": [65, 3.5, 10, 1.3],
                          Roti: [260, 8, 50, 3],
                          Sambar: [60, 3, 8, 2],
                          Curry: [120, 3, 12, 7],
                          Eggs: [155, 13, 1, 11],
                          Dosa: [170, 4, 28, 5],
                          Idli: [130, 4, 26, 1],
                          "Fried foods": [350, 5, 35, 21],
                          Other: [100, 3, 15, 3],
                        };
                        const a = sample[v];
                        setPortion(100);
                        setMealNutrition({
                          calories: a[0],
                          protein: a[1],
                          carbs: a[2],
                          fat: a[3],
                        });
                      }}
                    />
                  </>
                ) : null}
                <label htmlFor="mealName">Dish / meal name</label>
                <input
                  id="mealName"
                  value={mealName}
                  maxLength={200}
                  onChange={(e) => setMealName(e.target.value)}
                />
                <label htmlFor="portion">
                  Estimated cooked serving weight (grams)
                </label>
                <input
                  id="portion"
                  type="number"
                  min={1}
                  max={5000}
                  value={portion}
                  onChange={(e) => {
                    const n = Math.max(1, Number(e.target.value)),
                      ratio = n / portion;
                    setPortion(n);
                    setMealNutrition({
                      calories: mealNutrition.calories * ratio,
                      protein: mealNutrition.protein * ratio,
                      carbs: mealNutrition.carbs * ratio,
                      fat: mealNutrition.fat * ratio,
                    });
                  }}
                />
                <div className="form-grid">
                  {(["calories", "protein", "carbs", "fat"] as const).map(
                    (k) => (
                      <div key={k}>
                        <label htmlFor={"meal-" + k}>
                          {k} {k === "calories" ? "(kcal)" : "(g)"}
                        </label>
                        <input
                          id={"meal-" + k}
                          type="number"
                          min={0}
                          value={Math.round(mealNutrition[k])}
                          onChange={(e) =>
                            setMealNutrition({
                              ...mealNutrition,
                              [k]: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    ),
                  )}
                </div>
                <p className="mini">
                  Mess presets are rough cooked-food averages. Roti, idli and
                  eggs vary by size; use grams. Oil and preparation can change
                  calories substantially.
                </p>
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await api("log", {
                        kind: "meal",
                        day: day(),
                        data: {
                          name: mealName,
                          nutrition: mealNutrition,
                          portion: portion + " g cooked (estimated)",
                        },
                      });
                      await refresh();
                      setModal("");
                      setMessage(
                        "Meal saved. Remaining calories updated; keep your next meals balanced.",
                      );
                    })
                  }
                >
                  SAVE MEAL
                </button>
              </>
            ) : modal === "workout" ? (
              <>
                <p className="muted">
                  {mealName} · Enter actual results for each set. Only enter
                  completed sets (reps greater than zero).
                </p>
                <div className="workset mini">
                  <span>EXERCISE / SET</span>
                  <span>REPS</span>
                  <span>KG</span>
                </div>
                {sets.map((s, i) => (
                  <div className="workset" key={i}>
                    <span className="mini">
                      {s.exercise} · {i + 1}
                    </span>
                    <input
                      aria-label={s.exercise + " reps set " + (i + 1)}
                      type="number"
                      min={0}
                      value={s.reps}
                      onChange={(e) =>
                        setSets(
                          sets.map((v, j) =>
                            i === j
                              ? { ...v, reps: Number(e.target.value) }
                              : v,
                          ),
                        )
                      }
                    />
                    <input
                      aria-label={s.exercise + " weight set " + (i + 1)}
                      type="number"
                      min={0}
                      value={s.weight}
                      onChange={(e) =>
                        setSets(
                          sets.map((v, j) =>
                            i === j
                              ? { ...v, weight: Number(e.target.value) }
                              : v,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
                <label htmlFor="recovery">Recovery feedback / difficulty</label>
                <textarea
                  id="recovery"
                  maxLength={1000}
                  value={recovery}
                  onChange={(e) => setRecovery(e.target.value)}
                  placeholder="How did you feel? Pain, fatigue, or repetitions in reserve?"
                />
                <button
                  className="primary"
                  disabled={busy || !sets.some((s) => s.reps > 0)}
                  onClick={() =>
                    run(async () => {
                      await api("log", {
                        kind: "workout",
                        day: day(),
                        data: {
                          title: mealName,
                          recovery,
                          sets: sets.filter((s) => s.reps > 0),
                        },
                      });
                      await refresh();
                      setModal("");
                    })
                  }
                >
                  SAVE COMPLETED SETS
                </button>
              </>
            ) : modal === "weight" ? (
              <>
                <label htmlFor="weightLog">Weight in kilograms</label>
                <input
                  id="weightLog"
                  type="number"
                  min={30}
                  max={300}
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
                <button
                  className="primary"
                  style={{ marginTop: 20 }}
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await api("log", {
                        kind: "weight",
                        day: day(),
                        data: weight,
                      });
                      await refresh();
                      setModal("");
                    })
                  }
                >
                  SAVE WEIGHT
                </button>
              </>
            ) : (
              <>
                <h3>Subscriptions</h3>
                {state?.subscriptions.map((s) => (
                  <div key={s.id}>
                    <p className="muted">Status: {s.status}</p>
                    {[
                      "active",
                      "authenticated",
                      "pending",
                      "created",
                      "halted",
                      "paused",
                    ].includes(s.status) && (
                      <button
                        className="secondary"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await api("cancel", { id: s.id });
                            await refresh();
                            setMessage(
                              "Cancellation requested for the end of the billing cycle.",
                            );
                          })
                        }
                      >
                        CANCEL RECURRING PAYMENTS
                      </button>
                    )}
                  </div>
                ))}
                <h3>Private body scans</h3>
                {state?.analyses.length ? (
                  state.analyses.map((a) => (
                    <div className="row spread" key={a.id}>
                      <p className="muted">
                        Approximate range {a.result.low}–{a.result.high}%
                      </p>
                      <button
                        className="secondary"
                        disabled={busy}
                        onClick={() =>
                          run(async () => {
                            await api("delete-body", { id: a.id });
                            await refresh();
                          })
                        }
                      >
                        DELETE PHOTO & RESULT
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="muted">No stored body photos.</p>
                )}
              </>
            )}
          </section>
        </div>
      )}
      <footer className="footer">
        <span>BEINGWELL © {new Date().getFullYear()}</span>
        <span>BE WELL. BUILD YOURSELF.</span>
        <span>Fitness guidance. Not medical advice.</span>
      </footer>
    </div>
  );
}
