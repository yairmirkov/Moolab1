import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Lang } from "./translations";
import translations from "./translations";

export function useLang(): Lang {
  const [searchParams] = useSearchParams();
  return useMemo(() => {
    const urlLang = searchParams.get("lang");
    if (urlLang === "es") return "es";
    if (urlLang === "en") return "en";
    const stored = localStorage.getItem("ws_lang");
    if (stored === "es") return "es";
    return "en";
  }, [searchParams]);
}

export function useLangSuffix(): string {
  const lang = useLang();
  return lang === "es" ? "?lang=es" : "";
}

export function t(
  obj: { en: string; es: string } | undefined,
  lang: Lang
): string {
  if (!obj) return "";
  return obj[lang] || obj.en;
}

export { translations };
