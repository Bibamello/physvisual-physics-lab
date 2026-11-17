export const PRICES = {
  monthly: 12,
  yearly: 115, // billed once per year (20% off 12 × 12)
};

export const PLAN_FEATURES = {
  free: [
    "4 core simulations",
    "Live graphs and formula panel",
    "Save up to 10 experiments",
    "Community presets",
  ],
  premium: [
    "All 5 simulations, incl. Inclined Plane",
    "Unlimited saved experiments",
    "CSV export of every graph",
    "Classroom links for up to 40 students",
    "Step-by-step worked solutions",
    "Priority support",
  ],
};

export const COMPARISON: { feature: string; free: string | boolean; premium: string | boolean }[] = [
  { feature: "Simulations", free: "4 of 5", premium: "All 5" },
  { feature: "Real-time parameter controls", free: true, premium: true },
  { feature: "Live position & velocity graphs", free: true, premium: true },
  { feature: "Formula & calculation panel", free: true, premium: true },
  { feature: "Saved experiments", free: "10", premium: "Unlimited" },
  { feature: "CSV data export", free: false, premium: true },
  { feature: "Classroom sharing", free: false, premium: "Up to 40 students" },
  { feature: "Worked solutions", free: false, premium: true },
  { feature: "Support", free: "Community", premium: "Priority, < 24 h" },
];
