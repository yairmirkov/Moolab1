import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import App from "../App";

export default function Feed() {
  const [searchParams] = useSearchParams();
  const ageGroup = localStorage.getItem("ws_ageGroup") || "Teens";
  const langParam = searchParams.get("lang");

  useEffect(() => {
    if (langParam === "es") localStorage.setItem("ws_lang", "es");
  }, [langParam]);

  return <App demoMode={true} demoAgeGroup={ageGroup} />;
}
