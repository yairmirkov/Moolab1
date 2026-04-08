import { useNavigate } from "react-router-dom";
import LandingPage from "../LandingPage";
import LandingPageES from "../LandingPageES";

export default function Home() {
  const navigate = useNavigate();
  const langParam = new URLSearchParams(window.location.search).get("lang");

  const handleParentLogin = () => navigate("/login");
  const handleTestApp = () => navigate("/demo");

  if (langParam === "es") {
    return <LandingPageES onParentLogin={handleParentLogin} onTestApp={handleTestApp} />;
  }

  return <LandingPage onParentLogin={handleParentLogin} onTestApp={handleTestApp} />;
}
