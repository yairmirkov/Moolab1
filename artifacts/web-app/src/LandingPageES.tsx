import LandingPage from "./LandingPage";

export default function LandingPageES(props: any) {
  // Language is handled inside LandingPage via useLang() — no separate ES version needed
  return <LandingPage {...props} />;
}
