import { useNavigate } from "react-router-dom";
import LandingPage from "../LandingPage";
import LandingPageES from "../LandingPageES";

export default function Home() {
  const navigate = useNavigate();
  const langParam = new URLSearchParams(window.location.search).get("lang");
  const langSuffix = langParam === "es" ? "?lang=es" : "";

  const handleParentLogin = () => navigate(`/login${langSuffix}`);
  const handleTestApp = () => navigate(`/demo${langSuffix}`);

  if (langParam === "es") {
    return <LandingPageES onParentLogin={handleParentLogin} onTestApp={handleTestApp} />;
  }

  return <LandingPage onParentLogin={handleParentLogin} onTestApp={handleTestApp} />;
}
