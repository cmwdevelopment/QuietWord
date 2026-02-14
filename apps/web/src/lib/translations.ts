export const TRANSLATION_LABELS: Record<string, string> = {
  WEB: "World English Bible",
  KJV: "King James Version",
  ASV: "American Standard Version",
  BBE: "Bible in Basic English",
  DARBY: "Darby Translation",
  AMP: "Amplified Bible",
  ESV: "English Standard Version",
  MSG: "The Message",
  NASB: "New American Standard Bible",
  NIRV: "New International Reader's Version",
  NKJV: "New King James Version",
  NLT: "New Living Translation",
  NIV: "New International Version",
};

export const DEFAULT_TRANSLATIONS = Object.keys(TRANSLATION_LABELS);

export function translationLabel(code: string): string {
  return TRANSLATION_LABELS[code] ?? code;
}
