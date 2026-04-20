export type GradeOption = {
  id: string;
  labelEn: string;
  labelEs: string;
  ageGroup: "Kids" | "Teens" | "Adults";
  apiBucket: "8-12" | "13-15" | "16-18";
  age: number;
};

export const GRADE_OPTIONS: GradeOption[] = [
  { id: "K",       labelEn: "Kindergarten", labelEs: "Kinder",         ageGroup: "Kids",   apiBucket: "8-12",  age: 5 },
  { id: "1",       labelEn: "1st Grade",    labelEs: "1.º Grado",      ageGroup: "Kids",   apiBucket: "8-12",  age: 6 },
  { id: "2",       labelEn: "2nd Grade",    labelEs: "2.º Grado",      ageGroup: "Kids",   apiBucket: "8-12",  age: 7 },
  { id: "3",       labelEn: "3rd Grade",    labelEs: "3.º Grado",      ageGroup: "Kids",   apiBucket: "8-12",  age: 8 },
  { id: "4",       labelEn: "4th Grade",    labelEs: "4.º Grado",      ageGroup: "Kids",   apiBucket: "8-12",  age: 9 },
  { id: "5",       labelEn: "5th Grade",    labelEs: "5.º Grado",      ageGroup: "Kids",   apiBucket: "8-12",  age: 10 },
  { id: "6",       labelEn: "6th Grade",    labelEs: "6.º Grado",      ageGroup: "Teens",  apiBucket: "13-15", age: 11 },
  { id: "7",       labelEn: "7th Grade",    labelEs: "7.º Grado",      ageGroup: "Teens",  apiBucket: "13-15", age: 12 },
  { id: "8",       labelEn: "8th Grade",    labelEs: "8.º Grado",      ageGroup: "Teens",  apiBucket: "13-15", age: 13 },
  { id: "9",       labelEn: "9th Grade",    labelEs: "9.º Grado",      ageGroup: "Teens",  apiBucket: "13-15", age: 14 },
  { id: "10",      labelEn: "10th Grade",   labelEs: "10.º Grado",     ageGroup: "Teens",  apiBucket: "13-15", age: 15 },
  { id: "11",      labelEn: "11th Grade",   labelEs: "11.º Grado",     ageGroup: "Adults", apiBucket: "16-18", age: 16 },
  { id: "12",      labelEn: "12th Grade",   labelEs: "12.º Grado",     ageGroup: "Adults", apiBucket: "16-18", age: 17 },
  { id: "college", labelEn: "College",      labelEs: "Universidad",    ageGroup: "Adults", apiBucket: "16-18", age: 20 },
  { id: "adult",   labelEn: "Adult",        labelEs: "Adulto",         ageGroup: "Adults", apiBucket: "16-18", age: 30 },
];

export function getGradeOption(id: string): GradeOption {
  return GRADE_OPTIONS.find((g) => g.id === id) || GRADE_OPTIONS[6];
}

export function birthYearForGrade(id: string, refYear: number = new Date().getFullYear()): string {
  const g = getGradeOption(id);
  return String(refYear - g.age);
}

export function gradeLabel(id: string, lang: "en" | "es"): string {
  const g = getGradeOption(id);
  return lang === "es" ? g.labelEs : g.labelEn;
}

export function gradeFromApiBucket(bucket: string): string {
  if (bucket === "8-12") return "3";
  if (bucket === "13-15") return "8";
  if (bucket === "16-18") return "11";
  return "8";
}

export type SkillLevel = "beginner" | "intermediate" | "expert";

export const SKILL_LEVELS: Array<{ id: SkillLevel; labelEn: string; labelEs: string; descEn: string; descEs: string }> = [
  { id: "beginner",     labelEn: "Beginner",     labelEs: "Principiante", descEn: "No financial background yet — start from scratch.", descEs: "Sin experiencia financiera — empezar desde cero." },
  { id: "intermediate", labelEn: "Intermediate", labelEs: "Intermedio",   descEn: "Knows the basics — push into mechanics.",          descEs: "Conoce lo básico — profundizar en mecánicas." },
  { id: "expert",       labelEn: "Expert",       labelEs: "Experto",      descEn: "Solid foundation — go advanced.",                  descEs: "Base sólida — ir a nivel avanzado." },
];

export function nextGradeId(id: string): string | null {
  const idx = GRADE_OPTIONS.findIndex((g) => g.id === id);
  if (idx === -1 || idx >= GRADE_OPTIONS.length - 1) return null;
  return GRADE_OPTIONS[idx + 1].id;
}

export function shouldPromptGradePromotion(child: { grade?: string | null; gradeUpdatedAt?: string | Date | null }): boolean {
  if (!child.grade) return false;
  if (child.grade === "college" || child.grade === "adult") return false;
  const now = new Date();
  const month = now.getMonth();
  if (month < 7 || month > 9) return false;
  const lastUpdate = child.gradeUpdatedAt ? new Date(child.gradeUpdatedAt) : null;
  if (!lastUpdate) return true;
  const juneFirstThisYear = new Date(now.getFullYear(), 5, 1);
  return lastUpdate.getTime() < juneFirstThisYear.getTime();
}
