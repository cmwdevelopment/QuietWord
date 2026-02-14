export type FontOption = {
  value: string;
  label: string;
  category: "Sans Serif" | "Serif";
};

export const FONT_OPTIONS: FontOption[] = [
  { value: "Inter", label: "Inter", category: "Sans Serif" },
  { value: "Roboto", label: "Roboto", category: "Sans Serif" },
  { value: "Open Sans", label: "Open Sans", category: "Sans Serif" },
  { value: "Lato", label: "Lato", category: "Sans Serif" },
  { value: "Montserrat", label: "Montserrat", category: "Sans Serif" },
  { value: "Merriweather", label: "Merriweather", category: "Serif" },
  { value: "Lora", label: "Lora", category: "Serif" },
  { value: "PT Serif", label: "PT Serif", category: "Serif" },
  { value: "Playfair Display", label: "Playfair Display", category: "Serif" }
];

export const DEFAULT_FONT = "Roboto";
const STORAGE_KEY = "quietword_font_family";

export function saveFontPreference(fontFamily: string): void {
  localStorage.setItem(STORAGE_KEY, fontFamily);
}

export function getSavedFontPreference(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_FONT;
}

export function applyFontPreference(fontFamily: string): void {
  document.documentElement.style.setProperty("--font-family", `\"${fontFamily}\", sans-serif`);

  const selected = FONT_OPTIONS.find((x) => x.value === fontFamily);
  if (selected?.category === "Serif") {
    document.documentElement.style.setProperty("--font-family", `\"${fontFamily}\", serif`);
  }
}
