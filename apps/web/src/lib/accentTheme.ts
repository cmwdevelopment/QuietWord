export type AccentOption = {
  value: string;
  label: string;
  colors: {
    primary: string;
    primaryHover: string;
    accent: string;
    accentSecondary: string;
    ring: string;
    glowPrimary: string;
    glowAccent: string;
  };
};

export const ACCENT_OPTIONS: AccentOption[] = [
  {
    value: "teal_calm",
    label: "Teal Calm",
    colors: {
      primary: "#5EEAD4",
      primaryHover: "#2DD4BF",
      accent: "#22D3EE",
      accentSecondary: "#67E8F9",
      ring: "#5EEAD4",
      glowPrimary: "0 0 24px rgba(94, 234, 212, 0.3)",
      glowAccent: "0 0 24px rgba(34, 211, 238, 0.3)",
    },
  },
  {
    value: "sage_mist",
    label: "Sage Mist",
    colors: {
      primary: "#8BC7A4",
      primaryHover: "#6EAF8A",
      accent: "#A4D4AE",
      accentSecondary: "#C1E4C8",
      ring: "#8BC7A4",
      glowPrimary: "0 0 24px rgba(139, 199, 164, 0.3)",
      glowAccent: "0 0 24px rgba(164, 212, 174, 0.3)",
    },
  },
  {
    value: "sky_blue",
    label: "Sky Blue",
    colors: {
      primary: "#7CC4FA",
      primaryHover: "#56AEEF",
      accent: "#9AD8FF",
      accentSecondary: "#C0E9FF",
      ring: "#7CC4FA",
      glowPrimary: "0 0 24px rgba(124, 196, 250, 0.3)",
      glowAccent: "0 0 24px rgba(154, 216, 255, 0.3)",
    },
  },
  {
    value: "lavender_hush",
    label: "Lavender Hush",
    colors: {
      primary: "#B8A5E3",
      primaryHover: "#A18BD6",
      accent: "#CBBBF0",
      accentSecondary: "#DDD2F7",
      ring: "#B8A5E3",
      glowPrimary: "0 0 24px rgba(184, 165, 227, 0.3)",
      glowAccent: "0 0 24px rgba(203, 187, 240, 0.3)",
    },
  },
  {
    value: "rose_dawn",
    label: "Rose Dawn",
    colors: {
      primary: "#E7AAB8",
      primaryHover: "#DB8D9F",
      accent: "#F1BFCA",
      accentSecondary: "#F7D7DF",
      ring: "#E7AAB8",
      glowPrimary: "0 0 24px rgba(231, 170, 184, 0.3)",
      glowAccent: "0 0 24px rgba(241, 191, 202, 0.3)",
    },
  },
  {
    value: "sand_warm",
    label: "Sand Warm",
    colors: {
      primary: "#DDB47A",
      primaryHover: "#CF9C58",
      accent: "#EBC690",
      accentSecondary: "#F2DDB6",
      ring: "#DDB47A",
      glowPrimary: "0 0 24px rgba(221, 180, 122, 0.3)",
      glowAccent: "0 0 24px rgba(235, 198, 144, 0.3)",
    },
  },
];

export const DEFAULT_ACCENT = "teal_calm";
const STORAGE_KEY = "quietword_accent_color";

export function saveAccentPreference(value: string): void {
  localStorage.setItem(STORAGE_KEY, value);
}

export function getSavedAccentPreference(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_ACCENT;
}

export function applyAccentPreference(value: string): void {
  const selected = ACCENT_OPTIONS.find((x) => x.value === value) ?? ACCENT_OPTIONS[0];
  const root = document.documentElement;

  root.style.setProperty("--primary", selected.colors.primary);
  root.style.setProperty("--primary-hover", selected.colors.primaryHover);
  root.style.setProperty("--accent", selected.colors.accent);
  root.style.setProperty("--accent-secondary", selected.colors.accentSecondary);
  root.style.setProperty("--ring", selected.colors.ring);
  root.style.setProperty("--glow-primary", selected.colors.glowPrimary);
  root.style.setProperty("--glow-accent", selected.colors.glowAccent);
  root.style.setProperty("--sidebar-primary", selected.colors.primary);
  root.style.setProperty("--chart-1", selected.colors.primary);
  root.style.setProperty("--chart-2", selected.colors.accent);
  root.style.setProperty("--chart-3", selected.colors.accentSecondary);
}
