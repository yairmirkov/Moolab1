import App from "../App";

export default function Feed() {
  const ageGroup = localStorage.getItem("ws_ageGroup") || "Teens";
  return <App demoMode={true} demoAgeGroup={ageGroup} />;
}
