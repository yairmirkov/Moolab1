import { useSearchParams } from "react-router-dom";
import App from "../App";

export default function Feed() {
  const [searchParams] = useSearchParams();
  const ageGroup = localStorage.getItem("ws_ageGroup") || "Teens";
  const langParam = searchParams.get("lang");

  if (langParam === "es" || langParam === "en") {
    localStorage.setItem("ws_lang", langParam);
  }

  return <App demoMode={true} demoAgeGroup={ageGroup} />;
}
