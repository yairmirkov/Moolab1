import { useNavigate } from "react-router-dom";
import LandingPage from "../LandingPage";
import LandingPageES from "../LandingPageES";

export default function Home() {
  const navigate = useNavigate();
  const urlLang = new URLSearchParams(window.location.search).get("lang");
  const storedLang = localStorage.getItem("ws_lang");
  const effectiveLang = urlLang === "es" || urlLang === "en" ? urlLang : storedLang === "es" ? "es" : "en";

  if (storedLang !== effectiveLang) {
    localStorage.setItem("ws_lang", effectiveLang);
  }

  const langSuffix = effectiveLang === "es" ? "?lang=es" : "";

  const handleParentLogin = () => navigate(`/login${langSuffix}`);
  const handleTestApp = () => navigate(`/demo${langSuffix}`);

  if (effectiveLang === "es") {
    return <LandingPageES onParentLogin={handleParentLogin} onTestApp={handleTestApp} />;
  }

  return <LandingPage onParentLogin={handleParentLogin} onTestApp={handleTestApp} />;
}
